import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Pedidos from './pages/Pedidos.jsx'
import Clientes from './pages/Clientes.jsx'
import Produtos from './pages/Produtos.jsx'
import Estoque from './pages/Estoque.jsx'
import Receitas from './pages/Receitas.jsx'
import Financeiro from './pages/Financeiro.jsx'

const NAV = [
  { section: 'Geral' },
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { section: 'Vendas' },
  { id: 'pedidos', label: 'Pedidos', icon: 'ti-clipboard-list' },
  { id: 'clientes', label: 'Clientes', icon: 'ti-users' },
  { section: 'Produção' },
  { id: 'produtos', label: 'Cardápio', icon: 'ti-cake' },
  { id: 'receitas', label: 'Receitas', icon: 'ti-notes' },
  { id: 'estoque', label: 'Ingredientes', icon: 'ti-basket' },
  { section: 'Financeiro' },
  { id: 'financeiro', label: 'Financeiro', icon: 'ti-currency-dollar' },
]

const PAGES = {
  dashboard: Dashboard,
  pedidos: Pedidos,
  clientes: Clientes,
  produtos: Produtos,
  receitas: Receitas,
  estoque: Estoque,
  financeiro: Financeiro,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page] || Dashboard

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🍫 Gicooks</h1>
<span>ERP para confeitaria</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section">{item.section}</div>
            ) : (
              <button
                key={item.id}
                className={`nav-item${page === item.id ? ' active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <i className={`ti ${item.icon}`} />
                {item.label}
              </button>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', textAlign: 'center' }}>
            Doce Gestão v1.0
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Page navigate={setPage} />
      </main>
    </div>
  )
}
