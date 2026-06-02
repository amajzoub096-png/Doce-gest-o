import { useState } from 'react'
import { useClientes, usePedidos, genId, fmtBRL, CANAIS } from '../lib/store.js'

export default function Clientes() {
  const [clientes, setClientes] = useClientes()
  const [pedidos] = usePedidos()
  const [search, setSearch] = useState('')
  const [filterCanal, setFilterCanal] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase()
    return (!q || c.nome.toLowerCase().includes(q) || c.telefone?.includes(q)) &&
      (!filterCanal || c.canal === filterCanal)
  })

  function openNew() { setForm({ canal: 'instagram' }); setModal('new') }
  function openEdit(c) { setForm({ ...c }); setModal(c) }

  function save() {
    const c = { ...form, id: form.id || genId() }
    if (modal === 'new') setClientes([c, ...clientes])
    else setClientes(clientes.map(x => x.id === c.id ? c : x))
    setModal(null)
  }

  function del(id) {
    if (!confirm('Excluir cliente?')) return
    setClientes(clientes.filter(c => c.id !== id))
    setModal(null)
  }

  function pedidosDoCliente(id) {
    return pedidos.filter(p => p.cliente_id === id || p.cliente_nome === clientes.find(c => c.id === id)?.nome)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <p className="page-subtitle">Cadastro de clientes por canal de venda</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <input className="search-input" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ height: 38, width: 160 }} value={filterCanal} onChange={e => setFilterCanal(e.target.value)}>
              <option value="">Todos os canais</option>
              {Object.entries(CANAIS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openNew}><i className="ti ti-plus" /> Novo cliente</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nome</th><th>Canal</th><th>Telefone</th><th>Endereço</th><th>Pedidos</th><th>Total gasto</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7}><div className="empty"><i className="ti ti-users" /><p>Nenhum cliente encontrado</p></div></td></tr>}
              {filtered.map(c => {
                const ps = pedidosDoCliente(c.id)
                const total = ps.filter(p => p.status === 'entregue').reduce((s, p) => s + p.valor_total, 0)
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.nome}</td>
                    <td><span className={`badge ${CANAIS[c.canal]?.cls}`}>{CANAIS[c.canal]?.label}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{c.telefone || '—'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{c.endereco || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{ps.length}</td>
                    <td style={{ fontWeight: 500 }}>{total > 0 ? fmtBRL(total) : '—'}</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)}><i className="ti ti-edit" /></button></td>
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
            <div className="modal-title">{modal === 'new' ? 'Novo cliente' : 'Editar cliente'}</div>
            <div className="form-group">
              <label className="form-label">Nome / Identificação</label>
              <input value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome do cliente ou escola" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Canal principal</label>
                <select value={form.canal || 'instagram'} onChange={e => setForm({ ...form, canal: e.target.value })}>
                  {Object.entries(CANAIS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Telefone / WhatsApp</label>
                <input value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Endereço de entrega</label>
              <input value={form.endereco || ''} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro" />
            </div>
            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea value={form.observacoes || ''} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Preferências, restrições alimentares, horários..." />
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
