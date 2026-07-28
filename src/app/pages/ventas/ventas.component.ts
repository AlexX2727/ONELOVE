import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { ExportService } from '../../services/export.service';
import { Order } from '../../models/models';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title">
          <h2>Gestión de Ventas</h2>
          <p>{{ filteredOrders.length }} pedidos · \${{ totalRevenue | number:'1.2-2' }} en ingresos</p>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-secondary btn-sm" (click)="exportarVentas()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
          <button class="btn btn-primary" (click)="showNewOrderModal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Pedido
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-4" style="margin-bottom:24px">
        <div class="stat-card" *ngFor="let s of summaryCards">
          <div class="stat-icon" [style.background]="s.bg" [style.color]="s.color">
            <span style="font-size:1.1rem">{{ s.icon }}</span>
          </div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="card" style="margin-bottom:20px;padding:16px 20px">
        <div class="flex gap-3 items-center">
          <div class="search-wrapper" style="flex:1">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input type="text" class="form-control" placeholder="Buscar por pedido, cliente..." [(ngModel)]="searchTerm">
          </div>
          <select class="form-select" style="width:160px" [(ngModel)]="filterStatus">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">Preparando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select class="form-select" style="width:160px" [(ngModel)]="filterChannel">
            <option value="">Todos los canales</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="store">Tienda Física</option>
            <option value="web">Web</option>
          </select>
          <select class="form-select" style="width:140px" [(ngModel)]="filterPayment">
            <option value="">Pago</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="card" style="padding:0">
        <div class="table-container" style="border:none">
          <table class="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Artículos</th>
                <th>Canal</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders" class="animate-fadeIn">
                <td>
                  <span style="font-weight:700;color:var(--accent);font-size:0.875rem">{{ order.orderNumber }}</span>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="avatar avatar-sm">{{ order.customerName[0] }}</div>
                    <div>
                      <p style="font-size:0.875rem;font-weight:600">{{ order.customerName }}</p>
                      <p style="font-size:0.75rem;color:var(--text-muted)">{{ order.customerPhone }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span style="font-size:0.875rem">{{ order.items.length }} producto{{ order.items.length > 1 ? 's' : '' }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getChannelBadge(order.channel)">{{ getChannelLabel(order.channel) }}</span>
                </td>
                <td>
                  <span style="font-weight:700;font-family:'Playfair Display',serif">\${{ order.total | number:'1.2-2' }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'">
                    {{ order.paymentStatus === 'paid' ? '✓ Pagado' : '⏳ Pendiente' }}
                  </span>
                </td>
                <td>
                  <select class="form-select" style="padding:4px 24px 4px 8px;font-size:0.75rem;width:130px"
                          [value]="order.status" (change)="updateStatus(order.id, $event)">
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="preparing">Preparando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td>
                  <span style="font-size:0.75rem;color:var(--text-muted)">{{ order.createdAt | date:'dd/MM/yy' }}</span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-icon" (click)="viewOrder(order)" title="Ver detalle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button class="btn btn-ghost btn-icon" title="WhatsApp" (click)="openWhatsApp(order)">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="color:var(--success)">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    <button class="btn btn-danger btn-icon" (click)="deleteOrder(order.id)" title="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="filteredOrders.length === 0">
            <div class="empty-icon">🛍️</div>
            <h4>No hay pedidos</h4>
            <p>No se encontraron pedidos con los filtros aplicados</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div class="modal-overlay" *ngIf="selectedOrder" (click)="selectedOrder = null">
      <div class="modal" style="max-width:640px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedOrder.orderNumber }}</h3>
          <button class="btn btn-ghost btn-icon" (click)="selectedOrder = null">✕</button>
        </div>
        
        <div style="display:flex;gap:24px;margin-bottom:20px">
          <div style="flex:1">
            <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Cliente</p>
            <p style="font-weight:600">{{ selectedOrder.customerName }}</p>
            <p style="font-size:0.85rem;color:var(--text-secondary)">{{ selectedOrder.customerPhone }}</p>
          </div>
          <div>
            <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Fecha</p>
            <p style="font-weight:600">{{ selectedOrder.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div>
            <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Canal</p>
            <span class="badge" [ngClass]="getChannelBadge(selectedOrder.channel)">{{ getChannelLabel(selectedOrder.channel) }}</span>
          </div>
        </div>

        <!-- Items -->
        <div style="margin-bottom:20px">
          <p style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Artículos</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div *ngFor="let item of selectedOrder.items" 
                 style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-surface);border-radius:var(--radius-md)">
              <div>
                <p style="font-weight:600;font-size:0.875rem">{{ item.productName }}</p>
                <p style="font-size:0.75rem;color:var(--text-muted)">{{ item.size }} · {{ item.color }} · SKU: {{ item.sku }}</p>
              </div>
              <div style="text-align:right">
                <p style="font-size:0.8rem;color:var(--text-muted)">{{ item.quantity }} × \${{ item.unitPrice }}</p>
                <p style="font-weight:700;color:var(--accent)">\${{ item.total | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div style="background:var(--bg-surface);border-radius:var(--radius-md);padding:16px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:8px">
            <span style="color:var(--text-secondary)">Subtotal</span>
            <span>\${{ selectedOrder.subtotal | number:'1.2-2' }}</span>
          </div>
          <div *ngIf="selectedOrder.discount > 0" style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:8px">
            <span style="color:var(--success)">Descuento</span>
            <span style="color:var(--success)">-\${{ selectedOrder.discount | number:'1.2-2' }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:12px">
            <span style="color:var(--text-secondary)">Envío</span>
            <span>\${{ selectedOrder.shipping | number:'1.2-2' }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:1rem;font-weight:700;padding-top:12px;border-top:1px solid var(--border)">
            <span>Total</span>
            <span style="color:var(--accent);font-family:'Playfair Display',serif">\${{ selectedOrder.total | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="selectedOrder = null">Cerrar</button>
          <button class="btn btn-primary" (click)="openWhatsApp(selectedOrder)">
            Contactar por WhatsApp
          </button>
        </div>
      </div>
    </div>

    <!-- New Order Modal (simplified) -->
    <div class="modal-overlay" *ngIf="showNewOrderModal" (click)="showNewOrderModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Nuevo Pedido</h3>
          <button class="btn btn-ghost btn-icon" (click)="showNewOrderModal = false">✕</button>
        </div>
        
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="form-group">
            <label>Nombre del Cliente *</label>
            <input type="text" class="form-control" [(ngModel)]="newOrder.customerName" placeholder="María García">
          </div>
          <div class="form-group">
            <label>Teléfono / WhatsApp</label>
            <input type="text" class="form-control" [(ngModel)]="newOrder.customerPhone" placeholder="0991234567">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group">
              <label>Canal de Venta</label>
              <select class="form-select" [(ngModel)]="newOrder.channel">
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="store">Tienda Física</option>
                <option value="web">Web</option>
              </select>
            </div>
            <div class="form-group">
              <label>Método de Pago</label>
              <select class="form-select" [(ngModel)]="newOrder.paymentMethod">
                <option value="transfer">Transferencia</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Producto / Descripción *</label>
            <input type="text" class="form-control" [(ngModel)]="newOrder.productName" placeholder="Blusa Floral, Talla M, Color Rosa">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group">
              <label>Precio</label>
              <div class="input-group">
                <span class="input-prefix">\$</span>
                <input type="number" class="form-control" [(ngModel)]="newOrder.total" placeholder="0.00">
              </div>
            </div>
            <div class="form-group">
              <label>Estado Pago</label>
              <select class="form-select" [(ngModel)]="newOrder.paymentStatus">
                <option value="paid">Pagado ✓</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea class="form-control" [(ngModel)]="newOrder.notes" rows="2" placeholder="Dirección de entrega, instrucciones especiales..."></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showNewOrderModal = false">Cancelar</button>
          <button class="btn btn-primary" (click)="createOrder()">Crear Pedido</button>
        </div>
      </div>
    </div>
  `
})
export class VentasComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  showNewOrderModal = false;
  
  searchTerm = '';
  filterStatus = '';
  filterChannel = '';
  filterPayment = '';
  
  newOrder = {
    customerName: '', customerPhone: '', channel: 'instagram',
    paymentMethod: 'transfer', productName: '', total: 0,
    paymentStatus: 'pending', notes: ''
  };

  summaryCards: any[] = [];
  totalRevenue = 0;

  constructor(private dataService: DataService, private toast: ToastService, private exportService: ExportService) {}

  ngOnInit() {
    this.dataService.orders$.subscribe(orders => {
      this.orders = orders;
      this.updateSummary();
      this.applyFilters();
    });
  }

  updateSummary() {
    this.totalRevenue = this.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    this.summaryCards = [
      { icon: '🛍️', label: 'Total Pedidos', value: this.orders.length, bg: 'rgba(232,160,191,0.15)', color: 'var(--accent)' },
      { icon: '✅', label: 'Entregados', value: this.orders.filter(o => o.status === 'delivered').length, bg: 'rgba(76,175,80,0.15)', color: 'var(--success)' },
      { icon: '⏳', label: 'Pendientes', value: this.orders.filter(o => o.status === 'pending').length, bg: 'rgba(255,193,7,0.15)', color: 'var(--warning)' },
      { icon: '❌', label: 'Cancelados', value: this.orders.filter(o => o.status === 'cancelled').length, bg: 'rgba(244,67,54,0.15)', color: 'var(--danger)' },
    ];
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(o => {
      const matchSearch = !this.searchTerm || 
        o.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || o.status === this.filterStatus;
      const matchChannel = !this.filterChannel || o.channel === this.filterChannel;
      const matchPayment = !this.filterPayment || o.paymentStatus === this.filterPayment;
      return matchSearch && matchStatus && matchChannel && matchPayment;
    });
  }

  ngDoCheck() { this.applyFilters(); }

  viewOrder(order: Order) { this.selectedOrder = order; }

  updateStatus(id: string, event: Event) {
    const status = (event.target as HTMLSelectElement).value as Order['status'];
    this.dataService.updateOrder(id, { status });
    this.toast.success(`Estado actualizado a "${this.getOrderLabel(status)}"`);
  }

  deleteOrder(id: string) {
    if (confirm('¿Eliminar este pedido?')) {
      this.dataService.deleteOrder(id);
      this.toast.success('Pedido eliminado');
    }
  }

  createOrder() {
    if (!this.newOrder.customerName || !this.newOrder.productName) {
      this.toast.error('Completa los campos requeridos');
      return;
    }
    const order: Order = {
      id: Date.now().toString(),
      orderNumber: `OL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: Date.now().toString(),
      customerName: this.newOrder.customerName,
      customerPhone: this.newOrder.customerPhone,
      items: [{
        productId: '', productName: this.newOrder.productName,
        sku: 'MANUAL', size: '-', color: '-',
        quantity: 1, unitPrice: this.newOrder.total, total: this.newOrder.total
      }],
      subtotal: this.newOrder.total,
      discount: 0, shipping: 0,
      total: this.newOrder.total,
      status: 'pending',
      paymentMethod: this.newOrder.paymentMethod as Order['paymentMethod'],
      paymentStatus: this.newOrder.paymentStatus as Order['paymentStatus'],
      channel: this.newOrder.channel as Order['channel'],
      notes: this.newOrder.notes,
      createdAt: new Date(), updatedAt: new Date()
    };
    this.dataService.addOrder(order);
    this.showNewOrderModal = false;
    this.toast.success(`Pedido ${order.orderNumber} creado ✓`);
    this.newOrder = { customerName: '', customerPhone: '', channel: 'instagram', paymentMethod: 'transfer', productName: '', total: 0, paymentStatus: 'pending', notes: '' };
  }

  openWhatsApp(order: Order) {
    const msg = `Hola ${order.customerName}! Te escribo de ONE LOVE 💕 sobre tu pedido *${order.orderNumber}* por $${order.total.toFixed(2)}. ¿Cómo te podemos ayudar?`;
    window.open(`https://wa.me/${order.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  getChannelBadge(ch: string): string {
    const map: Record<string, string> = { instagram: 'badge-accent', whatsapp: 'badge-success', store: 'badge-gold', web: 'badge-info' };
    return map[ch] || 'badge-accent';
  }
  getChannelLabel(ch: string): string {
    const map: Record<string, string> = { instagram: '📸 Instagram', whatsapp: '💬 WhatsApp', store: '🏪 Tienda', web: '🌐 Web' };
    return map[ch] || ch;
  }
  getOrderLabel(s: string): string {
    const map: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
    return map[s] || s;
  }

  exportarVentas() {
    const data = this.filteredOrders.map(o => ({
      'Número de Pedido': o.orderNumber,
      'Cliente': o.customerName,
      'Teléfono': o.customerPhone,
      'Artículos': o.items.length,
      'Canal': this.getChannelLabel(o.channel),
      'Subtotal': o.subtotal,
      'Descuento': o.discount,
      'Envío': o.shipping,
      'Total': o.total,
      'Pago': o.paymentMethod,
      'Estado de Pago': o.paymentStatus,
      'Estado del Pedido': this.getOrderLabel(o.status),
      'Fecha': o.createdAt
    }));
    this.exportService.exportExcel(data, 'ventas_onelove');
    this.toast.success('Ventas exportadas a Excel');
  }
}
