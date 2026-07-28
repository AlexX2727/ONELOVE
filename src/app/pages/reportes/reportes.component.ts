import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div class="page-title">
          <h2>Reportes & Análisis</h2>
          <p>Datos e insights para tomar mejores decisiones</p>
        </div>
        <div class="flex gap-3">
          <select class="form-select" style="width:160px" [(ngModel)]="period">
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Este año</option>
          </select>
          <button class="btn btn-secondary" (click)="exportarReporte()">📥 Exportar Reporte</button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-4" style="margin-bottom:24px">
        <div class="stat-card" *ngFor="let k of kpis">
          <div class="stat-icon" [style.background]="k.bg" [style.color]="k.color">{{ k.icon }}</div>
          <div class="stat-value">\${{ k.value | number:'1.0-0' }}</div>
          <div class="stat-label">{{ k.label }}</div>
          <span class="stat-change positive">▲ {{ k.growth }}%</span>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid" style="grid-template-columns:1.5fr 1fr;margin-bottom:24px">
        <div class="card">
          <h3 style="font-size:1rem;margin-bottom:16px">Evolución de Ventas (30 días)</h3>
          <canvas #mainChart style="max-height:280px"></canvas>
        </div>
        <div class="card">
          <h3 style="font-size:1rem;margin-bottom:16px">Distribución por Categoría</h3>
          <canvas #catChart style="max-height:220px"></canvas>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <div *ngFor="let c of categoryData" style="display:flex;justify-content:space-between;font-size:0.8rem">
              <div style="display:flex;align-items:center;gap:6px">
                <span style="width:8px;height:8px;border-radius:50%;background:{{c.color}};flex-shrink:0"></span>
                <span style="color:var(--text-secondary)">{{ c.name }}</span>
              </div>
              <span style="font-weight:600">\${{ c.revenue | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <!-- Top Products -->
        <div class="card">
          <h3 style="font-size:1rem;margin-bottom:16px">Top 5 Productos</h3>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div *ngFor="let p of topProducts; let i=index">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:1rem">{{ ['🥇','🥈','🥉','4️⃣','5️⃣'][i] }}</span>
                  <div>
                    <p style="font-size:0.875rem;font-weight:600">{{ p.name }}</p>
                    <p style="font-size:0.75rem;color:var(--text-muted)">{{ p.units }} unidades vendidas</p>
                  </div>
                </div>
                <span style="font-weight:700;color:var(--accent)">\${{ p.revenue | number:'1.0-0' }}</span>
              </div>
              <div class="progress">
                <div class="progress-bar" [style.width]="(p.revenue / topProducts[0].revenue * 100) + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales by Channel & Payment -->
        <div class="card">
          <h3 style="font-size:1rem;margin-bottom:16px">Por Canal & Pago</h3>
          <div style="margin-bottom:20px">
            <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:10px;font-weight:700">Canal</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div *ngFor="let c of channelStats">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.825rem">
                  <span style="color:var(--text-secondary)">{{ c.icon }} {{ c.label }}</span>
                  <span style="font-weight:600">{{ c.pct }}%</span>
                </div>
                <div class="progress">
                  <div class="progress-bar" [style.width]="c.pct + '%'" [style.background]="c.color"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:10px;font-weight:700">Método de Pago</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div *ngFor="let pm of paymentMethods" 
                   style="background:var(--bg-surface);border-radius:var(--radius-md);padding:10px;text-align:center">
                <p style="font-size:1rem;margin-bottom:2px">{{ pm.icon }}</p>
                <p style="font-size:0.9rem;font-weight:700">{{ pm.pct }}%</p>
                <p style="font-size:0.7rem;color:var(--text-muted)">{{ pm.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportesComponent implements OnInit, AfterViewInit {
  @ViewChild('mainChart') mainChartRef!: ElementRef;
  @ViewChild('catChart') catChartRef!: ElementRef;
  period = 'month';

  kpis = [
    { icon: '💰', label: 'Ingresos Brutos', value: 8450, growth: 18.5, bg: 'rgba(232,160,191,0.15)', color: 'var(--accent)' },
    { icon: '📦', label: 'Costo Mercadería', value: 3820, growth: 12.3, bg: 'rgba(244,67,54,0.15)', color: 'var(--danger)' },
    { icon: '📊', label: 'Ganancia Neta', value: 4630, growth: 24.1, bg: 'rgba(76,175,80,0.15)', color: 'var(--success)' },
    { icon: '💳', label: 'Cobros Pendientes', value: 890, growth: -5.2, bg: 'rgba(255,193,7,0.15)', color: 'var(--warning)' },
  ];

  topProducts = [
    { name: 'Blusa Floral Premium', units: 47, revenue: 1457 },
    { name: 'Vestido Midi Elegante', units: 38, revenue: 2280 },
    { name: 'Pantalón Mom Fit', units: 34, revenue: 1530 },
    { name: 'Conjunto Sport Chic', units: 29, revenue: 1450 },
    { name: 'Falda Plisada Pastel', units: 25, revenue: 875 },
  ];

  channelStats = [
    { icon: '📸', label: 'Instagram', pct: 42, color: '#E8A0BF' },
    { icon: '💬', label: 'WhatsApp', pct: 31, color: '#25D366' },
    { icon: '🏪', label: 'Tienda', pct: 18, color: '#C9A96E' },
    { icon: '🌐', label: 'Web', pct: 9, color: '#2196F3' },
  ];

  paymentMethods = [
    { icon: '📲', label: 'Transferencia', pct: 58 },
    { icon: '💵', label: 'Efectivo', pct: 25 },
    { icon: '💳', label: 'Tarjeta', pct: 12 },
    { icon: '📋', label: 'Crédito', pct: 5 },
  ];

  categoryData = [
    { name: 'Vestidos', revenue: 2850, color: '#E8A0BF' },
    { name: 'Blusas', revenue: 1890, color: '#C9A96E' },
    { name: 'Pantalones', revenue: 1560, color: '#85B4E8' },
    { name: 'Conjuntos', revenue: 1340, color: '#85C9A0' },
    { name: 'Otros', revenue: 810, color: '#C885C9' },
  ];

  constructor(private dataService: DataService, private exportService: ExportService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadChartJs().then(() => {
      this.buildMainChart();
      this.buildCategoryChart();
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

  buildMainChart() {
    const salesData = this.dataService.getSalesByDay();
    const last14 = salesData.slice(-14);
    const ctx = this.mainChartRef.nativeElement.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, 'rgba(232,160,191,0.3)');
    g.addColorStop(1, 'rgba(232,160,191,0)');

    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: last14.map(d => d.date),
        datasets: [
          { label: 'Ingresos', data: last14.map(d => d.sales), backgroundColor: g, borderColor: '#E8A0BF', borderWidth: 1.5, borderRadius: 4 },
          { label: 'Pedidos', data: last14.map(d => d.orders * 25), type: 'line', borderColor: '#C9A96E', borderWidth: 2, fill: false, tension: 0.4, pointRadius: 3, yAxisID: 'y2' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } }, tooltip: { backgroundColor: '#12122A', borderColor: 'rgba(232,160,191,0.3)', borderWidth: 1 } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, callback: (v: any) => '$' + v } },
          y2: { position: 'right', grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } } }
        }
      }
    });
  }

  buildCategoryChart() {
    const ctx = this.catChartRef.nativeElement.getContext('2d');
    new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.categoryData.map(c => c.name),
        datasets: [{
          data: this.categoryData.map(c => c.revenue),
          backgroundColor: this.categoryData.map(c => c.color),
          borderColor: '#12122A', borderWidth: 3, hoverOffset: 6
        }]
      },
      options: {
        responsive: true, cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#12122A', borderColor: 'rgba(232,160,191,0.3)', borderWidth: 1, titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.7)' }
        }
      }
    });
  }

  exportarReporte() {
    const kpisData = this.kpis.map(k => ({
      Métrica: k.label,
      Valor: `$${k.value}`,
      Crecimiento: `${k.growth}%`
    }));

    const topProductsData = this.topProducts.map(p => ({
      Producto: p.name,
      Unidades: p.units,
      Ingresos: `$${p.revenue}`
    }));

    this.exportService.exportCustomPDF('Reporte Ejecutivo ONE LOVE', [
      { title: 'KPIs Generales', data: kpisData },
      { title: 'Top Productos', data: topProductsData }
    ], 'reporte_onelove');
  }
}
