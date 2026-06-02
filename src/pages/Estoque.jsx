import { useState } from 'react'
import { useIngredientes, genId, fmtBRL } from '../lib/store.js'

const UNIDADES = ['kg', 'g', 'l', 'ml', 'lata', 'caixa', 'pacote', 'dúzia', 'unidade', 'saco']

export default function Estoque() {
  const [ingredientes, setIngredientes] = useIngredientes()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  function getStatus(i) {
    if (i.quantidade === 0) return 'out'
    if (i.quantidade <= i.quantidade_minima) return 'low'
    return 'ok'
  }

  const filtered = ingredientes.filter(i => {
    const q = search.toLowerCase()
    const st = getStatus(i)
    return (!q || i.nome.toLowerCase().includes(q)) && (!filterStatus || st === filterStatus)
  })

  const total = ingredientes.length
  const semEstoque = ingredientes.filter(i => i.quantidade === 0).length
  const estoqueBaixo = ingredientes.filter(i => i.quantidade > 0 && i.quantidade <= i.quantidade_minima).length
  const valorTotal = ingredientes.reduce((s, i) => s + i.quantidade * i.preco_unitario, 0)

  function openNew() { setForm({ unidade: 'kg', quantidade: 0, quantidade_minima: 1, preco_unitario: 0 }); setModal('new') }
  function openEdit(i) { setForm({ ...i }); setModal(i) }

  function save() {
    const item = { ...form, id: form.id || genId() }
    if (modal === 'new') setIngredientes([item, ...ingredientes])
    else setIngredientes(ingredientes.map(x => x.id === item.id ? item : x))
    setModal(null)
  }

  function del(id) {
    if (!confirm('Excluir ingrediente?')) return
    setIngredientes(ingredientes.filter(i => i.id !== id))
    setModal(null)
  }

  const statusLabel = { ok: 'Em estoque', low: 'Estoque baixo', out: 'Sem estoque' }
  const statusCls = { ok: 'badge-ok', low: 'badge-low', out: 'badge-out' }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Ingredientes</h1>
        <p className="page-subtitle">Controle de estoque dos seus insumos</p>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card"><div className="label">Total de itens</div><div className="value">{total}</div></div>
          <div className="stat-card"><div className="label">Sem estoque</div><div className="value" style={{ color: 'var(--red)' }}>{semEstoque}</div></div>
          <div className="stat-card"><div className="label">Estoque baixo</div><div className="value" style={{ color: 'var(--yellow)' }}>{estoqueBaixo}</div></div>
          <div className="stat-card"><div className="label">Valor em estoque</div><div className="value" style={{ fontSize: 16 }}>{fmtBRL(valorTotal)}</div></div>
        </div>
        <div className="toolbar">
          <div className="toolbar-left">
            <input className="search-input" placeholder="Buscar ingrediente..." value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ height: 38, width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="ok">Em estoque</option>
              <option value="low">Estoque baixo</option>
              <option value="out">Sem estoque</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={openNew}><i className="ti ti-plus" /> Novo ingrediente</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ingrediente</th><th>Unidade</th><th>Qtd. atual</th><th>Qtd. mínima</th><th>Preço unit.</th><th>Valor estoque</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8}><div className="empty"><i className="ti ti-basket" /><p>Nenhum ingrediente encontrado</p></div></td></tr>}
              {filtered.map(i => {
                const st = getStatus(i)
                return (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 500 }}>{i.nome}</td>
                    <td style={{ color: 'var(--text3)' }}>{i.unidade}</td>
                    <td style={{ fontWeight: 500, color: st === 'out' ? 'var(--red)' : st === 'low' ? 'var(--yellow)' : 'var(--text)' }}>{i.quantidade}</td>
                    <td style={{ color: 'var(--text3)' }}>{i.quantidade_minima}</td>
                    <td>{fmtBRL(i.preco_unitario)}</td>
                    <td style={{ fontWeight: 500 }}>{fmtBRL(i.quantidade * i.preco_unitario)}</td>
                    <td><span className={`badge ${statusCls[st]}`}>{statusLabel[st]}</span></td>
                    <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(i)}><i className="ti ti-edit" /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal === 'new' ? 'Novo ingrediente' : 'Editar ingrediente'}</div>
            <div className="form-group">
              <label className="form-label">Nome do ingrediente</label>
              <input value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Leite condensado" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Unidade de medida</label>
                <select value={form.unidade || 'kg'} onChange={e => setForm({ ...form, unidade: e.target.value })}>
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preço por unidade (R$)</label>
                <input type="number" min="0" step="0.01" value={form.preco_unitario || ''} onChange={e => setForm({ ...form, preco_unitario: Number(e.target.value) })} placeholder="0,00" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantidade atual em estoque</label>
                <input type="number" min="0" step="0.01" value={form.quantidade ?? ''} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantidade mínima (alerta)</label>
                <input type="number" min="0" step="0.01" value={form.quantidade_minima ?? ''} onChange={e => setForm({ ...form, quantidade_minima: Number(e.target.value) })} />
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                {modal !== 'new' && <button className="btn btn-danger" onClick={() => del(form.id)}>Excluir</button>}
              </div>
              <button className="btn btn-primary" onClick={save}><i className="ti ti-check" /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
