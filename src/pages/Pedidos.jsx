import { useState } from 'react'
import { usePedidos, useClientes, useProdutos, useReceitas, useIngredientes, genId, fmtBRL, CANAIS, STATUS_PEDIDO } from '../lib/store.js'

const COLS = [
  { key: 'pendente', label: 'Pendente', icon: 'ti-clock' },
  { key: 'producao', label: 'Em produção', icon: 'ti-chef-hat' },
  { key: 'pronto', label: 'Pronto', icon: 'ti-package' },
  { key: 'entregue', label: 'Entregue', icon: 'ti-circle-check' },
]

export default function Pedidos() {
  const [pedidos, setPedidos] = usePedidos()
  const [receitas] = useReceitas()
  const [ingredientes, setIngredientes] = useIngredientes()
  const [clientes] = useClientes()
  const [produtos] = useProdutos()
  const [view, setView] = useState('kanban')
  const [search, setSearch] = useState('')
  const [filterCanal, setFilterCanal] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [itens, setItens] = useState([])

  const filtered = pedidos.filter(p => {
    const q = search.toLowerCase()
    return (!q || p.cliente_nome?.toLowerCase().includes(q)) && (!filterCanal || p.canal === filterCanal)
  })

  function openNew() {
    setForm({ canal: 'instagram', status: 'pendente', urgente: false })
    setItens([{ produto_id: '', produto_nome: '', quantidade: 1, preco_unitario: 0 }])
    setModal('new')
  }

  function openEdit(p) { setForm({ ...p }); setItens(p.itens ? [...p.itens] : []); setModal(p) }

  function save() {
    const valor_total = itens.reduce((s, i) => s + (i.quantidade * i.preco_unitario), 0)
    const pedido = { ...form, valor_total, itens, id: form.id || genId() }
    if (modal === 'new') setPedidos([pedido, ...pedidos])
    else setPedidos(pedidos.map(p => p.id === pedido.id ? pedido : p))
    setModal(null)
  }

  function del(id) {
    if (!confirm('Excluir pedido? O estoque não será reposto.')) return
    setPedidos(pedidos.filter(p => p.id !== id))
    setModal(null)
  }

  function cancelar(id) {
    const pedido = pedidos.find(p => p.id === id)
    if (!pedido) return
    if (!confirm('Cancelar pedido? Se estava "Pronto", o estoque será reposto.')) return

    if (pedido.status === 'pronto') {
      const novosIngredientes = JSON.parse(localStorage.getItem('erp_ingredientes') || '[]')
      const receitasAtuais = JSON.parse(localStorage.getItem('erp_receitas') || '[]')

      for (const item of pedido.itens || []) {
        const receitasProd = receitasAtuais.filter(r => r.produto_id === item.produto_id)
        for (const r of receitasProd) {
          const idx = novosIngredientes.findIndex(i => i.id === r.ingrediente_id)
          if (idx !== -1) {
            const reposicao = r.quantidade * item.quantidade
            novosIngredientes[idx] = {
              ...novosIngredientes[idx],
              quantidade: novosIngredientes[idx].quantidade + reposicao
            }
          }
        }
      }

      localStorage.setItem('erp_ingredientes', JSON.stringify(novosIngredientes))
      setIngredientes(novosIngredientes)
    }

    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'cancelado' } : p))
    setModal(null)
  }

  function avancar(id) {
    const next = { pendente: 'producao', producao: 'pronto', pronto: 'entregue' }
    const pedido = pedidos.find(p => p.id === id)
    if (!pedido || !next[pedido.status]) return

    const novoStatus = next[pedido.status]

    if (novoStatus === 'pronto') {
      const novosIngredientes = JSON.parse(localStorage.getItem('erp_ingredientes') || '[]')
      const receitasAtuais = JSON.parse(localStorage.getItem('erp_receitas') || '[]')

      for (const item of pedido.itens || []) {
        const receitasProd = receitasAtuais.filter(r => r.produto_id === item.produto_id)
        for (const r of receitasProd) {
          const idx = novosIngredientes.findIndex(i => i.id === r.ingrediente_id)
          if (idx !== -1) {
            const desconto = r.quantidade * item.quantidade
            novosIngredientes[idx] = {
              ...novosIngredientes[idx],
              quantidade: Math.max(0, novosIngredientes[idx].quantidade - desconto)
            }
          }
        }
      }

      localStorage.setItem('erp_ingredientes', JSON.stringify(novosIngredientes))
      setIngredientes(novosIngredientes)
    }

    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p))
    setModal(null)
  }

  function addItem() { setItens([...itens, { produto_id: '', produto_nome: '', quantidade: 1, preco_unitario: 0 }]) }

  function updateItem(idx, field, val) {
    const arr = [...itens]
    arr[idx] = { ...arr[idx], [field]: val }
    if (field === 'produto_id') {
      const prod = produtos.find(p => p.id === val)
      if (prod) { arr[idx].produto_nome = prod.nome; arr[idx].preco_unitario = prod.preco_venda }
    }
    setItens(arr)
  }

  function removeItem(idx) { setItens(itens.filter((_, i) => i !== idx)) }

  const valorTotal = itens.reduce((s, i) => s + (Number(i.quantidade) * Number(i.preco_unitario)), 0)

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pedidos</h1>
        <p className="page-subtitle">Gerencie todos os seus pedidos e encomendas</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <input className="search-input" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ height: 38, width: 160 }} value={filterCanal} onChange={e => setFilterCanal(e.target.value)}>
              <option value="">Todos os canais</option>
              {Object.entries(CANAIS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => setView('kanban')} style={view === 'kanban' ? { background: 'var(--bg3)' } : {}}><i className="ti ti-layout-kanban" /> Kanban</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setView('lista')} style={view === 'lista' ? { background: 'var(--bg3)' } : {}}><i className="ti ti-list" /> Lista</button>
          </div>
          <button className="btn btn-primary" onClick={openNew}><i className="ti ti-plus" /> Novo pedido</button>
        </div>
        {view === 'kanban' ? (
          <div className="kanban">
            {COLS.map(col => {
              const items = filtered.filter(p => p.status === col.key)
              return (
                <div key={col.key} className="kanban-col">
                  <div className="kanban-col-header">
                    <span><i className={`ti ${col.icon}`} style={{ marginRight: 5, fontSize: 13 }} />{col.label}</span>
                    <span className="kanban-count">{items.length}</span>
                  </div>
                  {items.length === 0 && <div className="empty" style={{ padding: '20px 10px' }}><i className="ti ti-inbox" style={{ fontSize: 22 }} /><p>Vazio</p></div>}
                  {items.map(p => (
                    <div key={p.id} className={`kanban-card${p.urgente ? ' urgente' : ''}`} onClick={() => openEdit(p)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                          {p.urgente && <i className="ti ti-flame" style={{ color: 'var(--accent)', marginRight: 3, fontSize: 12 }} />}
                          {p.cliente_nome}
                        </span>
                        <span className={`badge badge-${p.canal}`} style={{ fontSize: 10 }}>{CANAIS[p.canal]?.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{p.itens?.slice(0,2).map(i => `${i.quantidade}x ${i.produto_nome}`).join(', ')}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text3)' }}><i className="ti ti-calendar" style={{ fontSize: 11, marginRight: 2 }} />{p.data_entrega ? p.data_entrega.split('-').reverse().join('/') : '—'}</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{fmtBRL(p.valor_total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Canal</th><th>Itens</th><th>Entrega</th><th>Valor</th><th>Status</th><th></th></tr></thead>
              <tbody>{filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.urgente && <i className="ti ti-flame" style={{ color: 'var(--accent)', marginRight: 4, fontSize: 12 }} />}{p.cliente_nome}</td>
                  <td><span className={`badge ${CANAIS[p.canal]?.cls}`}>{CANAIS[p.canal]?.label}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text2)' }}>{p.itens?.slice(0,2).map(i => `${i.quantidade}x ${i.produto_nome}`).join(', ')}</td>
                  <td style={{ color: 'var(--text2)' }}>{p.data_entrega ? p.data_entrega.split('-').reverse().join('/') : '—'}</td>
                  <td style={{ fontWeight: 500 }}>{fmtBRL(p.valor_total)}</td>
                  <td><span className={`badge ${STATUS_PEDIDO[p.status]?.cls}`}>{STATUS_PEDIDO[p.status]?.label}</span></td>
                  <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)}><i className="ti ti-edit" /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-title">{modal === 'new' ? 'Novo pedido' : 'Editar pedido'}</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Canal de venda</label>
                <select value={form.canal || ''} onChange={e => setForm({ ...form, canal: e.target.value })}>
                  {Object.entries(CANAIS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status || 'pendente'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(STATUS_PEDIDO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <input value={form.cliente_nome || ''} onChange={e => setForm({ ...form, cliente_nome: e.target.value })} placeholder="Nome do cliente ou pedido" />
              </div>
              <div className="form-group">
                <label className="form-label">Data de entrega</label>
                <input type="date" value={form.data_entrega || ''} onChange={e => setForm({ ...form, data_entrega: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Itens do pedido</label>
              {itens.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 30px', gap: 6, marginBottom: 6 }}>
                  <select value={item.produto_id} onChange={e => updateItem(idx, 'produto_id', e.target.value)}>
                    <option value="">Selecione um produto</option>
                    {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantidade} onChange={e => updateItem(idx, 'quantidade', Number(e.target.value))} placeholder="Qtd" />
                  <input type="number" min="0" step="0.01" value={item.preco_unitario} onChange={e => updateItem(idx, 'preco_unitario', Number(e.target.value))} placeholder="Preço un." />
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(idx)}><i className="ti ti-x" /></button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginTop: 4 }}><i className="ti ti-plus" /> Adicionar item</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>Total do pedido</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{fmtBRL(valorTotal)}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea value={form.observacoes || ''} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Detalhes especiais..." style={{ minHeight: 52 }} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                <input type="checkbox" id="urgente" style={{ width: 'auto' }} checked={!!form.urgente} onChange={e => setForm({ ...form, urgente: e.target.checked })} />
                <label htmlFor="urgente" style={{ fontSize: 14, color: 'var(--text)', cursor: 'pointer' }}>Marcar como urgente</label>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Fechar</button>
                {modal !== 'new' && <button className="btn btn-danger" onClick={() => del(form.id)}>Excluir</button>}
                {modal !== 'new' && form.status !== 'cancelado' && form.status !== 'entregue' && (
                  <button className="btn btn-warning" onClick={() => cancelar(form.id)}>
                    <i className="ti ti-ban" /> Cancelar pedido
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {modal !== 'new' && form.status !== 'entregue' && form.status !== 'cancelado' && (
                  <button className="btn btn-secondary" onClick={() => avancar(form.id)}>
                    <i className="ti ti-arrow-right" /> Avançar status
                  </button>
                )}
                <button className="btn btn-primary" onClick={save}><i className="ti ti-check" /> Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
