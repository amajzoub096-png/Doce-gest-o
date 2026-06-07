import { useState, useEffect } from 'react'

const INITIAL_CLIENTES = [
  { id: '1', nome: 'Ana Paula Silva', canal: 'instagram', telefone: '(11) 99999-0001', email: 'ana@email.com', endereco: 'Rua das Flores, 12', observacoes: 'Prefere embalagem kraft' },
  { id: '2', nome: 'EMEF João XXIII', canal: 'escola', telefone: '(11) 3333-1234', email: 'escola@joaoxxiii.com', endereco: 'Av. Paulista, 1000', observacoes: 'Entregar até 10h. Responsável: Diretora Carla' },
  { id: '3', nome: 'Maria Fernanda Costa', canal: 'instagram', telefone: '(11) 98888-2233', email: '', endereco: '', observacoes: '' },
  { id: '4', nome: 'Escola Estadual Tiradentes', canal: 'escola', telefone: '(11) 3322-9900', email: 'tiradentes@edu.sp.gov.br', endereco: 'Rua Tiradentes, 50', observacoes: 'Pedidos mensais' },
  { id: '5', nome: 'iFood #3821', canal: 'ifood', telefone: '', email: '', endereco: 'Bairro Jardins', observacoes: '' },
]

const INITIAL_INGREDIENTES = [
  { id: '1', nome: 'Leite condensado', unidade: 'lata', quantidade: 24, quantidade_minima: 10, preco_unitario: 5.90 },
  { id: '2', nome: 'Chocolate em pó 50%', unidade: 'kg', quantidade: 3.5, quantidade_minima: 1, preco_unitario: 28.00 },
  { id: '3', nome: 'Manteiga sem sal', unidade: 'kg', quantidade: 2, quantidade_minima: 1, preco_unitario: 32.00 },
  { id: '4', nome: 'Granulado chocolate', unidade: 'kg', quantidade: 1.2, quantidade_minima: 0.5, preco_unitario: 22.00 },
  { id: '5', nome: 'Creme de leite', unidade: 'lata', quantidade: 8, quantidade_minima: 5, preco_unitario: 4.50 },
  { id: '6', nome: 'Farinha de trigo', unidade: 'kg', quantidade: 5, quantidade_minima: 2, preco_unitario: 6.00 },
  { id: '7', nome: 'Açúcar refinado', unidade: 'kg', quantidade: 4, quantidade_minima: 2, preco_unitario: 4.80 },
  { id: '8', nome: 'Ovos', unidade: 'dúzia', quantidade: 3, quantidade_minima: 2, preco_unitario: 14.00 },
  { id: '9', nome: 'Maracujá concentrado', unidade: 'kg', quantidade: 0.4, quantidade_minima: 0.5, preco_unitario: 18.00 },
]

const INITIAL_PRODUTOS = [
  { id: '1', nome: 'Brigadeiro Gourmet', categoria: 'Brigadeiros', preco_venda: 3.50, descricao: 'Brigadeiro tradicional com cobertura de granulado belga', ativo: true },
  { id: '2', nome: 'Trufa de Maracujá', categoria: 'Trufas', preco_venda: 5.00, descricao: 'Trufa recheada com ganache de maracujá', ativo: true },
  { id: '3', nome: 'Bolo de Chocolate', categoria: 'Bolos', preco_venda: 85.00, descricao: 'Bolo inteiro, serve 20 fatias', ativo: true },
  { id: '4', nome: 'Palha Italiana', categoria: 'Outros', preco_venda: 3.00, descricao: 'Palha italiana cremosa', ativo: true },
  { id: '5', nome: 'Beijinho', categoria: 'Brigadeiros', preco_venda: 3.00, descricao: 'Brigadeiro de coco com cobertura de açúcar', ativo: true },
  { id: '6', nome: 'Kit Presente 20un', categoria: 'Kits', preco_venda: 90.00, descricao: 'Caixa kraft com 20 doces sortidos', ativo: true },
]

const INITIAL_RECEITAS = [
  { id: '1', produto_id: '1', ingrediente_id: '1', quantidade: 0.5 },
  { id: '2', produto_id: '1', ingrediente_id: '2', quantidade: 0.05 },
  { id: '3', produto_id: '1', ingrediente_id: '3', quantidade: 0.02 },
  { id: '4', produto_id: '1', ingrediente_id: '4', quantidade: 0.03 },
  { id: '5', produto_id: '2', ingrediente_id: '1', quantidade: 0.5 },
  { id: '6', produto_id: '2', ingrediente_id: '5', quantidade: 0.5 },
  { id: '7', produto_id: '2', ingrediente_id: '9', quantidade: 0.05 },
]

const INITIAL_PEDIDOS = [
  { id: '1', cliente_id: '1', cliente_nome: 'Ana Paula Silva', canal: 'instagram', status: 'pendente', data_entrega: '2025-06-07', valor_total: 175, urgente: true, observacoes: 'Sem granulado, caixa kraft', itens: [{ produto_id:'1', produto_nome:'Brigadeiro Gourmet', quantidade:50, preco_unitario:3.50 }] },
  { id: '2', cliente_id: '4', cliente_nome: 'Escola Est. Tiradentes', canal: 'escola', status: 'pendente', data_entrega: '2025-06-08', valor_total: 300, urgente: true, observacoes: 'Entregar até 10h', itens: [{ produto_id:'4', produto_nome:'Palha Italiana', quantidade:100, preco_unitario:3.00 }] },
  { id: '3', cliente_id: '3', cliente_nome: 'Maria Fernanda Costa', canal: 'instagram', status: 'producao', data_entrega: '2025-06-10', valor_total: 150, urgente: false, observacoes: '', itens: [{ produto_id:'2', produto_nome:'Trufa de Maracujá', quantidade:30, preco_unitario:5.00 }] },
  { id: '4', cliente_id: '5', cliente_nome: 'iFood #3821', canal: 'ifood', status: 'producao', data_entrega: '2025-06-05', valor_total: 84, urgente: false, observacoes: '', itens: [{ produto_id:'1', produto_nome:'Brigadeiro Gourmet', quantidade:24, preco_unitario:3.50 }] },
  { id: '5', cliente_id: '2', cliente_nome: 'EMEF João XXIII', canal: 'escola', status: 'pronto', data_entrega: '2025-06-06', valor_total: 240, urgente: false, observacoes: 'Festa junina', itens: [{ produto_id:'5', produto_nome:'Beijinho', quantidade:80, preco_unitario:3.00 }] },
  { id: '6', cliente_id: '1', cliente_nome: 'Ana Paula Silva', canal: 'instagram', status: 'entregue', data_entrega: '2025-06-01', valor_total: 90, urgente: false, observacoes: '', itens: [{ produto_id:'6', produto_nome:'Kit Presente 20un', quantidade:1, preco_unitario:90.00 }] },
]

const INITIAL_FINANCEIRO = [
  { id: '1', tipo: 'entrada', descricao: 'Pedido Ana Paula — Kit Presente', valor: 90, categoria: 'Vendas', data: '2025-06-01' },
  { id: '2', tipo: 'saida', descricao: 'Compra de leite condensado (12 latas)', valor: 70.80, categoria: 'Ingredientes', data: '2025-06-01' },
  { id: '3', tipo: 'saida', descricao: 'Embalagens kraft', valor: 45.00, categoria: 'Embalagens', data: '2025-06-02' },
  { id: '4', tipo: 'entrada', descricao: 'Adiantamento escola Tiradentes', valor: 150, categoria: 'Vendas', data: '2025-06-03' },
  { id: '5', tipo: 'saida', descricao: 'Gás de cozinha', valor: 120.00, categoria: 'Outros', data: '2025-06-03' },
]

function useStore(key, initial) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch { return initial }
  })

  useEffect(() => {
    function onStorage(e) {
      if (e.key === key) {
        try { setData(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const update = (val) => {
    const next = typeof val === 'function' ? val(data) : val
    setData(next)
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(next) }))
  }

  return [data, update]
}

export function useClientes() { return useStore('erp_clientes', INITIAL_CLIENTES) }
export function useIngredientes() { return useStore('erp_ingredientes', INITIAL_INGREDIENTES) }
export function useProdutos() { return useStore('erp_produtos', INITIAL_PRODUTOS) }
export function useReceitas() { return useStore('erp_receitas', INITIAL_RECEITAS) }
export function usePedidos() { return useStore('erp_pedidos', INITIAL_PEDIDOS) }
export function useFinanceiro() { return useStore('erp_financeiro', INITIAL_FINANCEIRO) }

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function fmtBRL(v) {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export const CANAIS = {
  instagram: { label: 'Instagram', cls: 'badge-ig' },
  escola: { label: 'Escola', cls: 'badge-escola' },
  ifood: { label: 'iFood', cls: 'badge-ifood' },
  whatsapp: { label: 'WhatsApp', cls: 'badge-whatsapp' },
  outros: { label: 'Outros', cls: 'badge-outros' },
}

export const STATUS_PEDIDO = {
  pendente: { label: 'Pendente', cls: 'badge-pendente' },
  producao: { label: 'Em produção', cls: 'badge-producao' },
  pronto: { label: 'Pronto', cls: 'badge-pronto' },
  entregue: { label: 'Entregue', cls: 'badge-entregue' },
  cancelado: { label: 'Cancelado', cls: 'badge-cancelado' },
}
