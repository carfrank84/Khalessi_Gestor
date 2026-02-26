import { createClient } from '@supabase/supabase-js'

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const supabaseService = {
  // Clientes
  async getClientes() {
    const { data, error } = await supabase.from('clientes').select('*')
    if (error) throw error
    return data
  },

  async createCliente(cliente: any) {
    const { data, error } = await supabase.from('clientes').insert([cliente]).select()
    if (error) throw error
    return data
  },

  async updateCliente(id: string, cliente: any) {
    const { data, error } = await supabase.from('clientes').update(cliente).eq('id_cliente', id).select()
    if (error) throw error
    return data
  },

  async deleteCliente(id: string) {
    const { error } = await supabase.from('clientes').delete().eq('id_cliente', id)
    if (error) throw error
  },

  // Productos
  async getProductos() {
    const { data, error } = await supabase.from('productos').select('*')
    if (error) throw error
    return data
  },

  async createProducto(producto: any) {
    const { data, error } = await supabase.from('productos').insert([producto]).select()
    if (error) throw error
    return data
  },

  async updateProducto(id: string, producto: any) {
    const { data, error } = await supabase.from('productos').update(producto).eq('id_producto', id).select()
    if (error) throw error
    return data
  },

  async deleteProducto(id: string) {
    const { error } = await supabase.from('productos').delete().eq('id_producto', id)
    if (error) throw error
  },

  // Insumos
  async getInsumos() {
    const { data, error } = await supabase.from('insumos').select('*')
    if (error) throw error
    return data
  },

  async createInsumo(insumo: any) {
    const { data, error } = await supabase.from('insumos').insert([insumo]).select()
    if (error) throw error
    return data
  },

  async updateInsumo(id: string, insumo: any) {
    const { data, error } = await supabase.from('insumos').update(insumo).eq('id_insumo', id).select()
    if (error) throw error
    return data
  },

  async deleteInsumo(id: string) {
    const { error } = await supabase.from('insumos').delete().eq('id_insumo', id)
    if (error) throw error
  },

  // Pedidos
  async getPedidos() {
    const { data, error } = await supabase.from('pedidos').select('*')
    if (error) throw error
    return data
  },

  async createPedido(pedido: any) {
    const { data, error } = await supabase.from('pedidos').insert([pedido]).select()
    if (error) throw error
    return data
  },

  async updatePedido(id: string, pedido: any) {
    const { data, error } = await supabase.from('pedidos').update(pedido).eq('id_pedido', id).select()
    if (error) throw error
    return data
  },

  async deletePedido(id: string) {
    const { error } = await supabase.from('pedidos').delete().eq('id_pedido', id)
    if (error) throw error
  },

  // Pedidos Productos (relación muchos a muchos)
  async createPedidoProducto(item: any) {
    const { data, error } = await supabase.from('pedidos_productos').insert([item]).select()
    if (error) throw error
    return data
  },

  async getPedidosProductos(id_pedido: string) {
    const { data, error } = await supabase.from('pedidos_productos').select('*').eq('id_pedido', id_pedido)
    if (error) throw error
    return data
  },
  
}
