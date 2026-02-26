import { createContext, useContext, useState, ReactNode } from 'react'
import { Cliente, Producto, Pedido, Insumo } from '../types'

interface DataContextType {
  clientes: Cliente[]
  setClientes: (clientes: Cliente[]) => void
  productos: Producto[]
  setProductos: (productos: Producto[]) => void
  pedidos: Pedido[]
  setPedidos: (pedidos: Pedido[]) => void
  insumos: Insumo[]
  setInsumos: (insumos: Insumo[]) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])

  return (
    <DataContext.Provider
      value={{
        clientes,
        setClientes,
        productos,
        setProductos,
        pedidos,
        setPedidos,
        insumos,
        setInsumos,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
