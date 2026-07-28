import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { ExportService } from '../../services/export.service';
import { DashboardStats, SalesByDay, TopProduct, Order } from '../../models/models';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fadeIn">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title">
          <h2>Dashboard</h2>
          <p>Bienvenida de vuelta 💕 · {{ today | date:'dd/MM/yyyy' }}</p>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-secondary btn-sm" (click)="exportarDashboard()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
          <button class="btn btn-primary btn-sm" routerLink="/ventas/nuevo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Pedido
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-4" style="margin-bottom: 24px">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(232,160,191,0.15); color: var(--accent)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div class="stat-value">\${{ stats.monthlySales | number:'1.0-0' }}</div>
          <div class="stat-label">Ventas del Mes</div>
          <span class="stat-change positive">▲ {{ stats.salesGrowth }}%</span>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(33,150,243,0.15); color: #2196F3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            </svg>
          </div>
          <div class="stat-value">{{ stats.monthlyOrders }}</div>
          <div class="stat-label">Pedidos del Mes</div>
          <span class="stat-change positive">▲ {{ stats.ordersGrowth }}%</span>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(76,175,80,0.15); color: var(--success)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div class="stat-value">{{ stats.totalCustomers }}</div>
          <div class="stat-label">Total Clientes</div>
          <span class="stat-change positive">▲ {{ stats.customersGrowth }}%</span>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(255,193,7,0.15); color: var(--warning)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-value">{{ stats.pendingOrders }}</div>
          <div class="stat-label">Pedidos Pendientes</div>
          <span class="stat-change negative" *ngIf="stats.pendingOrders > 0">Por atender</span>
          <span class="stat-change positive" *ngIf="stats.pendingOrders === 0">Al día ✓</span>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid" style="grid-template-columns: 2fr 1fr; margin-bottom: 24px;">
        <div class="card">
          <div class="flex justify-between items-center" style="margin-bottom:20px">
            <div>
              <h3 style="font-size:1rem;margin-bottom:4px">Ventas de los últimos 30 días</h3>
              <p style="font-size:0.8rem;color:var(--text-muted)">Ingresos diarios en USD</p>
            </div>
            <div class="tabs" style="width:auto">
              <span class="tab-item active" style="padding:6px 12px;font-size:0.75rem">Semana</span>
              <span class="tab-item" style="padding:6px 12px;font-size:0.75rem">Mes</span>
            </div>
          </div>
          <canvas #salesChart id="salesChart" style="max-height:250px"></canvas>
        </div>
        
        <div class="card">
          <div style="margin-bottom:20px">
            <h3 style="font-size:1rem;margin-bottom:4px">Canales de Venta</h3>
            <p style="font-size:0.8rem;color:var(--text-muted)">Distribución por canal</p>
          </div>
          <canvas #channelChart id="channelChart" style="max-height:200px"></canvas>
          <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
            <div *ngFor="let ch of channelData" style="display:flex;align-items:center;gap:8px;font-size:0.8rem">
              <span style="width:10px;height:10px;border-radius:50%;background:{{ch.color}};flex-shrink:0"></span>
              <span style="flex:1;color:var(--text-secondary)">{{ch.label}}</span>
              <span style="font-weight:600">{{ch.pct}}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid" style="grid-template-columns: 1fr 1fr;">
        <!-- Recent Orders -->
        <div class="card" style="overflow:hidden;padding:0">
          <div class="flex justify-between items-center" style="padding:20px 20px 16px">
            <h3 style="font-size:1rem">Pedidos Recientes</h3>
            <a routerLink="/ventas" class="btn btn-ghost btn-sm" style="font-size:0.75rem">Ver todos →</a>
          </div>
          <div class="table-container" style="border-radius:0;border:none">
            <table class="table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders">
                  <td style="font-weight:600;color:var(--accent)">{{ order.orderNumber }}</td>
                  <td>{{ order.customerName }}</td>
                  <td style="font-weight:600">\${{ order.total | number:'1.2-2' }}</td>
                  <td><span class="badge" [ngClass]="getOrderBadge(order.status)">{{ getOrderLabel(order.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card">
          <div class="flex justify-between items-center" style="margin-bottom:16px">
            <h3 style="font-size:1rem">Top Figuras</h3>
            <a routerLink="/productos" class="btn btn-ghost btn-sm" style="font-size:0.75rem">Ver todo →</a>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div *ngFor="let p of topProducts; let i = index" style="display:flex;align-items:center;gap:12px">
              <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted);width:18px;text-align:right">{{i+1}}</span>
              <div style="flex:1;min-width:0">
                <p style="font-size:0.875rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ p.productName }}</p>
                <p style="font-size:0.75rem;color:var(--text-muted)">{{ p.category }} · {{ p.sold }} vendidos</p>
              </div>
              <div style="text-align:right">
                <p style="font-size:0.9rem;font-weight:700;color:var(--accent)">\${{ p.revenue | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Quick Stock Alerts -->
          <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
            <p style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">
              Alertas de Stock ({{ stats.lowStockProducts }})
            </p>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div *ngFor="let p of lowStockProducts" style="display:flex;align-items:center;gap:10px">
                <div style="flex:1;min-width:0">
                  <p style="font-size:0.8rem;font-weight:600">{{ p.name }}</p>
                </div>
                <span class="badge" [ngClass]="p.stock === 0 ? 'badge-danger' : 'badge-warning'">
                  {{ p.stock === 0 ? 'Sin stock' : p.stock + ' u.' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('channelChart') channelChartRef!: ElementRef;

  stats!: DashboardStats;
  salesData: SalesByDay[] = [];
  topProducts: TopProduct[] = [];
  recentOrders: Order[] = [];
  lowStockProducts: any[] = [];
  today = new Date();

  channelData = [
    { label: 'Instagram', pct: 42, color: '#E8A0BF' },
    { label: 'WhatsApp', pct: 31, color: '#C9A96E' },
    { label: 'Tienda Física', pct: 18, color: '#4CAF50' },
    { label: 'Web', pct: 9, color: '#2196F3' },
  ];

  constructor(private dataService: DataService, private exportService: ExportService) {}

  ngOnInit() {
    this.stats = this.dataService.getDashboardStats();
    this.salesData = this.dataService.getSalesByDay();
    this.topProducts = this.dataService.getTopProducts();
    this.recentOrders = this.dataService.getOrders().slice(0, 6);
    this.lowStockProducts = this.dataService.getProducts()
      .filter(p => p.stock < 5)
      .slice(0, 4)
      .map(p => ({ name: p.name, stock: p.stock }));
  }

  ngAfterViewInit() {
    this.loadChartJs().then(() => {
      this.buildSalesChart();
      this.buildChannelChart();
    });
  }

  loadChartJs(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).Chart) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  buildSalesChart() {
    const last7 = this.salesData.slice(-7);
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(232,160,191,0.3)');
    gradient.addColorStop(1, 'rgba(232,160,191,0)');

    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: last7.map(d => d.date),
        datasets: [{
          label: 'Ventas $',
          data: last7.map(d => d.sales),
          borderColor: '#E8A0BF',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#E8A0BF',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#12122A',
            borderColor: 'rgba(232,160,191,0.3)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: '#E8A0BF',
            callbacks: { label: (ctx: any) => ` $${ctx.parsed.y}` }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: (v: any) => '$' + v }
          }
        }
      }
    });
  }

  buildChannelChart() {
    const ctx = this.channelChartRef.nativeElement.getContext('2d');
    new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.channelData.map(c => c.label),
        datasets: [{
          data: this.channelData.map(c => c.pct),
          backgroundColor: this.channelData.map(c => c.color),
          borderColor: '#12122A',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#12122A',
            borderColor: 'rgba(232,160,191,0.3)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.7)',
            callbacks: { label: (ctx: any) => ` ${ctx.parsed}%` }
          }
        }
      }
    });
  }

  getOrderBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning', confirmed: 'badge-info',
      preparing: 'badge-info', shipped: 'badge-accent',
      delivered: 'badge-success', cancelled: 'badge-danger',
      returned: 'badge-danger'
    };
    return map[status] || 'badge-accent';
  }

  getOrderLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente', confirmed: 'Confirmado',
      preparing: 'Preparando', shipped: 'Enviado',
      delivered: 'Entregado', cancelled: 'Cancelado',
      returned: 'Devuelto'
    };
    return map[status] || status;
  }

  exportarDashboard() {
    const html = `
      <div style="margin-bottom: 20px;">
        <h2>Resumen Ejecutivo del Mes</h2>
        <ul>
          <li>Ventas del Mes: $${this.stats.monthlySales} (${this.stats.salesGrowth}%)</li>
          <li>Pedidos del Mes: ${this.stats.monthlyOrders} (${this.stats.ordersGrowth}%)</li>
          <li>Total Clientes: ${this.stats.totalCustomers} (${this.stats.customersGrowth}%)</li>
          <li>Pedidos Pendientes: ${this.stats.pendingOrders}</li>
        </ul>
      </div>
      <div style="margin-bottom: 20px;">
        <h2>Top 5 Productos</h2>
        <table>
          <tr><th>Producto</th><th>Categoría</th><th>Vendidos</th><th>Ingresos</th></tr>
          ${this.topProducts.map(p => `<tr><td>${p.productName}</td><td>${p.category}</td><td>${p.sold}</td><td>$${p.revenue}</td></tr>`).join('')}
        </table>
      </div>
      <div style="margin-bottom: 20px;">
        <h2>Canales de Venta</h2>
        <table>
          <tr><th>Canal</th><th>Porcentaje</th></tr>
          ${this.channelData.map(c => `<tr><td>${c.label}</td><td>${c.pct}%</td></tr>`).join('')}
        </table>
      </div>
    `;
    this.exportService.exportHTMLReport('Reporte de Dashboard', html, 'dashboard_onelove');
  }
}
