import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import FormCard from '../components/FormCard'
import DataTable from '../components/DataTable'
import { Cliente } from '../types'
import { useClientes } from '../hooks/useClientes'

export default function Clientes() {
  const { clientes, loading, error, addCliente, updateCliente, deleteCliente } = useClientes()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    email: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      updateCliente(editingId, formData)
      setEditingId(null)
    } else {
      addCliente(formData as any)
    }
    
    // Reset form
    setFormData({
      nombre: '',
      apellido: '',
      direccion: '',
      telefono: '',
      email: '',
    })
  }

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email,
    })
    setEditingId(cliente.id_cliente)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      deleteCliente(id)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre: '',
      apellido: '',
      direccion: '',
      telefono: '',
      email: '',
    })
    setEditingId(null)
  }

  const columns = [
    { key: 'id_cliente', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Cliente) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => handleDelete(row.id_cliente)}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            🗑️ Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Clientes</h1>
          
          {loading && <p className="text-gray-600">Cargando...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <FormCard 
            title={editingId ? "Editar Cliente" : "Nuevo Cliente"} 
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              {editingId && (
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar Cliente' : 'Agregar Cliente'}
              </button>
            </div>
          </FormCard>

          <DataTable
            columns={columns}
            data={clientes}
            searchable
            searchPlaceholder="Buscar cliente..."
          />
        </div>
      </main>
    </div>
  )
}
