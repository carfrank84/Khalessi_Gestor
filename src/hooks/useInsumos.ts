import { useEffect, useState } from 'react'
import { Insumo } from '../types'
import { supabaseService } from '../services/supabase'

export function useInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsumos()
  }, [])

  const loadInsumos = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getInsumos()
      setInsumos(data || [])
      setError(null)
    } catch (err) {
      console.error('Error al cargar insumos:', err)
      setError('Error al cargar insumos')
    } finally {
      setLoading(false)
    }
  }

  const addInsumo = async (insumo: Omit<Insumo, 'id_insumo'>) => {
    try {
      const result = await supabaseService.createInsumo(insumo)
      setInsumos([...insumos, result[0]])
      return result[0]
    } catch (err) {
      console.error('Error al crear insumo:', err)
      throw err
    }
  }

  const updateInsumo = async (id: string, insumo: Partial<Insumo>) => {
    try {
      await supabaseService.updateInsumo(id, insumo)
      setInsumos(
        insumos.map((i) => (i.id_insumo === id ? { ...i, ...insumo } : i))
      )
    } catch (err) {
      console.error('Error al actualizar insumo:', err)
      throw err
    }
  }

  const deleteInsumo = async (id: string) => {
    try {
      await supabaseService.deleteInsumo(id)
      setInsumos(insumos.filter((i) => i.id_insumo !== id))
    } catch (err) {
      console.error('Error al eliminar insumo:', err)
      throw err
    }
  }

  return {
    insumos,
    setInsumos,
    loading,
    error,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    loadInsumos,
  }
}
