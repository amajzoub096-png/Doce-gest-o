import { useState } from 'react'
import { useFinanceiro, genId, fmtBRL, fmtDate } from '../lib/store.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORIAS_ENTRADA = ['Vendas', 'Adiantamento', 'Outros']
const CATEGORIAS_SAIDA = ['Ingredientes', 'Embalagens', 'Gás / Energia', 'Transporte', 'Equipamentos', 'Outros']

export default function Financeiro() {
  const [financeiro, setFinanceiro] = useFinanceiro()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [filterTipo, setFilterTipo] = useState('')

  const totalEntradas = financeiro.filter(f => f.tipo === 'entrada').reduce((s, f) => s + f.valor, 0)
  const totalSaidas = financeiro.filter(f => f.tipo === 'saida').reduce((s, f) => s + f.valor, 0)
  const saldo = totalEntradas - totalSaidas

  const filtered = [...financeiro]
    .filter(f => !filterTipo || f.tipo === filterTipo)
    .sort((a, b) => new Date(b.data) - new Date(a.data))

  const byDate = {}
  financeiro.forEach(f => {
    if (!byDate[f.data]) byDate[f.data] = { data: f.data, entrada: 0, saida: 0 }
    byDate[f.data][f.tipo === 'entrada' ? 'entrada' : 'saida'] += f.valor
  })
  const chartData = Object.values(byDate).sort((a, b) => a.data.localeCompare(b.data)).slice(-14).map(d => ({
    ...d, data: d.data.split('-').slice(1).reverse().join('/')
  }))

  function openNew(tipo) { setForm({ tipo: tipo || 'entrada', data: new Date().toISOString().slice(0, 10), categoria: tipo === 'saida' ? 'Ingredientes' : 'Vendas' }); setModal('new') }
  function openEdit(f) { setForm({ ...f }); setModal(f) }

  function save() {
    const item = { ...form, id: form.id || genId() }
    if (modal === 'new') setFinanceiro([item, ...financeiro])
    else setFinanceiro(financeiro.map(x => x.id === item.id ? item : x))
    setModal(null)
  }

  function del(id) {
    if (!confirm('Excluir lançamento?')) return
    setFinanceiro(financeiro.filter(f => f.id !== id))
    setModal(null)
  }

  const categorias = form.tipo === 'saida' ? CATEGORIAS_SAIDA : CATEGORIAS_ENTRADA

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Financeiro</h1>
        <p className="page-subtitle">Entradas, saídas e saldo do seu negócio</p>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total entradas</div>
            <div className="value" style={{ color: 'var(--green)', fontSize: 18 }}>{fmtBRL(totalEntradas)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total saídas</div>
            <div className="value" style={{ color: 'var(--red)', fontSize: 18 }}>{fmtBRL(totalSaidas)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Saldo</div>
            <div className="value" style={{ color: saldo >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 18 }}>{fmtBRL(saldo)}</div>
            <div className="sub">{saldo >= 0 ? 'positivo ✓' : 'negativo ⚠'}</div>
          </div>
          <div className="stat-card">
            <div className="label">Lançamentos</div>
            <div className="value">{financeiro.length}</div>
          </div>
        </div>
        {chartData.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>Entradas vs Saídas (últimos dias)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => fmtBRL(v)} />
                <Bar dataKey="entrada" fill="#059669" radius={[4,4,0,0]} name="Entradas" />
                <Bar dataKey="saida" fill="#DC2626" radius={[4,4,0,0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="toolbar">
          <div className="toolbar-left">
            <select style={{ height: 38, width: 160 }} value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => openNew('saida')}><i className="ti ti-minus" /> Registrar saída</button>
            <button className="btn btn-primary" onClick={() => openNew('entrada')}><i className="ti ti-plus" /> Registrar entrada</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6}><div className="empty"><i className="ti ti-currency-dollar" /><p>Nenhum lançamento encontrado</p></div></td></tr>}
              {filtered.map(f => (
                <tr key={f.id}>
                  <td style={{ color: 'var(--text2)' }}>{fmtDate(f.data)}</td>
                  <td style={{ fontWeight: 500 }}>{f.descricao}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>{f.categoria}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: f.tipo === 'entrada' ? 'var(--green)' : 'var(--red)' }}>
                      <i className={`ti ${f.tipo === 'entrada' ? 'ti-arrow-down-circle' : 'ti-arrow-up-circle'}`} />
                      {f.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: f.tipo === 'entrada' ? 'var(--green)' : 'var(--red)' }}>
                    {f.tipo === 'entrada' ? '+' : '-'}{fmtBRL(f.valor)}
                  </td>
                  <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(f)}><i className="ti ti-edit" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-title">{modal === 'new' ? (form.tipo === 'entrada' ? 'Nova entrada' : 'Nova saída') : 'Editar lançamento'}</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select value={form.tipo || 'entrada'} onChange={e => setForm({ ...form, tipo: e.target.value, categoria: e.target.value === 'saida' ? 'Ingredientes' : 'Vendas' })}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input type="date" value={form.data || ''} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input value={form.descricao || ''} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Pedido Ana Paula, Compra de leite condensado..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select value={form.categoria || ''} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input type="number" min="0" step="0.01" value={form.valor || ''} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} placeholder="0,00" />
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
