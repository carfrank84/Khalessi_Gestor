import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { DataProvider } from './context/DataContext'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Clientes = lazy(() => import('./pages/Clientes'))
const Productos = lazy(() => import('./pages/Productos'))
const Pedidos = lazy(() => import('./pages/Pedidos'))
const Ventas = lazy(() => import('./pages/Ventas'))
const StockInsumos = lazy(() => import('./pages/StockInsumos'))
const ListaPrecios = lazy(() => import('./pages/ListaPrecios'))

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="rounded-xl border border-violet-200 bg-white px-6 py-4 text-center shadow-sm">
                  <p className="text-sm font-medium text-violet-900">Cargando modulo...</p>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/stock-insumos" element={<StockInsumos />} />
              <Route path="/lista-precios" element={<ListaPrecios />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
