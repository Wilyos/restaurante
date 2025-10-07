
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Layout from '../components/Layout';
import { getPedidos, cambiarEstadoPedido } from '../api/mockPedidos';

export default function Caja() {
  useEffect(() => {
    document.body.classList.add("bg-caja");
    return () => document.body.classList.remove("bg-caja");
  }, []);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarPedidos = async () => {
    setLoading(true);
    const data = await getPedidos();
    setPedidos(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);


  const marcarEntregado = async (id) => {
    await cambiarEstadoPedido(id, 'entregado');
    cargarPedidos();
  };

  const marcarPagado = async (id) => {
    await cambiarEstadoPedido(id, 'pagado');
    cargarPedidos();
  };

  const imprimirTicket = (pedido) => {
    const total = calcularTotal(pedido);
    const fecha = new Date().toLocaleString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    const numeroComprobante = `${String(pedido.id).padStart(6, '0')}-${Date.now().toString().slice(-4)}`;
    
    const items = [];
    if (pedido.items) {
      pedido.items.forEach(i => items.push({
        cantidad: i.cantidad,
        nombre: i.producto.nombre,
        precio: i.producto.precio || 0,
        subtotal: i.cantidad * (i.producto.precio || 0)
      }));
    }
    if (pedido.bebidasSinPreparar) {
      pedido.bebidasSinPreparar.forEach(b => items.push({
        cantidad: b.cantidad,
        nombre: b.producto.nombre,
        precio: b.producto.precio || 0,
        subtotal: b.cantidad * (b.producto.precio || 0)
      }));
    }

    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Comprobante #${numeroComprobante}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      body { 
        font-family: 'Courier New', monospace; 
        margin: 0; 
        padding: 8px; 
        width: 72mm; 
        font-size: 12px;
        line-height: 1.2;
        color: #000;
      }
      .header { text-align: center; margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
      .logo { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
      .direccion { font-size: 10px; }
      .info { margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .items { margin-bottom: 12px; }
      .item { margin-bottom: 4px; }
      .item-line1 { display: flex; justify-content: space-between; font-weight: bold; }
      .item-line2 { font-size: 10px; color: #666; margin-left: 16px; }
      .total-section { border-top: 2px solid #000; padding-top: 8px; }
      .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
      .footer { text-align: center; margin-top: 16px; font-size: 10px; border-top: 1px dashed #000; padding-top: 8px; }
      .center { text-align: center; }
      @media print { 
        button { display: none; } 
        body { width: 80mm; }
      }
    </style></head><body>
    
    <div class='header'>
      <div class='logo'>🍽️ RESTAURANTE NFC</div>
      <div class='direccion'>
        Carrera 54 #53 - 115<br>
        Tel: (555) 123-4567<br>
        NIT: 123456789-0
      </div>
    </div>

    <div class='info'>
      <div class='info-row'><span>Comprobante:</span><span>#${numeroComprobante}</span></div>
      <div class='info-row'><span>Mesa:</span><span>${pedido.mesa || 'N/A'}</span></div>
      <div class='info-row'><span>Fecha:</span><span>${fecha}</span></div>
      <div class='info-row'><span>Mesero:</span><span>Sistema</span></div>
    </div>

    <div class='items'>
      ${items.map(item => `
        <div class='item'>
          <div class='item-line1'>
            <span>${item.cantidad} x ${item.nombre}</span>
            <span>$${item.subtotal.toLocaleString()}</span>
          </div>
          <div class='item-line2'>@ $${item.precio.toLocaleString()} c/u</div>
        </div>
      `).join('')}
    </div>

    <div class='total-section'>
      <div class='total-row'>
        <span>TOTAL:</span>
        <span>$${total.toLocaleString()}</span>
      </div>
    </div>

    <div class='footer'>
      ¡Gracias por su visita!<br>
      Vuelva pronto
    </div>

    <div class='center' style='margin-top: 16px;'>
      <button onclick='window.print()' style='padding: 8px 16px; font-size: 12px;'>🖨️ Imprimir</button>
    </div>
    
    </body></html>`;
    
    const win = window.open('', '_blank', 'width=320,height=700,scrollbars=yes');
    if (win) {
      win.document.write(html);
      win.document.close();
      // Auto print after delay
      setTimeout(() => { 
        try { 
          win.print(); 
        } catch(e) {
          console.warn('Auto-print failed:', e);
        }
      }, 500);
    }
  };

  // Función para calcular el total del pedido
  const calcularTotal = (pedido) => {
    let total = 0;
    if (pedido.items && pedido.items.length > 0) {
      total += pedido.items.reduce((acc, i) => acc + i.cantidad * (i.producto.precio || 0), 0);
    }
    if (pedido.bebidasSinPreparar && pedido.bebidasSinPreparar.length > 0) {
      total += pedido.bebidasSinPreparar.reduce((acc, b) => acc + b.cantidad * (b.producto.precio || 0), 0);
    }
    return total;
  };

  return (
    <Layout title="Caja">
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#9c27b0', fontWeight: 'bold' }}>
        💰 Pedidos listos para cobrar
      </Typography>
      
      {loading ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>🔄 Cargando pedidos...</Typography>
        </Paper>
      ) : pedidos.filter(p => p.estado === 'entregado-al-cliente').length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" color="text.secondary">
            📋 No hay pedidos para cobrar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Los pedidos entregados al cliente aparecerán aquí
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {pedidos.filter(p => p.estado === 'entregado-al-cliente').map(p => (
            <Paper 
              key={p.id} 
              elevation={4} 
              sx={{ 
                p: 3, 
                border: '2px solid #9c27b0',
                borderRadius: 2,
                bgcolor: '#fce4ec'
              }}
            >
              {/* Header del pedido */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  🧾 Pedido #{p.id}
                </Typography>
                <Chip 
                  label={`Mesa ${p.mesa || 'N/A'}`}
                  color="secondary"
                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                />
              </Box>

              {/* Items del pedido */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#7b1fa2' }}>
                Items a cobrar:
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {/* Comidas */}
                {p.items && p.items.length > 0 && p.items.map((item, idx) => (
                  <Paper 
                    key={idx} 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      bgcolor: '#fff',
                      border: '1px solid #e1bee7'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          🍽️ {item.cantidad}x {item.producto.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${item.producto.precio?.toLocaleString() || 0} c/u
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                        ${(item.cantidad * (item.producto.precio || 0)).toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
                
                {/* Bebidas */}
                {p.bebidasSinPreparar && p.bebidasSinPreparar.length > 0 && p.bebidasSinPreparar.map((b, idx) => (
                  <Paper 
                    key={'b' + idx} 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      bgcolor: '#e3f2fd',
                      border: '1px solid #90caf9'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          🥤 {b.cantidad}x {b.producto.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${b.producto.precio?.toLocaleString() || 0} c/u
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        ${(b.cantidad * (b.producto.precio || 0)).toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>

              <Divider sx={{ my: 2, borderColor: '#9c27b0' }} />

              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  TOTAL:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  ${calcularTotal(p).toLocaleString()}
                </Typography>
              </Box>

              {/* Botones de acción */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
              >
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => imprimirTicket(p)}
                  sx={{ 
                    fontWeight: 'bold',
                    minWidth: { xs: '100%', sm: '150px' }
                  }}
                >
                  🎫 Imprimir Ticket
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => marcarPagado(p.id)}
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    minWidth: { xs: '100%', sm: '150px' }
                  }}
                >
                  💰 COBRAR
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Layout>
  );
}