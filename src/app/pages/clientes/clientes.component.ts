import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div class="page-title">
          <h2>Clientes</h2>
          <p>{{ filteredCustomers.length }} clientes registrados</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Cliente
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-4" style="margin-bottom:24px">
        <div class="stat-card" *ngFor="let s of statCards">
          <div class="stat-icon" [style.background]="s.bg" [style.color]="s.color">{{ s.icon }}</div>
          <div class="stat-value" style="font-size:1.5rem">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="padding:16px 20px;margin-bottom:20px">
        <div class="flex gap-3">
          <div class="search-wrapper" style="flex:1">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input type="text" class="form-control" placeholder="Buscar por nombre, teléfono..." [(ngModel)]="searchTerm">
          </div>
          <select class="form-select" style="width:160px" [(ngModel)]="filterStatus">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select class="form-select" style="width:160px" [(ngModel)]="filterCity">
            <option value="">Todas las ciudades</option>
            <option *ngFor="let c of cities">{{ c }}</option>
          </select>
        </div>
      </div>

      <!-- Customer Grid -->
      <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
        <div class="customer-card card" *ngFor="let c of filteredCustomers">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:12px">
              <div class="avatar avatar-lg" [style.background]="getAvatarColor(c.name)">{{ c.name[0] }}</div>
              <div>
                <p style="font-weight:600;font-size:0.95rem">{{ c.name }}</p>
                <p style="font-size:0.75rem;color:var(--accent)">{{ c.instagram }}</p>
                <p style="font-size:0.75rem;color:var(--text-muted)">{{ c.city }}</p>
              </div>
            </div>
            <span class="badge" [ngClass]="c.status === 'active' ? 'badge-success' : 'badge-warning'">
              {{ c.status === 'active' ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            <div style="background:var(--bg-surface);border-radius:var(--radius-md);padding:10px;text-align:center">
              <p style="font-size:1.1rem;font-weight:700;font-family:'Playfair Display',serif;color:var(--accent)">\${{ c.totalSpent | number:'1.0-0' }}</p>
              <p style="font-size:0.7rem;color:var(--text-muted)">Total Gastado</p>
            </div>
            <div style="background:var(--bg-surface);border-radius:var(--radius-md);padding:10px;text-align:center">
              <p style="font-size:1.1rem;font-weight:700;font-family:'Playfair Display',serif">{{ c.totalOrders }}</p>
              <p style="font-size:0.7rem;color:var(--text-muted)">Pedidos</p>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem">
              <span style="color:var(--text-muted)">📱</span>
              <span style="color:var(--text-secondary)">{{ c.phone }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem" *ngIf="c.email">
              <span style="color:var(--text-muted)">✉️</span>
              <span style="color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.email }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem" *ngIf="c.address">
              <span style="color:var(--text-muted)">📍</span>
              <span style="color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.address }}</span>
            </div>
            <div *ngIf="c.notes" style="font-size:0.75rem;color:var(--text-muted);padding:6px 10px;background:rgba(232,160,191,0.05);border-radius:6px;border-left:2px solid var(--accent)">
              {{ c.notes }}
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-success btn-sm" style="flex:1" (click)="openWhatsApp(c)">💬 WhatsApp</button>
            <button class="btn btn-secondary btn-sm" (click)="editCustomer(c)">✏️</button>
            <button class="btn btn-ghost btn-sm" (click)="viewOrders(c)">🛍️</button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="filteredCustomers.length === 0">
        <div class="empty-icon">👥</div>
        <h4>Sin clientes</h4>
        <p>No se encontraron clientes</p>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingCustomer ? 'Editar Cliente' : 'Nueva Cliente' }}</h3>
          <button class="btn btn-ghost btn-icon" (click)="showModal = false">✕</button>
        </div>
        
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Nombre Completo *</label>
            <input type="text" class="form-control" [(ngModel)]="form.name" placeholder="María García">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="form-group">
              <label>Teléfono *</label>
              <input type="text" class="form-control" [(ngModel)]="form.phone" placeholder="0991234567">
            </div>
            <div class="form-group">
              <label>Instagram</label>
              <input type="text" class="form-control" [(ngModel)]="form.instagram" placeholder="@mariag">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" [(ngModel)]="form.email" placeholder="maria@gmail.com">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="form-group">
              <label>Ciudad</label>
              <select class="form-select" [(ngModel)]="form.city">
                <option *ngFor="let c of cities">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select class="form-select" [(ngModel)]="form.status">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" class="form-control" [(ngModel)]="form.address" placeholder="Av. Amazonas N12-34">
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea class="form-control" [(ngModel)]="form.notes" rows="2" placeholder="Preferencias de talla, historial, etc..."></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
          <button class="btn btn-primary" (click)="saveCustomer()">
            {{ editingCustomer ? 'Actualizar' : 'Crear Cliente' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customer-card { transition: var(--transition); }
    .customer-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow); }
  `]
})
export class ClientesComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  showModal = false;
  editingCustomer: Customer | null = null;
  searchTerm = '';
  filterStatus = '';
  filterCity = '';
  statCards: any[] = [];

  cities = ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Loja', 'Ibarra', 'Riobamba', 'Portoviejo', 'Machala'];

  form = this.emptyForm();

  constructor(private dataService: DataService, private toast: ToastService) {}

  ngOnInit() {
    this.dataService.customers$.subscribe(customers => {
      this.customers = customers;
      this.updateStats();
      this.applyFilters();
    });
  }

  updateStats() {
    const topSpender = this.customers.reduce((max, c) => c.totalSpent > max ? c.totalSpent : max, 0);
    this.statCards = [
      { icon: '👥', label: 'Total Clientes', value: this.customers.length, bg: 'rgba(232,160,191,0.15)', color: 'var(--accent)' },
      { icon: '✅', label: 'Activas', value: this.customers.filter(c => c.status === 'active').length, bg: 'rgba(76,175,80,0.15)', color: 'var(--success)' },
      { icon: '💰', label: 'Top Gasto', value: `$${topSpender}`, bg: 'rgba(201,169,110,0.15)', color: 'var(--gold)' },
      { icon: '📊', label: 'Promedio Pedidos', value: (this.customers.reduce((s, c) => s + c.totalOrders, 0) / Math.max(this.customers.length, 1)).toFixed(1), bg: 'rgba(33,150,243,0.15)', color: '#2196F3' },
    ];
  }

  applyFilters() {
    this.filteredCustomers = this.customers.filter(c => {
      const ms = !this.searchTerm || c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || c.phone.includes(this.searchTerm);
      const mst = !this.filterStatus || c.status === this.filterStatus;
      const mc = !this.filterCity || c.city === this.filterCity;
      return ms && mst && mc;
    });
  }

  ngDoCheck() { this.applyFilters(); }

  openModal() { this.form = this.emptyForm(); this.editingCustomer = null; this.showModal = true; }

  editCustomer(c: Customer) {
    this.editingCustomer = c;
    this.form = { name: c.name, phone: c.phone, email: c.email, instagram: c.instagram || '', city: c.city || 'Quito', address: c.address || '', status: c.status, notes: c.notes || '' };
    this.showModal = true;
  }

  saveCustomer() {
    if (!this.form.name || !this.form.phone) {
      this.toast.error('Nombre y teléfono son requeridos');
      return;
    }
    if (this.editingCustomer) {
      this.dataService.updateCustomer(this.editingCustomer.id, this.form as any);
      this.toast.success('Cliente actualizado ✓');
    } else {
      this.dataService.addCustomer({
        id: Date.now().toString(), ...this.form as any,
        totalOrders: 0, totalSpent: 0,
        createdAt: new Date()
      });
      this.toast.success('Cliente registrada ✓');
    }
    this.showModal = false;
  }

  viewOrders(c: Customer) {
    this.toast.info(`Pedidos de ${c.name}: ${c.totalOrders}`);
  }

  openWhatsApp(c: Customer) {
    window.open(`https://wa.me/${c.phone}?text=${encodeURIComponent('Hola ' + c.name + '! Te escribe ONE LOVE 💕')}`, '_blank');
  }

  getAvatarColor(name: string): string {
    const colors = ['#E8A0BF', '#C97BA0', '#C9A96E', '#85B4E8', '#85C9A0'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  emptyForm() {
    return { name: '', phone: '', email: '', instagram: '', city: 'Quito', address: '', status: 'active', notes: '' };
  }
}
