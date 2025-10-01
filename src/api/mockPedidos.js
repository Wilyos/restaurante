// Simulación de una API backend para pedidos
let pedidos = [];
let id = 1;

export function getPedidos() {
  return Promise.resolve([...pedidos]);
}


// pedido: { nombre, items: [{producto, cantidad, preparado: bool}], bebidasSinPreparar: [{producto, cantidad}] }

export function crearPedido(pedido) {
  const nuevo = {
    ...pedido,
    id: id++, 
    estado: 'pendiente',
    creado: new Date().toISOString(),
    items: (pedido.items || []).map(i => ({
      ...i,
      preparado: Array(i.cantidad).fill(false), // Un array por cada unidad
      entregado: false
    })),
    bebidas: (pedido.items || [])
      .filter(i => i.producto.tipo === 'bebida')
      .map(i => ({
        ...i,
        entregada: Array(i.cantidad).fill(false)
      })),
  };
  pedidos.push(nuevo);
  return Promise.resolve(nuevo);
}


// Cambia el estado general del pedido
export function cambiarEstadoPedido(idPedido, nuevoEstado) {
  pedidos = pedidos.map(p => p.id === idPedido ? { ...p, estado: nuevoEstado } : p);
  return Promise.resolve(pedidos.find(p => p.id === idPedido));
}


// Cambia el estado de preparación de una unidad de un ítem específico (platillo)
export function marcarItemPreparado(idPedido, idxItem, idxUnidad) {
  pedidos = pedidos.map(p => {
    if (p.id !== idPedido) return p;
    const items = p.items.map((item, idx) => {
      if (idx !== idxItem) return item;
      const preparadoArr = Array.isArray(item.preparado) ? [...item.preparado] : Array(item.cantidad).fill(false);
      preparadoArr[idxUnidad] = true;
      return { ...item, preparado: preparadoArr };
    });
    // Si todos los items (no bebidas) están preparados y todas las bebidas están entregadas, marcar pedido como entregado
  const allPlatillosListos = items.filter(i => i.producto.tipo !== 'bebida').every(i => Array.isArray(i.preparado) && i.preparado.every(Boolean));
  const allBebidasEntregadas = (p.bebidas || []).every(b => Array.isArray(b.entregada) && b.entregada.every(Boolean));
    let estado = p.estado;
    if (allPlatillosListos && allBebidasEntregadas && p.estado !== 'entregado-al-cliente' && p.estado !== 'pagado') {
      estado = 'entregado';
    }
    return { ...p, items, estado };
  });
  return Promise.resolve(pedidos.find(p => p.id === idPedido));
}

// Marca una bebida como entregada
export function marcarBebidaEntregada(idPedido, idxBebida, idxUnidad) {
  pedidos = pedidos.map(p => {
    if (p.id !== idPedido) return p;
    const bebidas = (p.bebidas || []).map((b, idx) => {
      if (idx !== idxBebida) return b;
      const entregadaArr = Array.isArray(b.entregada) ? [...b.entregada] : Array(b.cantidad).fill(false);
      entregadaArr[idxUnidad] = true;
      return { ...b, entregada: entregadaArr };
    });
    // Si todos los items (no bebidas) están preparados y todas las bebidas están entregadas, marcar pedido como entregado
    const allPlatillosListos = (p.items || []).filter(i => i.producto.tipo !== 'bebida').every(i => Array.isArray(i.preparado) && i.preparado.every(Boolean));
    const allBebidasEntregadas = bebidas.every(b => Array.isArray(b.entregada) && b.entregada.every(Boolean));
    let estado = p.estado;
    if (allPlatillosListos && allBebidasEntregadas && p.estado !== 'entregado-al-cliente' && p.estado !== 'pagado') {
      estado = 'entregado';
    }
    return { ...p, bebidas, estado };
  });
  return Promise.resolve(pedidos.find(p => p.id === idPedido));
}

export function resetPedidos() {
  pedidos = [];
  id = 1;
}
