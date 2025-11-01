import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [productos, setProductos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [mostrarOrdenes, setMostrarOrdenes] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch("http://localhost:3001/productos");
      const data = await response.json();
      const productosConvertidos = data.map((p) => ({
        ...p,
        precio: parseFloat(p.precio),
        stock: parseInt(p.stock),
      }));
      setProductos(productosConvertidos);
    } catch {
      alert("❌ Error al cargar los productos");
    }
  };

  const registrarDatos = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock || !categoria || !descripcion) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    if (editIndex !== null) {
      try {
        const producto = productos[editIndex];
        const response = await fetch(
          `http://localhost:3001/productos/${producto.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, precio, stock, categoria, descripcion }),
          }
        );

        if (response.ok) {
          const nuevos = [...productos];
          nuevos[editIndex] = { ...producto, nombre, precio, stock, categoria, descripcion };
          setProductos(nuevos);
          setEditIndex(null);
          alert("✅ Producto actualizado correctamente");
        } else {
          alert("❌ Error al actualizar el producto");
        }
      } catch {
        alert("❌ Error de conexión al actualizar");
      }
    } else {
      try {
        const response = await fetch("http://localhost:3001/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock, categoria, descripcion }),
        });
        const data = await response.json();
        if (response.ok) {
          setProductos([...productos, data]);
          alert("✅ Producto guardado correctamente");
        } else {
          alert("❌ Error al guardar el producto");
        }
      } catch {
        alert("❌ Error de conexión");
      }
    }

    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setNombre("");
    setPrecio(0);
    setStock(0);
    setCategoria("");
    setDescripcion("");
  };

  const eliminarProducto = async (idx) => {
    const producto = productos[idx];
    if (!window.confirm(`⚠️ ¿Eliminar el producto "${producto.nombre}"?`)) return;

    try {
      const response = await fetch(`http://localhost:3001/productos/${producto.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProductos(productos.filter((_, i) => i !== idx));
        if (editIndex === idx) {
          setEditIndex(null);
          limpiarFormulario();
        }
        alert("🗑️ Producto eliminado correctamente");
      } else {
        alert("❌ Error al eliminar el producto");
      }
    } catch {
      alert("❌ Error de conexión al eliminar");
    }
  };

  const editarProducto = (idx) => {
    const prod = productos[idx];
    setNombre(prod.nombre);
    setPrecio(prod.precio);
    setStock(prod.stock);
    setCategoria(prod.categoria);
    setDescripcion(prod.descripcion);
    setEditIndex(idx);
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((item) => item.id === producto.id);
    if (existe) {
      alert("⚠️ Este producto ya está en el carrito.");
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
      alert(`🛒 "${producto.nombre}" agregado al carrito`);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const totalCarrito = carrito.reduce(
    (total, item) => total + parseFloat(item.precio) * item.cantidad,
    0
  );

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      alert("⚠️ El carrito está vacío.");
      return;
    }

    try {
      for (const producto of carrito) {
        await fetch("http://localhost:3001/carrito/agregar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ producto }),
        });
      }

      const response = await fetch("http://localhost:3001/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al procesar la orden");

      alert(`✅ Orden creada correctamente (ID: ${data.ordenId}) Total: $${data.total.toFixed(2)}`);
      setCarrito([]);
    } catch {
      alert("❌ Error al procesar la orden");
    }
  };

  const cargarOrdenes = async () => {
    try {
      const response = await fetch("http://localhost:3001/ordenes");
      const data = await response.json();
      setOrdenes(data);
    } catch {
      alert("❌ Error al cargar las órdenes");
    }
  };

  const eliminarOrden = async (id) => {
    if (!window.confirm("¿Marcar esta orden como entregada?")) return;

    try {
      const response = await fetch(`http://localhost:3001/ordenes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrdenes(ordenes.filter((o) => o.id !== id));
        alert("✅ Orden marcada como entregada y eliminada");
      } else {
        alert("❌ Error al eliminar la orden");
      }
    } catch {
      alert("❌ Error de conexión al eliminar orden");
    }
  };

  const productosFiltrados = productos.filter(
    (prod) =>
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="App">
      <header className="header">
        <h1 className="titulo-principal">🏪 Gestión de Productos</h1>
        <p className="subtitulo">Administra tus productos y gestiona el carrito de compras</p>
        <button
          className="btn-ver-ordenes"
          onClick={() => {
            if (!mostrarOrdenes) cargarOrdenes();
            setMostrarOrdenes(!mostrarOrdenes);
          }}
        >
          🧾 {mostrarOrdenes ? "Ocultar Órdenes" : "Ver Órdenes"}
        </button>
      </header>

      <section className="formulario-section">
        <h2 className="seccion-titulo">
          {editIndex !== null ? "✏️ Editar Producto" : "➕ Registrar Nuevo Producto"}
        </h2>

        <div className="formulario">
          <label>
            Nombre:
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label>
            Precio:
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
            />
          </label>
          <label>
            Stock:
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </label>
          <label>
            Categoría:
            <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Descripción:
            <textarea
              rows="3"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>

          <button className="btn-registrar" onClick={registrarDatos}>
            {editIndex !== null ? "💾 Guardar Cambios" : "📥 Registrar Producto"}
          </button>
        </div>
      </section>

      <section className="busqueda-section">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
      </section>

      <h3 className="contador">📦 Total de productos: {productosFiltrados.length}</h3>

      {productosFiltrados.length > 0 ? (
        <section className="tabla-section">
          <h2 className="seccion-titulo">📋 Lista de Productos</h2>
          <div className="tabla-container">
            <table className="tabla-registros">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((prod, idx) => (
                  <tr key={idx}>
                    <td>{prod.nombre}</td>
                    <td>${parseFloat(prod.precio).toFixed(2)}</td>
                    <td>{prod.stock}</td>
                    <td>{prod.categoria}</td>
                    <td>{prod.descripcion}</td>
                    <td>
                      <button className="btn-editar" onClick={() => editarProducto(idx)}>
                        ✏️ Editar
                      </button>
                      <button className="btn-eliminar" onClick={() => eliminarProducto(idx)}>
                        🗑️ Eliminar
                      </button>
                      <button className="btn-agregar" onClick={() => agregarAlCarrito(prod)}>
                        🛒 Agregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="mensaje-vacio">📭 No hay productos registrados aún.</p>
      )}

      <section className="carrito-section">
        <h2 className="seccion-titulo">🛍️ Carrito de Compras</h2>
        {carrito.length > 0 ? (
          <>
            <table className="tabla-registros">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>${parseFloat(item.precio).toFixed(2)}</td>
                    <td>{item.cantidad}</td>
                    <td>${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.id)}>
                        ❌ Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="carrito-total">💰 Total: ${totalCarrito.toFixed(2)}</p>
            <button className="btn-finalizar" onClick={finalizarCompra}>
              ✅ Finalizar Compra
            </button>
          </>
        ) : (
          <p className="mensaje-vacio">🛍️ Tu carrito está vacío.</p>
        )}
      </section>

      {mostrarOrdenes && (
        <section className="ordenes-section">
          <h2 className="seccion-titulo">📦 Órdenes Realizadas</h2>
          {ordenes.length > 0 ? (
            <table className="tabla-registros">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.id}</td>
                    <td>${parseFloat(orden.total).toFixed(2)}</td>
                    <td>{new Date(orden.fecha).toLocaleString("es-CO") || "—"}</td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarOrden(orden.id)}>
                        ✅ Marcar Entregada
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mensaje-vacio">📭 No hay órdenes registradas aún.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
