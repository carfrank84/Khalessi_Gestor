import Sidebar from '../components/Sidebar'
import SummaryCard from '../components/SummaryCard'

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Clientes"
              value="0"
              icon="👥"
              color="blue"
            />
            <SummaryCard
              title="Productos Activos"
              value="0"
              icon="📦"
              color="green"
            />
            <SummaryCard
              title="Pedidos Pendientes"
              value="0"
              icon="🛒"
              color="purple"
            />
            <SummaryCard
              title="Ventas del Mes"
              value="$0"
              icon="💰"
              color="green"
            />
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bienvenido a Khalessi Gestor
            </h2>
            <p className="text-gray-600">
              Seleccione un módulo del menú lateral para comenzar a gestionar su negocio.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
