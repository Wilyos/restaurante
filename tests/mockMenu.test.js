import { beforeEach, describe, expect, it } from 'vitest';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, resetMenu } from '../src/api/mockMenu';

// Simple polyfill to isolate localStorage between tests (jsdom provides one, but we reset explicitly)
function clearLS() {
  localStorage.clear();
}

describe('mockMenu CRUD', () => {
  beforeEach(async () => {
    clearLS();
    await resetMenu();
  });

  it('getMenu returns seeded items', async () => {
    const list = await getMenu();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    const campos = ['id','nombre','tipo','requierePreparacion','precio','disponible'];
    campos.forEach(k => expect(list[0]).toHaveProperty(k));
  });

  it('addMenuItem adds a new item with incremental id', async () => {
    const before = await getMenu();
    const nuevo = await addMenuItem({ nombre: 'Prueba X', tipo: 'comida', requierePreparacion: true, precio: 1234, disponible: true });
    expect(nuevo).toHaveProperty('id');
    expect(nuevo.nombre).toBe('Prueba X');
    const after = await getMenu();
    expect(after.length).toBe(before.length + 1);
    expect(after.some(i => i.id === nuevo.id)).toBe(true);
  });

  it('updateMenuItem updates fields', async () => {
    const list = await getMenu();
    const target = list[0];
    const updated = await updateMenuItem(target.id, { precio: target.precio + 1000, disponible: false });
    expect(updated.precio).toBe(target.precio + 1000);
    expect(updated.disponible).toBe(false);
  });

  it('deleteMenuItem removes an item', async () => {
    const list = await getMenu();
    const id = list[0].id;
    await deleteMenuItem(id);
    const after = await getMenu();
    expect(after.some(i => i.id === id)).toBe(false);
  });
});
