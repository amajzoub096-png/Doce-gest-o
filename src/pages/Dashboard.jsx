import { usePedidos, useFinanceiro, useIngredientes, fmtBRL } from '../lib/store.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard({ navigate }) {
  const [pedidos] = usePedidos()
  const [financeiro] = useFinanceiro()
  const [ingredientes] = useIngredientes()

  const pendentes = pedidos.filter(p => p.status === 'pendente').length
  const emProducao = pedidos.filter(p => p.status === 'producao').length
  const prontos = pedidos.filter(p => p.status === 'pronto').length
  const urgentes = pedidos.filter(p => p.urgente && p.status !== 'entregue' && p.status !== 'cancelado').length
  const entregues = pedidos.filter(p => p.status === 'entregue')
  const faturamento = entregues.reduce((s, p) => s + p.valor_total, 0)
  const totalEntradas = financeiro.filter(f => f.tipo === 'entrada').reduce((s, f) => s + f.valor, 0)
  const totalSaidas = financeiro.filter(f => f.tipo === 'saida').reduce((s, f) => s + f.valor, 0)
  const lucro = totalEntradas - totalSaidas
  const estoqueAlerta = ingredientes.filter(i => i.quantidade <= i.quantidade_minima).length

  const canalData = ['instagram', 'escola', 'ifood', 'whatsapp', 'outros'].map(c => ({
    name: { instagram: 'Instagram', escola: 'Escola', ifood: 'iFood', whatsapp: 'WhatsApp', outros: 'Outros' }[c],
    pedidos: pedidos.filter(p => p.canal === c).length,
    valor: pedidos.filter(p => p.canal === c && p.status === 'entregue').reduce((s, p) => s + p.valor_total, 0),
  })).filter(d => d.pedidos > 0)

  const statusData = [
    { name: 'Pendente', value: pendentes, color: '#D97706' },
    { name: 'Produção', value: emProducao, color: '#2563EB' },
    { name: 'Pronto', value: prontos, color: '#7C3AED' },
    { name: 'Entregue', value: entregues.length, color: '#059669' },
  ].filter(d => d.value > 0)

  const proximosPedidos = [...pedidos]
    .filter(p => p.status !== 'entregue' && p.status !== 'cancelado')
    .sort((a, b) => new Date(a.data_entrega) - new Date(b.data_entrega))
    .slice(0, 5)

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do seu negócio</p>
      </div>
      <div className="page-body">
        {urgentes > 0 && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('pedidos')}>
            <i className="ti ti-alert-triangle" style={{ color: '#DC2626', fontSize: 18 }} />
            <span style={{ fontSize: 14, color: '#991B1B', fontWeight: 500 }}>{urgentes} pedido{urgentes > 1 ? 's' : ''} urgente{urgentes > 1 ? 's' : ''} aguardando atenção</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#DC2626' }}>Ver →</span>
          </div>
        )}
        {estoqueAlerta > 0 && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('estoque')}>
            <i className="ti ti-package" style={{ color: '#D97706', fontSize: 18 }} />
            <span style={{ fontSize: 14, color: '#92400E', fontWeight: 500 }}>{estoqueAlerta} ingrediente{estoqueAlerta > 1 ? 's' : ''} com estoque baixo</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#D97706' }}>Ver →</span>
          </div>
        )}
        <div className="stat-grid">
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('pedidos')}>
            <div className="label">Pendentes</div>
            <div className="value" style={{ color: '#D97706' }}>{pendentes}</div>
            <div className="sub">aguardando produção</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('pedidos')}>
            <div className="label">Em produção</div>
            <div className="value" style={{ color: '#2563EB' }}>{emProducao}</div>
            <div className="sub">sendo preparados</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('pedidos')}>
            <div className="label">Prontos</div>
            <div className="value" style={{ color: '#7C3AED' }}>{prontos}</div>
            <div className="sub">aguardando entrega</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('financeiro')}>
            <div className="label">Faturamento</div>
            <div className="value" style={{ fontSize: 16 }}>{fmtBRL(faturamento)}</div>
            <div className="sub">pedidos entregues</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('financeiro')}>
            <div className="label">Lucro estimado</div>
            <div className="value" style={{ fontSize: 16, color: lucro >= 0 ? '#059669' : '#DC2626' }}>{fmtBRL(lucro)}</div>
            <div className="sub">entradas - saídas</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>Pedidos e faturamento por canal</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={canalData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => n === 'valor' ? fmtBRL(v) : v} />
                <Bar dataKey="pedidos" fill="#C4541A" radius={[4,4,0,0]} name="Pedidos" />
                <Bar dataKey="valor" fill="#E8794A" radius={[4,4,0,0]} name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>Status dos pedidos</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={11}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>Próximas entregas</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('pedidos')}>Ver todos</button>
          </div>
          {proximosPedidos.length === 0 ? (
            <div className="empty"><i className="ti ti-calendar-check" /><p>Nenhuma entrega pendente</p></div>
          ) : (
            <table>
              <thead><tr>
                <th>Cliente</th><th>Canal</th><th>Itens</th><th>Entrega</th><th>Valor</th><th>Status</th>
              </tr></thead>
              <tbody>{proximosPedidos.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>
                    {p.urgente && <i className="ti ti-flame" style={{ color: '#DC2626', marginRight: 4, fontSize: 13 }} />}
                    {p.cliente_nome}
                  </td>
                  <td><span className={`badge badge-${p.canal}`}>{p.canal === 'instagram' ? 'Instagram' : p.canal === 'escola' ? 'Escola' : p.canal === 'ifood' ? 'iFood' : p.canal}</span></td>
                  <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.itens?.map(i => `${i.quantidade}x ${i.produto_nome}`).join(', ')}</td>
                  <td style={{ color: 'var(--text2)' }}>{p.data_entrega ? p.data_entrega.split('-').reverse().join('/') : '—'}</td>
                  <td style={{ fontWeight: 500 }}>{fmtBRL(p.valor_total)}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status === 'pendente' ? 'Pendente' : p.status === 'producao' ? 'Produção' : p.status === 'pronto' ? 'Pronto' : p.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
