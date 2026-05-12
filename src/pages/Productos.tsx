import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import FormCard from '../components/FormCard'
import DataTable from '../components/DataTable'
import { Producto } from '../types'
import { useProductos } from '../hooks/useProductos'

type ModoCalculo = 'costo' | 'venta'

const FACTOR_IMPRESION = 1.15
const FACTOR_DISEÑO = 1.5

const redondearPrecio = (valor: number) => Number(valor.toFixed(2))

export default function Productos() {
  const { productos, loading, error, addProducto, updateProducto, deleteProducto } = useProductos()
  const [formData, setFormData] = useState({
    nombre_producto: '',
    precio_costo: '',
    precio_venta: '',
  })
  const [disenoPorcentaje, setDisenoPorcentaje] = useState(50)
  const [disenoInput, setDisenoInput] = useState('50')
  const [modoCalculo, setModoCalculo] = useState<ModoCalculo>('costo')
  const [editingId, setEditingId] = useState<string | null>(null)

  const calcularPrecioVenta = (precioCosto: number) => {
    const conImpresion = precioCosto * FACTOR_IMPRESION
    const conDiseno = conImpresion * (1 + disenoPorcentaje / 100)
    const precioFinal = conDiseno * FACTOR_DISEÑO
    return redondearPrecio(precioFinal)
  }

  const calcularPrecioCosto = (precioVenta: number) => {
    const factorTotal = FACTOR_IMPRESION * (1 + disenoPorcentaje / 100) * FACTOR_DISEÑO
    const precioCosto = precioVenta / factorTotal
    return redondearPrecio(precioCosto)
  }

  const calcularPrecioVentaTexto = (precioCostoTexto: string) => {
    const precioCostoNumero = parseFloat(precioCostoTexto)

    if (Number.isNaN(precioCostoNumero)) {
      return ''
    }

    return calcularPrecioVenta(precioCostoNumero).toString()
  }

  const calcularPrecioCostoTexto = (precioVentaTexto: string) => {
    const precioVentaNumero = parseFloat(precioVentaTexto)

    if (Number.isNaN(precioVentaNumero)) {
      return ''
    }

    return calcularPrecioCosto(precioVentaNumero).toString()
  }

  const aplicarPorcentajeDiseno = () => {
    const porcentaje = parseFloat(disenoInput)

    if (Number.isNaN(porcentaje) || porcentaje < 0) {
      window.alert('Ingrese un porcentaje de diseño válido (0 o mayor).')
      return
    }

    setDisenoPorcentaje(porcentaje)

    setFormData((actual) => {
      if (modoCalculo === 'costo') {
        return {
          ...actual,
          precio_venta: calcularPrecioVentaTexto(actual.precio_costo),
        }
      }

      return {
        ...actual,
        precio_costo: calcularPrecioCostoTexto(actual.precio_venta),
      }
    })
  }

  const precioCostoNumero = parseFloat(formData.precio_costo)
  const precioVentaNumero = parseFloat(formData.precio_venta)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (Number.isNaN(precioCostoNumero) || Number.isNaN(precioVentaNumero)) {
      window.alert('Ingrese un precio de costo y un precio de venta válidos.')
      return
    }

    if (editingId) {
      updateProducto(editingId, {
        nombre_producto: formData.nombre_producto,
        precio_costo: precioCostoNumero,
        precio_venta: precioVentaNumero,
      })
      setEditingId(null)
    } else {
      addProducto({
        nombre_producto: formData.nombre_producto,
        precio_costo: precioCostoNumero,
        precio_venta: precioVentaNumero,
      })
    }

    setFormData({
      nombre_producto: '',
      precio_costo: '',
      precio_venta: '',
    })
    setModoCalculo('costo')
  }

  const handleEdit = (producto: Producto) => {
    setFormData({
      nombre_producto: producto.nombre_producto,
      precio_costo: producto.precio_costo.toString(),
      precio_venta: producto.precio_venta.toString(),
    })
    setEditingId(producto.id_producto)
  }

  const handleCancel = () => {
    setEditingId(null)
    setModoCalculo('costo')
    setFormData({
      nombre_producto: '',
      precio_costo: '',
      precio_venta: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      const result = await deleteProducto(id)

      if (!result.ok) {
        window.alert(result.message)
      }
    }
  }

  const columns = [
    { key: 'id_producto', label: 'ID' },
    { key: 'nombre_producto', label: 'Nombre' },
    {
      key: 'precio_costo',
      label: 'Precio Costo',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'precio_venta',
      label: 'Precio Venta',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'margen',
      label: 'Margen',
      render: (_: any, row: Producto) => {
        if (row.precio_costo <= 0) {
          return 'N/A'
        }

        const margen = ((row.precio_venta - row.precio_costo) / row.precio_costo * 100).toFixed(2)
        return `${margen}%`
      },
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Producto) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.id_producto)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Eliminar
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Productos</h1>

          {loading && <p className="text-gray-600">Cargando...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <FormCard
            title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={formData.nombre_producto}
                  onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo de cálculo
                </label>
                <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      if (modoCalculo === 'costo') return

                      setModoCalculo('costo')
                      setFormData((actual) => ({
                        ...actual,
                        precio_venta: calcularPrecioVentaTexto(actual.precio_costo),
                      }))
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      modoCalculo === 'costo'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Calcular venta desde costo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (modoCalculo === 'venta') return

                      setModoCalculo('venta')
                      setFormData((actual) => ({
                        ...actual,
                        precio_costo: calcularPrecioCostoTexto(actual.precio_venta),
                      }))
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      modoCalculo === 'venta'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Calcular costo desde venta
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {modoCalculo === 'costo'
                    ? 'Ingresá el precio de costo y el sistema calculará el precio de venta final.'
                    : 'Ingresá el precio de venta final y el sistema calculará el precio de costo inverso.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Costo
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_costo}
                  onChange={(e) => {
                    const precioCosto = e.target.value

                    if (modoCalculo === 'venta') {
                      setFormData((actual) => ({
                        ...actual,
                        precio_costo: precioCosto,
                      }))
                      return
                    }

                    setFormData((actual) => ({
                      ...actual,
                      precio_costo: precioCosto,
                      precio_venta: calcularPrecioVentaTexto(precioCosto),
                    }))
                  }}
                  className="input-field"
                  readOnly={modoCalculo === 'venta'}
                  aria-readonly={modoCalculo === 'venta'}
                  placeholder={modoCalculo === 'venta' ? 'Se calcula automáticamente' : '0.00'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Venta
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_venta}
                  onChange={(e) => {
                    const precioVenta = e.target.value

                    if (modoCalculo === 'costo') {
                      setFormData((actual) => ({
                        ...actual,
                        precio_venta: precioVenta,
                      }))
                      return
                    }

                    setFormData((actual) => ({
                      ...actual,
                      precio_venta: precioVenta,
                      precio_costo: calcularPrecioCostoTexto(precioVenta),
                    }))
                  }}
                  className="input-field"
                  readOnly={modoCalculo === 'costo'}
                  aria-readonly={modoCalculo === 'costo'}
                  placeholder={modoCalculo === 'costo' ? 'Se calcula automáticamente' : '0.00'}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  {modoCalculo === 'costo'
                    ? `Venta calculada: ${formData.precio_venta ? `$${Number(formData.precio_venta).toFixed(2)}` : '$0.00'}`
                    : `Costo calculado: ${formData.precio_costo ? `$${Number(formData.precio_costo).toFixed(2)}` : '$0.00'}`}
                </p>
              </div>

              <div className="flex items-end gap-2 flex-col sm:flex-row">
                <button type="submit" className="btn-primary w-full">
                  {editingId ? 'Actualizar' : 'Agregar'} Producto
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % Diseño (ajuste manual)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={disenoInput}
                    onChange={(e) => setDisenoInput(e.target.value)}
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={aplicarPorcentajeDiseno}
                    className="btn-secondary"
                  >
                    Aplicar % Diseño
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Actualmente aplicado: {disenoPorcentaje}%</p>
              </div>
            </div>
          </FormCard>

          <DataTable
            columns={columns}
            data={productos}
            searchable
            searchPlaceholder="Buscar producto..."
          />
        </div>
      </main>
    </div>
  )
}
