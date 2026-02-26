import { useEffect, useState } from 'react'
import { Pedido } from '../types'
import { supabaseService } from '../services/supabase'

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPedidos()
  }, [])

  const loadPedidos = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getPedidos()
      setPedidos(data || [])
      setError(null)
    } catch (err) {
      console.error('Error al cargar pedidos:', err)
      setError('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const addPedido = async (pedido: Omit<Pedido, 'id_pedido'>) => {
    try {
      // Separar productos del pedido
      const { productos, ...pedidoData } = pedido as any
      
      // Crear el pedido sin los productos
      const result = await supabaseService.createPedido(pedidoData)
      const newPedido = result[0]

      // Si hay productos, insertarlos en pedidos_productos
      if (productos && productos.length > 0) {
        for (const item of productos) {
          await supabaseService.createPedidoProducto({
            id_pedido: newPedido.id_pedido,
            id_producto: item.producto.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio_venta,
          })
        }
      }

      // Añadir el pedido a la lista local
      setPedidos([...pedidos, { ...newPedido, productos }])
      return newPedido
    } catch (err) {
      console.error('Error al crear pedido:', err)
      throw err
    }
  }

  const updatePedido = async (id: string, pedido: Partial<Pedido>) => {
    try {
      const { productos, ...pedidoData } = pedido as any
      await supabaseService.updatePedido(id, pedidoData)
      setPedidos(
        pedidos.map((p) => (p.id_pedido === id ? { ...p, ...pedido } : p))
      )
    } catch (err) {
      console.error('Error al actualizar pedido:', err)
      throw err
    }
  }

  const deletePedido = async (id: string) => {
    try {
      await supabaseService.deletePedido(id)
      setPedidos(pedidos.filter((p) => p.id_pedido !== id))
    } catch (err) {
      console.error('Error al eliminar pedido:', err)
      throw err
    }
  }

  return {
    pedidos,
    loading,
    error,
    addPedido,
    updatePedido,
    deletePedido,
    loadPedidos,
  }
}
