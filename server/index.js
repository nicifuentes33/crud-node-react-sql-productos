const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// CRUD de productos
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los productos' });
    res.json(results);
  });
});

app.post('/productos', (req, res) => {
  const { nombre, precio, stock, categoria, descripcion } = req.body;
  if (!nombre || !precio || !stock || !categoria || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const sql = 'INSERT INTO productos (nombre, precio, stock, categoria, descripcion) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nombre, precio, stock, categoria, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar el producto' });
    res.json({ id: result.insertId, nombre, precio, stock, categoria, descripcion });
  });
});

app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria, descripcion } = req.body;

  const sql = 'UPDATE productos SET nombre=?, precio=?, stock=?, categoria=?, descripcion=? WHERE id=?';
  db.query(sql, [nombre, precio, stock, categoria, descripcion, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar el producto' });
    res.json({ message: 'Producto actualizado correctamente' });
  });
});

app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar el producto' });
    res.json({ message: 'Producto eliminado correctamente' });
  });
});

// Carrito (en memoria)
let carrito = [];

app.post('/carrito/agregar', (req, res) => {
  const { producto } = req.body;
  if (!producto || !producto.id) {
    return res.status(400).json({ error: 'Producto inválido' });
  }

  const existe = carrito.find((p) => p.id === producto.id);
  if (!existe) carrito.push({ ...producto, cantidad: 1 });

  res.json({ message: 'Producto agregado al carrito', carrito });
});

app.delete('/carrito/:id', (req, res) => {
  const { id } = req.params;
  carrito = carrito.filter((p) => p.id != id);
  res.json({ message: 'Producto eliminado del carrito', carrito });
});

app.get('/carrito/total', (req, res) => {
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  res.json({ total, carrito });
});

// Órdenes de compra
app.post('/ordenes', (req, res) => {
  if (carrito.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const sqlOrden = 'INSERT INTO ordenes (total, fecha) VALUES (?, NOW())';

  db.query(sqlOrden, [total], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear la orden' });

    const ordenId = result.insertId;
    const valores = carrito.map((item) => [ordenId, item.id, item.cantidad]);
    const sqlDetalle = 'INSERT INTO orden_productos (orden_id, producto_id, cantidad) VALUES ?';

    db.query(sqlDetalle, [valores], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al guardar los productos de la orden' });

      carrito = [];
      res.json({ message: 'Orden creada correctamente', ordenId, total });
    });
  });
});

app.get('/ordenes', (req, res) => {
  const sql = 'SELECT id, total, fecha FROM ordenes ORDER BY fecha DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener las órdenes' });
    res.json(results);
  });
});

app.delete('/ordenes/:id', (req, res) => {
  const { id } = req.params;
  const sqlRelacion = 'DELETE FROM orden_productos WHERE orden_id = ?';
  db.query(sqlRelacion, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar productos de la orden' });

    const sqlOrden = 'DELETE FROM ordenes WHERE id = ?';
    db.query(sqlOrden, [id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al eliminar la orden' });
      res.json({ message: 'Orden marcada como entregada y eliminada correctamente' });
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo desde el puerto ${PORT}`);
});


