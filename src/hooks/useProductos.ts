import { useEffect, useState } from 'react'
import { Producto } from '../types'
import { supabaseService } from '../services/supabase'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getProductos()
      setProductos(data || [])
      setError(null)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const addProducto = async (producto: Omit<Producto, 'id_producto'>) => {
    try {
      const result = await supabaseService.createProducto(producto)
      setProductos([...productos, result[0]])
      return result[0]
    } catch (err) {
      console.error('Error al crear producto:', err)
      throw err
    }
  }

  const updateProducto = async (id: string, producto: Partial<Producto>) => {
    try {
      await supabaseService.updateProducto(id, producto)
      setProductos(
        productos.map((p) => (p.id_producto === id ? { ...p, ...producto } : p))
      )
    } catch (err) {
      console.error('Error al actualizar producto:', err)
      throw err
    }
  }

  const deleteProducto = async (id: string) => {
    try {
      await supabaseService.deleteProducto(id)
      setProductos(productos.filter((p) => p.id_producto !== id))
      setError(null)
      return { ok: true as const }
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      const supabaseError = err as { code?: string; message?: string }

      if (supabaseError?.code === '23503') {
        const message = 'No se puede eliminar el producto porque está asociado a uno o más pedidos.'
        setError(message)
        return { ok: false as const, message }
      }

      const message = 'Error al eliminar producto'
      setError(message)
      return { ok: false as const, message }
    }
  }

  return {
    productos,
    setProductos,
    loading,
    error,
    addProducto,
    updateProducto,
    deleteProducto,
    loadProductos,
  }
}
