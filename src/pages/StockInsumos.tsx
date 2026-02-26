import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import FormCard from '../components/FormCard'
import DataTable from '../components/DataTable'
import { Insumo } from '../types'
import { useInsumos } from '../hooks/useInsumos'

export default function StockInsumos() {
  const { insumos, loading, error, addInsumo, updateInsumo, deleteInsumo } = useInsumos()
  const [formData, setFormData] = useState({
    nombre_insumo: '',
    precio_costo: '',
    cantidad: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      updateInsumo(editingId, {
        nombre_insumo: formData.nombre_insumo,
        precio_costo: parseFloat(formData.precio_costo),
        cantidad: parseInt(formData.cantidad),
      })
      setEditingId(null)
    } else {
      addInsumo({
        nombre_insumo: formData.nombre_insumo,
        precio_costo: parseFloat(formData.precio_costo),
        cantidad: parseInt(formData.cantidad),
      })
    }
    
    setFormData({
      nombre_insumo: '',
      precio_costo: '',
      cantidad: '',
    })
  }

  const handleEdit = (insumo: Insumo) => {
    setFormData({
      nombre_insumo: insumo.nombre_insumo,
      precio_costo: insumo.precio_costo.toString(),
      cantidad: insumo.cantidad.toString(),
    })
    setEditingId(insumo.id_insumo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este insumo?')) {
      deleteInsumo(id)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre_insumo: '',
      precio_costo: '',
      cantidad: '',
    })
    setEditingId(null)
  }

  const columns = [
    { key: 'id_insumo', label: 'ID' },
    { key: 'nombre_insumo', label: 'Nombre' },
    { 
      key: 'precio_costo', 
      label: 'Precio Costo',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'cantidad', 
      label: 'Cantidad',
      render: (value: number) => (
        <span className={value <= 10 ? 'text-red-600 font-semibold' : ''}>
          {value} {value <= 10 && '⚠️'}
        </span>
      )
    },
    {
      key: 'total',
      label: 'Valor Total',
      render: (_: any, row: Insumo) => `$${(row.precio_costo * row.cantidad).toFixed(2)}`
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Insumo) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => handleDelete(row.id_insumo)}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            🗑️ Eliminar
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Stock de Insumos</h1>
          
          {loading && <p className="text-gray-600">Cargando...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <FormCard title={editingId ? 'Editar Insumo' : 'Nuevo Insumo'} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Insumo
                </label>
                <input
                  type="text"
                  value={formData.nombre_insumo}
                  onChange={(e) => setFormData({ ...formData, nombre_insumo: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Costo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_costo}
                  onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex items-end gap-2 flex-col sm:flex-row">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary w-full"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn-primary w-full">
                  {editingId ? 'Actualizar Insumo' : 'Agregar Insumo'}
                </button>
              </div>
            </div>
          </FormCard>

          <DataTable
            columns={columns}
            data={insumos}
            searchable
            searchPlaceholder="Buscar insumo..."
          />
        </div>
      </main>
    </div>
  )
}
