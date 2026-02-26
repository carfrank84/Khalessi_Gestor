export interface Cliente {
  id_cliente: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface Producto {
  id_producto: string;
  nombre_producto: string;
  precio_costo: number;
  precio_venta: number;
}

export interface Insumo {
  id_insumo: string;
  nombre_insumo: string;
  precio_costo: number;
  cantidad: number;
}

export interface PedidoProducto {
  producto: Producto;
  cantidad: number;
}

export interface Pedido {
  id_pedido: string;
  id_cliente: string | number;
  productos: PedidoProducto[];
  fecha: string;
  total_costo: number;
  total_venta: number;
  estado: 'Pendiente' | 'Entregado';
  pago: 'Debe' | 'Pagado';
}

export interface VentaSummary {
  total_costo: number;
  ganancia: number;
  caja: number;
}
