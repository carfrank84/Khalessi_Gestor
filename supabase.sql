--- Drop existing tables if they exist (CUIDADO: esto borra los datos)
DROP TABLE IF EXISTS pedidos_productos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS insumos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

-- Crear tabla de clientes
CREATE TABLE clientes (
  id_cliente BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE productos (
  id_producto BIGSERIAL PRIMARY KEY,
  nombre_producto VARCHAR(200) NOT NULL,
  precio_costo DECIMAL(10, 2) NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de insumos (stock)
CREATE TABLE insumos (
  id_insumo BIGSERIAL PRIMARY KEY,
  nombre_insumo VARCHAR(200) NOT NULL,
  precio_costo DECIMAL(10, 2) NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de pedidos
CREATE TABLE pedidos (
  id_pedido BIGSERIAL PRIMARY KEY,
  id_cliente BIGINT NOT NULL,
  fecha DATE NOT NULL,
  total_costo DECIMAL(10, 2) NOT NULL,
  total_venta DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  pago VARCHAR(50) NOT NULL DEFAULT 'Debe',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

-- Crear tabla de relación pedidos_productos (muchos a muchos)
CREATE TABLE pedidos_productos (
  id_pedido_producto BIGSERIAL PRIMARY KEY,
  id_pedido BIGINT NOT NULL,
  id_producto BIGINT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_pedidos_productos_pedido ON pedidos_productos(id_pedido);
CREATE INDEX idx_pedidos_productos_producto ON pedidos_productos(id_producto);

-- Datos de ejemplo para pruebas
INSERT INTO clientes (nombre, apellido, direccion, telefono, email) VALUES
('Juan', 'García', 'Calle 123 Apt 5', '1234567890', 'juan@example.com'),
('María', 'López', 'Avenida 456', '0987654321', 'maria@example.com'),
('Carlos', 'Martínez', 'Calle 789', '5555555555', 'carlos@example.com');

INSERT INTO productos (nombre_producto, precio_costo, precio_venta) VALUES
('Laptop', 500.00, 800.00),
('Mouse', 10.00, 25.00),
('Teclado', 30.00, 60.00),
('Monitor', 150.00, 250.00);

INSERT INTO insumos (nombre_insumo, precio_costo, cantidad) VALUES
('Cable USB', 2.00, 100),
('Adaptador HDMI', 5.00, 50),
('Protector Pantalla', 3.00, 75),
('Funda Laptop', 8.00, 30);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_productos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acceso público para desarrollo)
CREATE POLICY "Allow public access to clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to productos" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to insumos" ON insumos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to pedidos_productos" ON pedidos_productos FOR ALL USING (true) WITH CHECK (true);
