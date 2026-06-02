import { useState } from 'react'
import { useProdutos, useReceitas, useIngredientes, genId, fmtBRL } from '../lib/store.js'

const CATEGORIAS = ['Brigadeiros', 'Trufas', 'Bolos', 'Tortas', 'Kits', 'Outros']

export default function Produtos() {
  const [produtos, setProdutos] = useProdutos()
  const [receitas] = useReceitas()
  const [ingredientes] = useIngredientes()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  const filtered = produtos.filter(p => {
    const q = search.toLowerCase()
    return (!q || p.nome.toLowerCase().includes(q)) && (!filterCat || p.categoria === filterCat)
  })

  function custoReceita(prodId) {
    const r = receitas.filter(r => r.produto_id === prodId)
    return r.reduce((s, ri) => {
      const ing = ingredientes.find(i => i.id === ri.ingrediente_id)
      return s + (ing ? ing.preco_unitario * ri.quantidade : 0)
    }, 0)
  }

  function openNew() { setForm({ categoria: 'Brigadeiros', ativo: true }); setModal('new') }
  function openEdit(p) { setForm({ ...p }); setModal(p) }

  function save() {
    const p = { ...form, id: form.id || genId() }
    if (modal === 'new') setProdutos([p, ...produtos])
    else setProdutos(produtos.map(x => x.id === p.id ? p : x))
    setModal(null)
  }

  function del(id) {
    if (!confirm('Excluir produto?')) return
    setProdutos(produtos.filter(p => p.id !== id))
    setModal(null)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Cardápio</h1>
        <p className="page-subtitle">Seus produtos com preço de venda e custo de receita</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="toolbar-left">
            <input className="search-input" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ height: 38, width: 160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Todas categorias</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openNew}><i className="ti ti-plus" /> Novo produto</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map(p => {
            const custo = custoReceita(p.id)
            const lucro = p.preco_venda - custo
            const margem = p.preco_venda > 0 ? (lucro / p.preco_venda * 100) : 0
            return (
              <div key={p.id} className="card" style={{ cursor: 'pointer', opacity: p.ativo ? 1 : 0.55 }} onClick={() => openEdit(p)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{p.categoria}</div>
                  </div>
                  <span style={{ background: p.ativo ? 'var(--green-soft)' : 'var(--bg2)', color: p.ativo ? 'var(--green)' : 'var(--text3)', fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
                {p.descricao && <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10, lineHeight: 1.4 }}>{p.descricao}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Preço venda</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent)' }}>{fmtBRL(p.preco_venda)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Custo</div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{custo > 0 ? fmtBRL(custo) : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Margem</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: margem > 50 ? 'var(--green)' : margem > 20 ? 'var(--yellow)' : 'var(--red)' }}>
                      {custo > 0 ? `${margem.toFixed(0)}%` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="empty" style={{ gridColumn: '1/-1' }}><i className="ti ti-cake" /><p>Nenhum produto encontrado</p></div>}
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal === 'new' ? 'Novo produto' : 'Editar produto'}</div>
            <div className="form-group">
              <label className="form-label">Nome do produto</label>
              <input value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Brigadeiro Gourmet" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select value={form.categoria || 'Brigadeiros'} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preço de venda (R$)</label>
                <input type="number" min="0" step="0.01" value={form.preco_venda || ''} onChange={e => setForm({ ...form, preco_venda: Number(e.target.value) })} placeholder="0,00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea value={form.descricao || ''} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva o produto..." />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="ativo" style={{ width: 'auto' }} checked={!!form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} />
              <label htmlFor="ativo" style={{ fontSize: 14, cursor: 'pointer' }}>Produto ativo (disponível para venda)</label>
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
