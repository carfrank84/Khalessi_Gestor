import Sidebar from '../components/Sidebar'
import { useProductos } from '../hooks/useProductos'

export default function ListaPrecios() {
  const { productos, loading, error } = useProductos()

  const productosOrdenados = [...productos].sort((a, b) =>
    a.nombre_producto.localeCompare(b.nombre_producto)
  )

  const imprimirLista = () => {
    const filas = productosOrdenados
      .map(
        (producto) =>
          `<tr><td>${producto.nombre_producto}</td><td style="text-align:right">$${producto.precio_venta.toFixed(2)}</td></tr>`
      )
      .join('')

    const html = `
      <html>
        <head>
          <title>Lista de precios 2026</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: Arial, sans-serif; color: #1f2937; }
            .header { text-align: center; margin-bottom: 18px; }
            .business { font-size: 28px; font-weight: 700; margin: 0; }
            .title { font-size: 20px; margin: 6px 0 0 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; font-size: 14px; }
            th { background: #f3f4f6; text-transform: uppercase; letter-spacing: .5px; font-size: 12px; }
            .footer { margin-top: 14px; font-size: 12px; color: #6b7280; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="business">Khalessi Creaciones</h1>
            <h2 class="title">Lista de precios 2026</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio venta</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
          <div class="footer">Generado por Khalessi Gestor</div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.alert('No se pudo abrir la ventana de impresión')
      return
    }

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Lista de Precios</h1>

          <div className="card p-4 md:p-6">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Khalessi Creaciones</h2>
              <p className="text-lg text-gray-700 mt-1">Lista de precios 2026</p>
            </div>

            {loading && <p className="text-gray-600">Cargando productos...</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Precio venta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosOrdenados.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                          No hay productos cargados
                        </td>
                      </tr>
                    ) : (
                      productosOrdenados.map((producto) => (
                        <tr key={producto.id_producto} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-800">{producto.nombre_producto}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            ${producto.precio_venta.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button type="button" onClick={imprimirLista} className="btn-primary">
                Imprimir Lista de Precios
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
