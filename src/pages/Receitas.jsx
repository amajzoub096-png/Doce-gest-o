import { useState } from 'react'
import { useReceitas, useProdutos, useIngredientes, genId, fmtBRL } from '../lib/store.js'

export default function Receitas() {
  const [receitas, setReceitas] = useReceitas()
  const [produtos] = useProdutos()
  const [ingredientes] = useIngredientes()
  const [selectedProd, setSelectedProd] = useState(produtos[0]?.id || '')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})

  const produto = produtos.find(p => p.id === selectedProd)
  const receitasProd = receitas.filter(r => r.produto_id === selectedProd)

  const custoProd = receitasProd.reduce((s, r) => {
    const ing = ingredientes.find(i => i.id === r.ingrediente_id)
    return s + (ing ? ing.preco_unitario * r.quantidade : 0)
  }, 0)

  function addIngrediente() { setForm({ produto_id: selectedProd, quantidade: 1 }); setModal(true) }

  function save() {
    const r = { ...form, id: form.id || genId() }
    if (form.id) setReceitas(receitas.map(x => x.id === r.id ? r : x))
    else setReceitas([...receitas, r])
    setModal(false)
  }

  function del(id) {
    if (!confirm('Remover ingrediente da receita?')) return
    setReceitas(receitas.filter(r => r.id !== id))
  }

  function edit(r) { setForm({ ...r }); setModal(true) }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Receitas</h1>
        <p className="page-subtitle">Ingredientes por produto — cálculo automático de custo</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>Produtos</div>
            {produtos.map(p => {
              const r = receitas.filter(x => x.produto_id === p.id)
              const custo = r.reduce((s, ri) => {
                const ing = ingredientes.find(i => i.id === ri.ingrediente_id)
                return s + (ing ? ing.preco_unitario * ri.quantidade : 0)
              }, 0)
              return (
                <div key={p.id} onClick={() => setSelectedProd(p.id)}
                  style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: selectedProd === p.id ? 'var(--accent-soft)' : 'var(--surface)', border: `1px solid ${selectedProd === p.id ? 'var(--accent2)' : 'var(--border)'}`, transition: 'all .15s' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {r.length} ingrediente{r.length !== 1 ? 's' : ''} · {custo > 0 ? fmtBRL(custo) : 'sem custo'}
                  </div>
                </div>
              )
            })}
          </div>
          <div>
            {produto ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{produto.nome}</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{produto.categoria}</div>
                  </div>
                  <button className="btn btn-primary" onClick={addIngrediente}><i className="ti ti-plus" /> Adicionar ingrediente</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  <div className="stat-card">
                    <div className="label">Custo total</div>
                    <div className="value" style={{ fontSize: 16 }}>{fmtBRL(custoProd)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="label">Preço de venda</div>
                    <div className="value" style={{ fontSize: 16, color: 'var(--accent)' }}>{fmtBRL(produto.preco_venda)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="label">Margem estimada</div>
                    <div className="value" style={{ fontSize: 16, color: 'var(--green)' }}>
                      {custoProd > 0 ? `${((produto.preco_venda - custoProd) / produto.preco_venda * 100).toFixed(1)}%` : '—'}
                    </div>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Ingrediente</th><th>Quantidade</th><th>Unidade</th><th>Preço unit.</th><th>Custo</th><th></th></tr></thead>
                    <tbody>
                      {receitasProd.length === 0 && (
                        <tr><td colSpan={6}><div className="empty"><i className="ti ti-notes" /><p>Nenhum ingrediente nesta receita</p></div></td></tr>
                      )}
                      {receitasProd.map(r => {
                        const ing = ingredientes.find(i => i.id === r.ingrediente_id)
                        const custo = ing ? ing.preco_unitario * r.quantidade : 0
                        return (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 500 }}>{ing?.nome || '—'}</td>
                            <td>{r.quantidade}</td>
                            <td style={{ color: 'var(--text3)' }}>{ing?.unidade || '—'}</td>
                            <td style={{ color: 'var(--text2)' }}>{ing ? fmtBRL(ing.preco_unitario) : '—'}</td>
                            <td style={{ fontWeight: 500 }}>{fmtBRL(custo)}</td>
                            <td style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => edit(r)}><i className="ti ti-edit" /></button>
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(r.id)}><i className="ti ti-trash" /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty"><i className="ti ti-notes" /><p>Selecione um produto</p></div>
            )}
          </div>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-title">{form.id ? 'Editar ingrediente' : 'Adicionar ingrediente'}</div>
            <div className="form-group">
              <label className="form-label">Ingrediente</label>
              <select value={form.ingrediente_id || ''} onChange={e => setForm({ ...form, ingrediente_id: e.target.value })}>
                <option value="">Selecione...</option>
                {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade utilizada por unidade do produto</label>
              <input type="number" min="0" step="0.001" value={form.quantidade || ''} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} placeholder="Ex: 0.5 para meia lata" />
              {form.ingrediente_id && (
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  Unidade: {ingredientes.find(i => i.id === form.ingrediente_id)?.unidade}
                </div>
              )}
            </div>
            {form.ingrediente_id && form.quantidade > 0 && (
              <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '10px 12px', marginBottom: 10, fontSize: 13 }}>
                Custo por unidade: <strong>{fmtBRL((ingredientes.find(i => i.id === form.ingrediente_id)?.preco_unitario || 0) * form.quantidade)}</strong>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}><i className="ti ti-check" /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
