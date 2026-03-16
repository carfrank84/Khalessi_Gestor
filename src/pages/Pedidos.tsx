import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import FormCard from '../components/FormCard'
import DataTable from '../components/DataTable'
import { Pedido, Cliente, Producto, PedidoProducto } from '../types'
import { useClientes } from '../hooks/useClientes'
import { useProductos } from '../hooks/useProductos'
import { usePedidos } from '../hooks/usePedidos'

const EMPRESA_INFO = {
  nombre: 'Khalessi Creaciones',
  slogan: 'Gestion creativa y profesional',
  direccion: 'Las Heras - Mendoza',
  telefono: '261-2113221 / 261-6661061',
  email: 'khalessi.creaciones@email.com',
  logoUrl: '/logo-empresa.png',
}

const TRANSFERENCIA_INFO = {
  titular: 'Marcela Nicole Riveros Padilla',
  cuit: '',

  banco: 'Naranja X',
  cbu: '',

  alias: 'kcreaciones2026',
}

const loadHtml2Canvas = async () => {
  const module = await import('html2canvas')
  return module.default
}

const loadJsPDF = async () => {
  const module = await import('jspdf')
  return module.jsPDF
}

export default function Pedidos() {
  const [searchParams] = useSearchParams()
  const { clientes } = useClientes()
  const { productos } = useProductos()
  const { pedidos, loading, error, addPedido, updatePedido, deletePedido } = usePedidos()
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedProductos, setSelectedProductos] = useState<PedidoProducto[]>([])
  const [searchCliente, setSearchCliente] = useState('')
  const [searchProducto, setSearchProducto] = useState('')
  const [bonificacion, setBonificacion] = useState('0')
  const [observaciones, setObservaciones] = useState('')
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [editarDetalle, setEditarDetalle] = useState(false)
  const [detalleProductos, setDetalleProductos] = useState<PedidoProducto[]>([])
  const [detalleObservaciones, setDetalleObservaciones] = useState('')
  const [detalleBonificacion, setDetalleBonificacion] = useState('0')

  const obtenerCantidadValida = (valor: number) => {
    if (!Number.isFinite(valor) || valor < 1) return 1
    return Math.floor(valor)
  }

  const normalizarMontoSenia = (valor: string | number | null | undefined) => {
    const monto = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor)
    if (!Number.isFinite(monto) || monto < 0) return 0
    return Number(monto.toFixed(2))
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return '-'

    const partes = fecha.split('-')
    if (partes.length === 3) {
      const [anio, mes, dia] = partes
      return `${dia}-${mes}-${anio}`
    }

    const date = new Date(fecha)
    if (!Number.isNaN(date.getTime())) {
      const dia = String(date.getDate()).padStart(2, '0')
      const mes = String(date.getMonth() + 1).padStart(2, '0')
      const anio = date.getFullYear()
      return `${dia}-${mes}-${anio}`
    }

    return fecha
  }

  const enriquecerProducto = (item: PedidoProducto): PedidoProducto => {
    const catalogo = productos.find(
      (p) => String(p.id_producto) === String(item.producto.id_producto)
    )

    return {
      ...item,
      producto: {
        ...item.producto,
        nombre_producto: catalogo?.nombre_producto || item.producto.nombre_producto,
        precio_costo: catalogo?.precio_costo ?? item.producto.precio_costo,
        precio_venta: item.producto.precio_venta || catalogo?.precio_venta || 0,
      },
      cantidad: obtenerCantidadValida(item.cantidad),
    }
  }

  const subtotalVenta = selectedProductos.reduce(
    (sum, item) => sum + item.producto.precio_venta * obtenerCantidadValida(item.cantidad),
    0
  )
  const bonificacionNumero = Math.max(0, parseFloat(bonificacion) || 0)
  const bonificacionAplicada = Math.min(bonificacionNumero, subtotalVenta)
  const totalFinalVenta = Math.max(0, subtotalVenta - bonificacionAplicada)

  const filteredClientes = useMemo(() => {
    if (!searchCliente) return []
    return clientes
      .filter((c) =>
        String(c.id_cliente).includes(searchCliente.toLowerCase()) ||
        c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
        c.apellido.toLowerCase().includes(searchCliente.toLowerCase())
      )
      .slice(0, 5)
  }, [searchCliente, clientes])

  const filteredProductos = useMemo(() => {
    if (!searchProducto) return []
    return productos
      .filter((p) =>
        String(p.id_producto).includes(searchProducto.toLowerCase()) ||
        p.nombre_producto.toLowerCase().includes(searchProducto.toLowerCase())
      )
      .slice(0, 5)
  }, [searchProducto, productos])

  const pedidosOrdenados = useMemo(() => {
    return [...pedidos].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()

      if (fechaA !== fechaB) {
        return fechaB - fechaA
      }

      const idA = Number(a.id_pedido)
      const idB = Number(b.id_pedido)
      if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
        return idB - idA
      }

      return String(b.id_pedido).localeCompare(String(a.id_pedido))
    })
  }, [pedidos])

  const estadoFiltro = searchParams.get('estado')
  const idFiltro = searchParams.get('id')

  const pedidosFiltrados = useMemo(() => {
    return pedidosOrdenados.filter((pedido) => {
      const coincideEstado = estadoFiltro
        ? pedido.estado.toLowerCase() === estadoFiltro.toLowerCase()
        : true

      const coincideId = idFiltro
        ? String(pedido.id_pedido).toLowerCase().includes(idFiltro.toLowerCase())
        : true

      return coincideEstado && coincideId
    })
  }, [pedidosOrdenados, estadoFiltro, idFiltro])

  const seleccionarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setSearchCliente('')
  }

  const seleccionarProducto = (producto: Producto) => {
    const cantidadValida = 1

    setSelectedProductos((prev) => {
      const indexExistente = prev.findIndex(
        (item) => item.producto.id_producto === producto.id_producto
      )

      if (indexExistente === -1) {
        return [...prev, { producto, cantidad: cantidadValida }]
      }

      return prev.map((item, index) =>
        index === indexExistente
          ? { ...item, cantidad: obtenerCantidadValida(item.cantidad) + cantidadValida }
          : item
      )
    })

    setSearchProducto('')
  }

  const removerProducto = (index: number) => {
    setSelectedProductos(selectedProductos.filter((_, i) => i !== index))
  }

  const actualizarCantidadProducto = (index: number, nuevaCantidad: number) => {
    const cantidadValida = obtenerCantidadValida(nuevaCantidad)
    setSelectedProductos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: cantidadValida } : item
      )
    )
  }

  const actualizarCantidadDetalle = (index: number, nuevaCantidad: number) => {
    const cantidadValida = obtenerCantidadValida(nuevaCantidad)
    setDetalleProductos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: cantidadValida } : item
      )
    )
  }

  const removerProductoDetalle = (index: number) => {
    setDetalleProductos((prev) => prev.filter((_, i) => i !== index))
  }

  const finalizarPedido = () => {
    if (!selectedCliente || selectedProductos.length === 0) {
      alert('Debe seleccionar un cliente y al menos un producto')
      return
    }

    const total_costo = selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio_costo * obtenerCantidadValida(item.cantidad),
      0
    )
    const total_venta = selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio_venta * obtenerCantidadValida(item.cantidad),
      0
    )

    const newPedido: Omit<Pedido, 'id_pedido'> = {
      id_cliente: selectedCliente.id_cliente,
      productos: selectedProductos,
      fecha: new Date().toISOString().split('T')[0],
      total_costo,
      total_venta: Math.max(0, total_venta - bonificacionAplicada),
      observaciones,
      bonificacion: bonificacionAplicada,
      monto_senia: 0,
      estado: 'Pendiente',
      pago: 'Debe',
    }

    addPedido(newPedido as any)
    setSelectedCliente(null)
    setSelectedProductos([])
    setSearchCliente('')
    setBonificacion('0')
    setObservaciones('')
  }

  const abrirDetallePedido = (pedido: Pedido) => {
    const productosDetalle = (pedido.productos || []).map((item) => enriquecerProducto(item))
    setPedidoDetalle({ ...pedido, productos: productosDetalle })
    setDetalleProductos(productosDetalle)
    setDetalleObservaciones(pedido.observaciones || '')
    setDetalleBonificacion(String(pedido.bonificacion || 0))
    setEditarDetalle(false)
    setMostrarDetalle(true)
  }

  const cerrarDetallePedido = () => {
    setMostrarDetalle(false)
    setEditarDetalle(false)
    setPedidoDetalle(null)
    setDetalleProductos([])
    setDetalleObservaciones('')
    setDetalleBonificacion('0')
  }

  const detalleSubtotal = detalleProductos.reduce(
    (sum, item) => sum + item.producto.precio_venta * obtenerCantidadValida(item.cantidad),
    0
  )
  const detalleBonificacionNumero = Math.max(0, parseFloat(detalleBonificacion) || 0)
  const detalleBonificacionAplicada = Math.min(detalleBonificacionNumero, detalleSubtotal)
  const detalleTotalFinal = Math.max(0, detalleSubtotal - detalleBonificacionAplicada)
  const detalleTotalCosto = detalleProductos.reduce(
    (sum, item) => sum + item.producto.precio_costo * obtenerCantidadValida(item.cantidad),
    0
  )
  const clienteDetalle = pedidoDetalle
    ? clientes.find((c) => String(c.id_cliente) === String(pedidoDetalle.id_cliente))
    : null
  const nombreClienteDetalle = clienteDetalle
    ? `${clienteDetalle.nombre} ${clienteDetalle.apellido}`.trim()
    : pedidoDetalle
      ? `Cliente #${pedidoDetalle.id_cliente}`
      : '-'

  const guardarCambiosPedido = async () => {
    if (!pedidoDetalle) return

    try {
      await updatePedido(String(pedidoDetalle.id_pedido), {
        ...pedidoDetalle,
        productos: detalleProductos,
        total_costo: detalleTotalCosto,
        total_venta: detalleTotalFinal,
        observaciones: detalleObservaciones,
        bonificacion: detalleBonificacionAplicada,
      })

      setPedidoDetalle({
        ...pedidoDetalle,
        productos: detalleProductos,
        total_costo: detalleTotalCosto,
        total_venta: detalleTotalFinal,
        observaciones: detalleObservaciones,
        bonificacion: detalleBonificacionAplicada,
      })
      setEditarDetalle(false)
    } catch (err) {
      console.error('Error al guardar cambios del pedido:', err)
      window.alert('No se pudo actualizar el pedido')
    }
  }

  const construirHtmlRemito = (modo: 'print' | 'jpg' = 'print') => {
    if (!pedidoDetalle) return ''

    const cliente = clientes.find(
      (c) => String(c.id_cliente) === String(pedidoDetalle.id_cliente)
    )
    const nombreCliente = cliente
      ? `${cliente.nombre} ${cliente.apellido}`.trim()
      : `Cliente #${pedidoDetalle.id_cliente}`
    const telefonoCliente = cliente?.telefono?.trim()

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    const filas = detalleProductos
      .map((item) => {
        const cantidadItem = obtenerCantidadValida(item.cantidad)
        const parcial = item.producto.precio_venta * cantidadItem
        return `<tr><td>${escapeHtml(item.producto.nombre_producto)}</td><td style="text-align:center">${cantidadItem}</td><td style="text-align:right">$${item.producto.precio_venta.toFixed(2)}</td><td style="text-align:right">$${parcial.toFixed(2)}</td></tr>`
      })
      .join('')

    const opacidadMarcaAgua = modo === 'jpg' ? 0.16 : 0.08

    return `
      <html>
        <head>
          <title>Remito Pedido #${pedidoDetalle.id_pedido}</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body {
              font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
              color: #202739;
              margin: 0;
              padding: 22px;
              background: radial-gradient(circle at top left, #f8f3ea, #eef3fb 55%, #f8f8f8);
            }
            .remito {
              position: relative;
              max-width: 1120px;
              margin: 0 auto;
              border: 1px solid #d7deec;
              border-radius: 14px;
              box-shadow: 0 10px 34px rgba(17, 24, 39, 0.08);
              padding: 22px;
              overflow: hidden;
              background: #ffffff;
              isolation: isolate;
            }
            .watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              z-index: 0;
            }
            .watermark img {
              width: 66%;
              max-width: 430px;
              max-height: 260px;
              opacity: ${opacidadMarcaAgua};
              object-fit: contain;
              filter: grayscale(4%) saturate(1.06);
            }
            .watermark .fallback {
              display: none;
              font-size: 78px;
              font-weight: 800;
              letter-spacing: 7px;
              color: #1a2a4a;
              opacity: 0.045;
              transform: rotate(-20deg);
              text-transform: uppercase;
            }
            .watermark.no-logo .fallback { display: block; }
            .content { position: relative; z-index: 1; }
            .header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 20px;
              border-bottom: 2px solid #27344d;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .brand-logo {
              width: 84px;
              height: 84px;
              border-radius: 10px;
              object-fit: contain;
              border: 1px solid #d6deed;
              background: #ffffff;
              padding: 2px;
            }
            .brand-name {
              font-family: 'Cambria', 'Times New Roman', serif;
              font-size: 36px;
              font-weight: 700;
              line-height: 1;
              letter-spacing: 0.3px;
              color: #1e2f4d;
            }
            .brand-slogan {
              color: #5f6e84;
              font-size: 12px;
              margin-top: 4px;
              letter-spacing: 0.4px;
            }
            .title-box { text-align: right; }
            .title-box h1 {
              margin: 0;
              font-size: 28px;
              letter-spacing: 1px;
              color: #1f2d4a;
            }
            .title-chip {
              display: inline-block;
              margin-top: 4px;
              margin-bottom: 3px;
              border: 1px solid #ced8ea;
              color: #334766;
              background: #f5f8ff;
              border-radius: 999px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.8px;
              padding: 4px 10px;
              text-transform: uppercase;
            }
            .title-box p { margin: 2px 0; color: #4f5e74; font-size: 12px; }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 16px;
            }
            .card {
              border: 1px solid #d7deec;
              border-radius: 10px;
              padding: 12px;
              background: linear-gradient(180deg, #ffffff, #fafcff);
            }
            .card h3 {
              margin: 0 0 8px;
              font-size: 13px;
              color: #1d2a44;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .line { margin: 4px 0; font-size: 13px; }
            .line strong { color: #1f2f4b; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              border: 1px solid #d7deec;
              border-radius: 10px;
              overflow: hidden;
            }
            th, td {
              padding: 9px;
              font-size: 12px;
              border-bottom: 1px solid #edf1f8;
            }
            th {
              background: linear-gradient(180deg, #273651, #334362);
              color: #f8f9fb;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.9px;
            }
            tr:nth-child(even) td { background: #fbfcff; }
            .totales {
              margin-top: 12px;
              margin-left: auto;
              width: 300px;
              background: linear-gradient(160deg, #f8fbff, #f0f5ff);
              border: 1px solid #d3deef;
              border-radius: 10px;
              padding: 10px 12px;
            }
            .totales-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              margin: 4px 0;
            }
            .totales-final {
              font-size: 16px;
              font-weight: 800;
              color: #132849;
              border-top: 1px solid #bccbe3;
              margin-top: 8px;
              padding-top: 8px;
            }
            .payment {
              margin-top: 14px;
              border: 1px solid #c9dcff;
              background: linear-gradient(135deg, #f4f8ff, #eaf3ff 62%, #f8fbff);
              border-radius: 10px;
              padding: 12px;
            }
            .payment-header {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              margin-bottom: 6px;
            }
            .payment-header h3 {
              margin: 0;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #18325b;
            }
            .payment .line { margin: 3px 0; font-size: 12px; }
            .footer {
              margin-top: 14px;
              border-top: 1px solid #d9e1ee;
              padding-top: 10px;
              font-size: 11px;
              color: #5a6780;
              text-align: center;
            }
            @media (max-width: 960px) {
              body { padding: 12px; }
              .header {
                flex-direction: column;
                align-items: flex-start;
              }
              .title-box {
                width: 100%;
                text-align: left;
              }
              .grid { grid-template-columns: 1fr; }
              .totales {
                margin-left: 0;
                width: 100%;
                max-width: 360px;
              }
            }
            @media print {
              body { background: #fff; }
              .remito {
                box-shadow: none;
                border-color: #d7deec;
              }
            }
          </style>
        </head>
        <body>
          <div class="remito">
            <div class="watermark">
              <img src="${EMPRESA_INFO.logoUrl}" onerror="this.style.display='none'; this.parentElement.classList.add('no-logo')" />
              <span class="fallback">${escapeHtml(EMPRESA_INFO.nombre)}</span>
            </div>

            <div class="content">
              <div class="header">
                <div class="brand">
                  <img class="brand-logo" src="${EMPRESA_INFO.logoUrl}" alt="Logo empresa" onerror="this.style.display='none'" />
                  <div>
                    <div class="brand-name">${escapeHtml(EMPRESA_INFO.nombre)}</div>
                    <div class="brand-slogan">${escapeHtml(EMPRESA_INFO.slogan)}</div>
                  </div>
                </div>
                <div class="title-box">
                  <h1>REMITO</h1>
                  <span class="title-chip">Comprobante interno</span>
                  <p><strong>Pedido:</strong> #${pedidoDetalle.id_pedido}</p>
                  <p><strong>Fecha:</strong> ${formatearFecha(pedidoDetalle.fecha)}</p>
                </div>
              </div>

              <div class="grid">
                <div class="card">
                  <h3>Datos del cliente</h3>
                  <div class="line"><strong>Cliente:</strong> ${escapeHtml(nombreCliente)}</div>
                  <div class="line"><strong>ID:</strong> ${escapeHtml(String(pedidoDetalle.id_cliente))}</div>
                  ${telefonoCliente ? `<div class="line"><strong>Teléfono:</strong> ${escapeHtml(telefonoCliente)}</div>` : ''}
                </div>
                <div class="card">
                  <h3>Datos de la empresa</h3>
                  <div class="line"><strong>Dirección:</strong> ${escapeHtml(EMPRESA_INFO.direccion)}</div>
                  <div class="line"><strong>Teléfono:</strong> ${escapeHtml(EMPRESA_INFO.telefono)}</div>
                  <div class="line"><strong>Email:</strong> ${escapeHtml(EMPRESA_INFO.email)}</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Importe Parcial</th>
                  </tr>
                </thead>
                <tbody>
                  ${filas}
                </tbody>
              </table>

              <div class="totales">
                <div class="totales-row"><span>Subtotal</span><span>$${detalleSubtotal.toFixed(2)}</span></div>
                <div class="totales-row"><span>Bonificación</span><span>-$${detalleBonificacionAplicada.toFixed(2)}</span></div>
                <div class="totales-row totales-final"><span>Total final</span><span>$${detalleTotalFinal.toFixed(2)}</span></div>
              </div>

              <div class="payment">
                <div class="payment-header">
                  <h3>Datos para transferencia</h3>
                </div>
                <div class="line"><strong>Titular:</strong> ${escapeHtml(TRANSFERENCIA_INFO.titular)}</div>
                ${TRANSFERENCIA_INFO.cuit.trim() ? `<div class="line"><strong>CUIT/CUIL:</strong> ${escapeHtml(TRANSFERENCIA_INFO.cuit)}</div>` : ''}
                <div class="line"><strong>Banco:</strong> ${escapeHtml(TRANSFERENCIA_INFO.banco)}</div>
                ${TRANSFERENCIA_INFO.cbu.trim() ? `<div class="line"><strong>CBU:</strong> ${escapeHtml(TRANSFERENCIA_INFO.cbu)}</div>` : ''}
                <div class="line"><strong>Alias:</strong> ${escapeHtml(TRANSFERENCIA_INFO.alias)}</div>
              </div>

              <div class="footer">
                Gracias por su compra. Conserve este remito como comprobante.
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const imprimirRemito = () => {
    const html = construirHtmlRemito('print')
    if (!html) return

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

  const exportarRemitoJPG = async () => {
    if (!pedidoDetalle) return

    const html = construirHtmlRemito('jpg')
    if (!html) return

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-10000px'
    iframe.style.top = '0'
    iframe.style.width = '1300px'
    iframe.style.height = '1800px'
    iframe.style.opacity = '0'
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)

    try {
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve()
        iframe.srcdoc = html
      })

      const iframeDocument = iframe.contentDocument
      if (!iframeDocument) {
        window.alert('No se pudo preparar el remito para exportar JPG')
        return
      }

      const imagenes = Array.from(iframeDocument.images)
      await Promise.all(
        imagenes.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve()
                return
              }
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            })
        )
      )

      const remitoNode = iframeDocument.querySelector('.remito') as HTMLElement | null
      if (!remitoNode) {
        window.alert('No se encontro el contenido del remito para exportar JPG')
        return
      }

      const html2canvas = await loadHtml2Canvas()

      const canvas = await html2canvas(remitoNode, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `remito-pedido-${pedidoDetalle.id_pedido}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    } catch (error) {
      console.error('Error al exportar remito en JPG:', error)
      window.alert('No se pudo exportar el remito en JPG')
    } finally {
      iframe.remove()
    }
  }

  const obtenerDataUrlImagen = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) return null

      const blob = await response.blob()
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
            return
          }
          resolve(null)
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  const aplicarOpacidadDataUrl = async (dataUrl: string, opacidad: number) => {
    return await new Promise<string>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height

        const context = canvas.getContext('2d')
        if (!context) {
          resolve(dataUrl)
          return
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.globalAlpha = Math.min(1, Math.max(0, opacidad))
        context.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  }

  const exportarRemitoPDF = async () => {
    if (!pedidoDetalle) return

    const cliente = clientes.find(
      (c) => String(c.id_cliente) === String(pedidoDetalle.id_cliente)
    )
    const nombreCliente = cliente
      ? `${cliente.nombre} ${cliente.apellido}`.trim()
      : `Cliente #${pedidoDetalle.id_cliente}`
    const telefonoCliente = cliente?.telefono?.trim()

    const JsPDF = await loadJsPDF()
    const pdf = new JsPDF()
    const companyLogoData = await obtenerDataUrlImagen(EMPRESA_INFO.logoUrl)
    const companyLogoWatermarkData = companyLogoData
      ? await aplicarOpacidadDataUrl(companyLogoData, 0.40)
      : null
    let y = 14

    if (companyLogoWatermarkData) {
      pdf.addImage(companyLogoWatermarkData, 'PNG', 48, 98, 112, 112)
      pdf.setTextColor(35, 35, 35)
      pdf.setFontSize(10)
    } else {
      pdf.setTextColor(220, 220, 220)
      pdf.setFontSize(56)
      pdf.text(EMPRESA_INFO.nombre.toUpperCase(), 35, 145, { angle: -25 })
      pdf.setTextColor(35, 35, 35)
    }

    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('REMITO', 14, y)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Pedido #${pedidoDetalle.id_pedido}`, 14, y + 7)
    pdf.text(`Fecha: ${formatearFecha(pedidoDetalle.fecha)}`, 14, y + 13)

    if (companyLogoData) {
      pdf.addImage(companyLogoData, 'PNG', 158, 10, 38, 20)
    }

    y = 36
    pdf.setDrawColor(17, 24, 39)
    pdf.setLineWidth(0.5)
    pdf.line(14, y, 196, y)
    y += 8

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('DATOS DEL CLIENTE', 14, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    y += 6
    pdf.text(`Cliente: ${nombreCliente}`, 14, y)
    y += 5
    pdf.text(`Cliente ID: ${pedidoDetalle.id_cliente}`, 14, y)
    if (telefonoCliente) {
      y += 5
      pdf.text(`Telefono: ${telefonoCliente}`, 14, y)
    }

    y += 8
    pdf.setFont('helvetica', 'bold')
    pdf.text('DETALLE DE PRODUCTOS', 14, y)
    y += 6

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('Producto', 14, y)
    pdf.text('Cant.', 108, y)
    pdf.text('P. Unitario', 132, y)
    pdf.text('Parcial', 170, y)
    y += 3
    pdf.line(14, y, 196, y)
    y += 6
    pdf.setFont('helvetica', 'normal')

    detalleProductos.forEach((item) => {
      const cantidadItem = obtenerCantidadValida(item.cantidad)
      const parcial = item.producto.precio_venta * cantidadItem

      if (y > 230) {
        pdf.addPage()
        y = 18
        if (companyLogoData) {
          pdf.addImage(companyLogoData, 'PNG', 145, 10, 48, 24)
        }
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.text('Producto', 14, y)
        pdf.text('Cant.', 108, y)
        pdf.text('P. Unitario', 132, y)
        pdf.text('Parcial', 170, y)
        y += 3
        pdf.line(14, y, 196, y)
        y += 6
        pdf.setFont('helvetica', 'normal')
      }

      pdf.text(item.producto.nombre_producto.substring(0, 45), 14, y)
      pdf.text(String(cantidadItem), 109, y)
      pdf.text(`$${item.producto.precio_venta.toFixed(2)}`, 132, y)
      pdf.text(`$${parcial.toFixed(2)}`, 170, y)
      y += 6
    })

    y += 2
    pdf.line(14, y, 196, y)
    y += 7
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text(`Subtotal: $${detalleSubtotal.toFixed(2)}`, 138, y)
    y += 6
    pdf.text(`Bonificacion: -$${detalleBonificacionAplicada.toFixed(2)}`, 138, y)
    y += 6
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text(`Total Final: $${detalleTotalFinal.toFixed(2)}`, 138, y)

    y += 10
    if (y > 250) {
      pdf.addPage()
      y = 18
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('DATOS PARA TRANSFERENCIA', 14, y)
    y += 6

    pdf.setFont('helvetica', 'normal')
    pdf.text(`Titular: ${TRANSFERENCIA_INFO.titular}`, 14, y)
    if (TRANSFERENCIA_INFO.cuit.trim()) {
      y += 5
      pdf.text(`CUIT/CUIL: ${TRANSFERENCIA_INFO.cuit}`, 14, y)
    }
    y += 5
    pdf.text(`Banco: ${TRANSFERENCIA_INFO.banco}`, 14, y)
    if (TRANSFERENCIA_INFO.cbu.trim()) {
      y += 5
      pdf.text(`CBU: ${TRANSFERENCIA_INFO.cbu}`, 14, y)
    }
    y += 5
    pdf.text(`Alias: ${TRANSFERENCIA_INFO.alias}`, 14, y)

    pdf.save(`remito-pedido-${pedidoDetalle.id_pedido}.pdf`)
  }

  const handleEstadoChange = async (id: string, newEstado: 'Pendiente' | 'Terminado' | 'Entregado') => {
    const pedido = pedidos.find((p) => p.id_pedido === id)
    if (!pedido) return

    try {
      await updatePedido(id, { ...pedido, estado: newEstado })
    } catch (err) {
      console.error('Error al modificar estado del pedido:', err)
      window.alert('No se pudo modificar el estado del pedido')
    }
  }

  const handlePagoChange = async (id: string, newPago: 'Debe' | 'Seña' | 'Pagado') => {
    const pedido = pedidos.find((p) => p.id_pedido === id)
    if (!pedido) return

    try {
      await updatePedido(id, {
        ...pedido,
        pago: newPago,
        monto_senia: newPago === 'Seña' ? normalizarMontoSenia(pedido.monto_senia) : 0,
      })
    } catch (err) {
      console.error('Error al modificar pago del pedido:', err)
      window.alert('No se pudo modificar el estado de pago del pedido')
    }
  }

  const handleSenaMontoChange = async (id: string, value: string) => {
    const pedido = pedidos.find((p) => p.id_pedido === id)
    if (!pedido) return

    try {
      await updatePedido(id, {
        ...pedido,
        monto_senia: normalizarMontoSenia(value),
      })
    } catch (err) {
      console.error('Error al guardar monto de seña:', err)
      window.alert('No se pudo guardar el monto de seña')
    }
  }

  const handleDeletePedido = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido?')) return

    try {
      await deletePedido(id)
    } catch (err) {
      console.error('Error al eliminar pedido:', err)
      window.alert('No se pudo eliminar el pedido')
    }
  }

  const columns = [
    { key: 'id_pedido', label: 'ID' },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: string) => formatearFecha(value),
    },
    {
      key: 'id_cliente',
      label: 'Cliente',
      render: (id_cliente: number | string) => {
        const cliente = clientes.find(
          (c) => String(c.id_cliente) === String(id_cliente)
        )

        if (!cliente) return `Cliente #${id_cliente}`

        return `${cliente.nombre} ${cliente.apellido}`.trim()
      },
    },
    {
      key: 'productos',
      label: 'Productos',
      render: (productos: PedidoProducto[]) => productos?.length || 0,
    },
    {
      key: 'total_venta',
      label: 'Total',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (estado: 'Pendiente' | 'Terminado' | 'Entregado', row: Pedido) => (
        <select
          value={estado}
          onChange={(e) => handleEstadoChange(row.id_pedido, e.target.value as 'Pendiente' | 'Terminado' | 'Entregado')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${estado === 'Entregado'
              ? 'bg-green-100 text-green-800'
              : estado === 'Terminado'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Terminado">Terminado</option>
          <option value="Entregado">Entregado</option>
        </select>
      ),
    },
    {
      key: 'pago',
      label: 'Pago',
      render: (pago: 'Debe' | 'Seña' | 'Pagado', row: Pedido) => (
        <div className="flex flex-col gap-2">
          <select
            value={pago}
            onChange={(e) => handlePagoChange(row.id_pedido, e.target.value as 'Debe' | 'Seña' | 'Pagado')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${pago === 'Pagado'
                ? 'bg-green-100 text-green-800'
                : pago === 'Seña'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}
          >
            <option value="Debe">Debe</option>
            <option value="Seña">Seña</option>
            <option value="Pagado">Pagado</option>
          </select>

          {pago === 'Seña' && (
            <input
              type="number"
              min="0"
              step="0.01"
              value={normalizarMontoSenia(row.monto_senia)}
              onChange={(e) => handleSenaMontoChange(row.id_pedido, e.target.value)}
              className="input-field text-sm"
              placeholder="Monto seña"
            />
          )}
        </div>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Pedido) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => abrirDetallePedido(row)}
            className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
          >
            Ver detalle
          </button>
          <button
            onClick={() => handleDeletePedido(row.id_pedido)}
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Pedidos</h1>

          {loading && <p className="text-gray-600">Cargando...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <FormCard title="Nuevo Pedido" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Cliente (ID o Nombre)
                </label>
                <input
                  type="text"
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="input-field"
                  placeholder="Buscar por ID o nombre..."
                />
                {filteredClientes.length > 0 && !selectedCliente && (
                  <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                    {filteredClientes.map((cliente) => (
                      <button
                        key={cliente.id_cliente}
                        type="button"
                        onClick={() => seleccionarCliente(cliente)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-0"
                      >
                        <span className="font-semibold">{cliente.id_cliente}</span> - {cliente.nombre} {cliente.apellido}
                      </button>
                    ))}
                  </div>
                )}
                {selectedCliente && (
                  <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center">
                    <span>
                      Cliente: {selectedCliente.nombre} {selectedCliente.apellido}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCliente(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Producto
                  </label>
                  <input
                    type="text"
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="input-field"
                    placeholder="Buscar por ID o nombre..."
                  />
                  {filteredProductos.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                      {filteredProductos.map((producto) => (
                        <button
                          key={producto.id_producto}
                          type="button"
                          onClick={() => seleccionarProducto(producto)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span>
                              <span className="font-semibold">{producto.id_producto}</span> - {producto.nombre_producto}
                            </span>
                            <span className="text-green-600 font-semibold">
                              ${producto.precio_venta.toFixed(2)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonificación ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bonificacion}
                  onChange={(e) => setBonificacion(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones del Pedido
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="input-field min-h-[90px]"
                  placeholder="Ejemplo: Diseño A4 de flores, colores pastel, tipografía serif..."
                />
              </div>

              {selectedProductos.length > 0 && (
                <div className="card p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Productos en el Pedido:</h3>
                  {selectedProductos.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center p-2 bg-white rounded mb-2"
                    >
                      <div className="flex items-center gap-3">
                        <span>{item.producto.nombre_producto}</span>
                        <input
                          type="number"
                          min="1"
                          value={obtenerCantidadValida(item.cantidad)}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              actualizarCantidadProducto(index, 1)
                              return
                            }

                            const parsed = parseInt(value, 10)
                            actualizarCantidadProducto(index, parsed)
                          }}
                          className="input-field w-20"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ${(item.producto.precio_venta * obtenerCantidadValida(item.cantidad)).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removerProducto(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="flex justify-between text-sm md:text-base mb-1">
                      <span>Subtotal:</span>
                      <span>${subtotalVenta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base mb-1">
                      <span>Bonificación:</span>
                      <span>-${bonificacionAplicada.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base md:text-lg">
                      <span>Total:</span>
                      <span>${totalFinalVenta.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={finalizarPedido}
                  className="btn-primary"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </FormCard>

          <DataTable
            columns={columns}
            data={pedidosFiltrados}
            searchable
            searchPlaceholder="Buscar pedido..."
          />

          {(estadoFiltro || idFiltro) && (
            <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-violet-900">
                Filtro activo: {estadoFiltro ? `Estado ${estadoFiltro}` : 'Todos los estados'}
                {idFiltro ? ` · Pedido ${idFiltro}` : ''}
              </p>
              <Link
                to="/pedidos"
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Limpiar filtro
              </Link>
            </div>
          )}

          {mostrarDetalle && pedidoDetalle && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Detalle Pedido #{pedidoDetalle.id_pedido}</h2>
                  <button
                    type="button"
                    onClick={cerrarDetallePedido}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-semibold">{formatearFecha(pedidoDetalle.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-semibold">{nombreClienteDetalle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente ID</p>
                    <p className="font-semibold">{pedidoDetalle.id_cliente}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Observaciones</p>
                  {editarDetalle ? (
                    <textarea
                      value={detalleObservaciones}
                      onChange={(e) => setDetalleObservaciones(e.target.value)}
                      className="input-field min-h-[90px]"
                    />
                  ) : (
                    <p className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {detalleObservaciones || '-'}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Productos</h3>
                  <div className="space-y-2">
                    {detalleProductos.length === 0 && (
                      <p className="text-sm text-gray-500">No hay productos cargados en este pedido.</p>
                    )}
                    {detalleProductos.map((item, index) => {
                      const cantidadItem = obtenerCantidadValida(item.cantidad)
                      const parcial = item.producto.precio_venta * cantidadItem

                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span>{item.producto.nombre_producto}</span>
                            {editarDetalle ? (
                              <input
                                type="number"
                                min="1"
                                value={cantidadItem}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value || '1', 10)
                                  actualizarCantidadDetalle(index, parsed)
                                }}
                                className="input-field w-20"
                              />
                            ) : (
                              <span className="font-medium">x {cantidadItem}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold">${parcial.toFixed(2)}</span>
                            {editarDetalle && (
                              <button
                                type="button"
                                onClick={() => removerProductoDetalle(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-2">Bonificación ($)</label>
                  {editarDetalle ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalleBonificacion}
                      onChange={(e) => setDetalleBonificacion(e.target.value)}
                      className="input-field max-w-xs"
                    />
                  ) : (
                    <p className="font-semibold">${detalleBonificacionAplicada.toFixed(2)}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-5">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal</span>
                    <span>${detalleSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bonificación</span>
                    <span>-${detalleBonificacionAplicada.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${detalleTotalFinal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={imprimirRemito}
                    className="btn-secondary"
                  >
                    Imprimir Remito
                  </button>
                  <button
                    type="button"
                    onClick={exportarRemitoPDF}
                    className="btn-secondary"
                  >
                    Exportar PDF
                  </button>
                  <button
                    type="button"
                    onClick={exportarRemitoJPG}
                    className="btn-secondary"
                  >
                    Exportar JPG
                  </button>
                  {editarDetalle ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditarDetalle(false)}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={guardarCambiosPedido}
                        className="btn-primary"
                      >
                        Guardar cambios
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditarDetalle(true)}
                      className="btn-primary"
                    >
                      Editar Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
