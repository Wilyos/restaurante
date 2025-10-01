// Simulación de API de menú con persistencia en localStorage
const STORAGE_KEY = 'resto.menu.v1';
const ID_KEY = 'resto.menu.id.v1';

const DEFAULT_MENU = [
  { id: 1, nombre: 'Hamburguesa', tipo: 'comida', requierePreparacion: true, precio: 18000, disponible: true },
  { id: 2, nombre: 'Pizza', tipo: 'comida', requierePreparacion: true, precio: 22000, disponible: true },
  { id: 3, nombre: 'Ensalada', tipo: 'comida', requierePreparacion: true, precio: 15000, disponible: true },
  { id: 4, nombre: 'Gaseosa', tipo: 'bebida', requierePreparacion: false, precio: 5000, disponible: true },
  { id: 5, nombre: 'Jugo natural', tipo: 'bebida', requierePreparacion: true, precio: 7000, disponible: true },
  { id: 6, nombre: 'Cerveza', tipo: 'bebida', requierePreparacion: false, precio: 8000, disponible: true },
  { id: 7, nombre: 'Agua', tipo: 'bebida', requierePreparacion: false, precio: 4000, disponible: true }
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Semilla inicial
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MENU));
      localStorage.setItem(ID_KEY, String(Math.max(...DEFAULT_MENU.map(i => i.id)) + 1));
      return [...DEFAULT_MENU];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_MENU];
    return parsed;
  } catch (e) {
    return [...DEFAULT_MENU];
  }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextId() {
  const current = Number(localStorage.getItem(ID_KEY) || '8');
  localStorage.setItem(ID_KEY, String(current + 1));
  return current;
}

export function getMenu() {
  return Promise.resolve(load());
}

export function addMenuItem(item) {
  const list = load();
  const nuevo = {
    id: nextId(),
    nombre: String(item.nombre || '').trim(),
    tipo: item.tipo || 'comida',
    requierePreparacion: !!item.requierePreparacion,
    precio: Number(item.precio) || 0,
    disponible: item.disponible !== undefined ? !!item.disponible : true,
  };
  list.push(nuevo);
  save(list);
  return Promise.resolve(nuevo);
}

export function updateMenuItem(id, updates) {
  const list = load();
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return Promise.reject(new Error('Item no encontrado'));
  const upd = { ...list[idx], ...updates, precio: updates.precio !== undefined ? Number(updates.precio) : list[idx].precio };
  list[idx] = upd;
  save(list);
  return Promise.resolve(upd);
}

export function deleteMenuItem(id) {
  const list = load();
  const filtered = list.filter(i => i.id !== id);
  save(filtered);
  return Promise.resolve(true);
}

export function resetMenu() {
  save(DEFAULT_MENU);
  localStorage.setItem(ID_KEY, String(Math.max(...DEFAULT_MENU.map(i => i.id)) + 1));
  return Promise.resolve(load());
}
