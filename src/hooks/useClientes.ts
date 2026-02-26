import { useEffect, useState } from 'react'
import { Cliente } from '../types'
import { supabaseService } from '../services/supabase'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar clientes al montar
  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getClientes()
      setClientes(data || [])
      setError(null)
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const addCliente = async (cliente: Omit<Cliente, 'id_cliente'>) => {
    try {
      const result = await supabaseService.createCliente(cliente)
      setClientes([...clientes, result[0]])
      return result[0]
    } catch (err) {
      console.error('Error al crear cliente:', err)
      throw err
    }
  }

  const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
    try {
      await supabaseService.updateCliente(id, cliente)
      setClientes(
        clientes.map((c) => (c.id_cliente === id ? { ...c, ...cliente } : c))
      )
    } catch (err) {
      console.error('Error al actualizar cliente:', err)
      throw err
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      await supabaseService.deleteCliente(id)
      setClientes(clientes.filter((c) => c.id_cliente !== id))
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      throw err
    }
  }

  return {
    clientes,
    setClientes,
    loading,
    error,
    addCliente,
    updateCliente,
    deleteCliente,
    loadClientes,
  }
}
