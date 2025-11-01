# crud-node-react-sql-productos
Adaptación del proyecto base CRUD Node-React-MySQL (Empleados) hacia un sistema de gestión de productos para una tienda. Incluye funcionalidades de carrito de compras y gestión de órdenes, manteniendo la misma arquitectura en tres capas del proyecto original.

## Tecnologías utilizadas

**Frontend (cliente):**
- React.js  
- Axios  
- CSS  

**Backend (servidor):**
- Node.js + Express.js  
- MySQL  
- CORS  

---

## Funcionalidades principales

- CRUD completo de productos (crear, listar, actualizar, eliminar)
- Carrito de compras en memoria
- Generación y visualización de órdenes de compra
- Relación entre órdenes y productos en base de datos
- Comunicación entre frontend y backend vía API REST

---

## Instalación y ejecución

### 1️ Clonar el repositorio
```bash
git clone https://github.com/nicifuentes33/crud-node-react-sql-productos.git
```

### 2 Instalar dependencias
cd client
npm install
cd ../server
npm install

### 3 Configurar base de datos MySQL
Crea una base de datos (por ejemplo tienda_db) y ejecuta el siguiente esquema:

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  precio DECIMAL(10,2),
  stock INT,
  categoria VARCHAR(50),
  descripcion TEXT
);

CREATE TABLE ordenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10,2),
  fecha DATETIME
);

CREATE TABLE orden_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT,
  producto_id INT,
  cantidad INT,
  FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

## Datos de prueba

INSERT INTO productos (nombre, precio, stock, categoria, descripcion) VALUES
('Camiseta básica', 49.99, 25, 'Ropa', 'Camiseta 100% algodón, color blanco'),
('Auriculares Bluetooth', 129.99, 10, 'Electrónica', 'Auriculares inalámbricos con cancelación de ruido'),
('Mouse Gamer', 89.50, 15, 'Accesorios', 'Mouse RGB con 7 botones programables'),
('Zapatos deportivos', 199.00, 8, 'Calzado', 'Zapatillas para running con amortiguación'),
('Mochila escolar', 79.00, 12, 'Accesorios', 'Mochila con compartimento para laptop');

Luego, ajusta tus credenciales en el archivo:
server/db.js

##Ejecución del proyecto
Ejecuta ambos servidores en terminales separadas:

Frontend
cd client
npm start

Backend
cd server
npm run dev

Estructura del proyecto
crud-node-react-sql-productos/
│
├── client/         
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── ...
│
├── server/        
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── ...
└──
Autor

Nicolás Cifuentes
Proyecto académico - CRUD Node + React + SQL (Gestión de Productos)






