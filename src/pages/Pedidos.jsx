import { useState } from 'react'
import { usePedidos, useClientes, useProdutos, genId, fmtBRL, CANAIS, STATUS_PEDIDO } from '../lib/store.js'

const COLS = [
  { key: 'pendente', label: 'Pendente', icon: 'ti-clock' },
  { key: 'producao', label: 'Em produção', icon: 'ti-chef-hat' },
  { key: 'pronto', label: 'Pronto', icon: 'ti-package' },
  { key: 'entregue', label: 'Entregue', icon: 'ti-circle-check' },
]

export default function Pedidos() {
  const [pedidos, setPedidos] = usePedidos()
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
    if (!confirm('Excluir pedido?')) return
    setPedidos(pedidos.filter(p => p.id !== id))
    setModal(null)
  }

  function avancar(id) {
    const next = { pendente: 'producao', producao: 'pronto', pronto: 'entregue' }
    setPedidos(pedidos.map(p => p.id === id && next[p.status] ? { ...p, status: next[p.status] } : p))
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
        <div className="modal-overlay" o
