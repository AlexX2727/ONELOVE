import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { ExportService } from '../../services/export.service';
import { Product } from '../../models/models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div class="page-title">
          <h2>Control de Inventario</h2>
          <p>Gestión de stock y movimientos</p>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-secondary btn-sm" (click)="exportarInventario()">Exportar Inventario</button>
          <button class="btn btn-primary" (click)="showAdjust = true">+ Ajuste de Stock</button>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="lowStockProducts.length > 0" 
           style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.2);border-radius:var(--radius-lg);padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.3rem">⚠️</span>
        <div>
          <p style="font-weight:600;color:var(--warning)">{{ lowStockProducts.length }} productos con stock bajo</p>
          <p style="font-size:0.8rem;color:var(--text-muted)">Se recomienda reponer antes de que se agoten</p>
        </div>
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
      <div class="card" style="padding:14px 20px;margin-bottom:20px">
        <div class="flex gap-3">
          <div class="search-wrapper" style="flex:1">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-control" placeholder="Buscar producto..." [(ngModel)]="search">
          </div>
          <select class="form-select" style="width:160px" [(ngModel)]="filterCat">
            <option value="">Todas las categorías</option>
            <option *ngFor="let c of categories">{{ c }}</option>
          </select>
          <select class="form-select" style="width:160px" [(ngModel)]="filterStock">
            <option value="">Todo el stock</option>
            <option value="out">Sin stock</option>
            <option value="low">Stock bajo (< 5)</option>
            <option value="ok">Stock normal</option>
          </select>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card" style="padding:0">
        <div class="table-container" style="border:none">
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Valor en Stock</th>
                <th>Tallas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredProducts" [class.row-alert]="p.stock < 5">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <img [src]="p.images[0]" style="width:32px;height:40px;object-fit:cover;border-radius:6px" 
                         (error)="onImgError($event)">
                    <p style="font-weight:600;font-size:0.875rem">{{ p.name }}</p>
                  </div>
                </td>
                <td style="font-family:monospace;font-size:0.8rem;color:var(--text-muted)">{{ p.sku }}</td>
                <td><span class="badge badge-accent">{{ p.category }}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <button class="btn btn-ghost btn-icon" style="font-size:0.75rem;padding:2px 6px" (click)="adjustStock(p, -1)">−</button>
                    <span style="font-weight:700;min-width:28px;text-align:center;font-size:0.9rem"
                          [style.color]="p.stock === 0 ? 'var(--danger)' : p.stock < 5 ? 'var(--warning)' : 'var(--success)'">
                      {{ p.stock }}
                    </span>
                    <button class="btn btn-ghost btn-icon" style="font-size:0.75rem;padding:2px 6px" (click)="adjustStock(p, 1)">+</button>
                  </div>
                </td>
                <td style="color:var(--text-muted)">5 u.</td>
                <td>
                  <span class="badge" [ngClass]="getStockBadge(p.stock)">{{ getStockLabel(p.stock) }}</span>
                </td>
                <td style="font-weight:600;color:var(--gold)">\${{ (p.cost * p.stock) | number:'1.0-0' }}</td>
                <td style="font-size:0.75rem;color:var(--text-muted)">{{ p.sizes.join(' · ') }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="openStockModal(p)">Ajustar</button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="font-weight:700;padding:12px 16px;background:var(--bg-surface);color:var(--text-secondary)">
                  TOTALES
                </td>
                <td style="font-weight:700;padding:12px 16px;background:var(--bg-surface);color:var(--gold);font-family:'Playfair Display',serif">
                  \${{ totalStockValue | number:'1.0-0' }}
                </td>
                <td colspan="2" style="background:var(--bg-surface)"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Stock Adjust Modal -->
    <div class="modal-overlay" *ngIf="showAdjust || adjustProduct" (click)="closeAdjust()">
      <div class="modal" style="max-width:480px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ adjustProduct ? 'Ajuste: ' + adjustProduct.name : 'Ajuste de Stock Global' }}</h3>
          <button class="btn btn-ghost btn-icon" (click)="closeAdjust()">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div *ngIf="!adjustProduct" class="form-group">
            <label>Producto</label>
            <select class="form-select" [(ngModel)]="adjustForm.productId">
              <option *ngFor="let p of products" [value]="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de Ajuste</label>
            <div class="tabs">
              <span class="tab-item" [class.active]="adjustForm.type === 'add'" (click)="adjustForm.type = 'add'">+ Entrada</span>
              <span class="tab-item" [class.active]="adjustForm.type === 'remove'" (click)="adjustForm.type = 'remove'">− Salida</span>
              <span class="tab-item" [class.active]="adjustForm.type === 'set'" (click)="adjustForm.type = 'set'">= Establecer</span>
            </div>
          </div>
          <div class="form-group">
            <label>Cantidad *</label>
            <input type="number" class="form-control" [(ngModel)]="adjustForm.quantity" placeholder="0">
          </div>
          <div class="form-group">
            <label>Razón del ajuste</label>
            <select class="form-select" [(ngModel)]="adjustForm.reason">
              <option>Compra de mercadería</option>
              <option>Venta</option>
              <option>Devolución</option>
              <option>Pérdida / Daño</option>
              <option>Corrección de inventario</option>
              <option>Promoción / Muestra</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notas</label>
            <textarea class="form-control" [(ngModel)]="adjustForm.notes" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeAdjust()">Cancelar</button>
          <button class="btn btn-primary" (click)="applyAdjust()">Aplicar Ajuste</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .row-alert td { background: rgba(255,193,7,0.03) !important; }
  `]
})
export class InventarioComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  lowStockProducts: Product[] = [];
  totalStockValue = 0;
  statCards: any[] = [];
  categories = ['Blusas', 'Vestidos', 'Pantalones', 'Faldas', 'Conjuntos', 'Accesorios', 'Chaquetas', 'Shorts'];
  search = '';
  filterCat = '';
  filterStock = '';
  showAdjust = false;
  adjustProduct: Product | null = null;
  adjustForm = { productId: '', type: 'add', quantity: 0, reason: 'Compra de mercadería', notes: '' };

  constructor(private dataService: DataService, private toast: ToastService, private exportService: ExportService) {}

  ngOnInit() {
    this.dataService.products$.subscribe(products => {
      this.products = products;
      this.updateStats();
      this.applyFilters();
    });
  }

  updateStats() {
    this.lowStockProducts = this.products.filter(p => p.stock < 5);
    this.totalStockValue = this.products.reduce((s, p) => s + p.cost * p.stock, 0);
    this.statCards = [
      { icon: '📦', label: 'Total Unidades', value: this.products.reduce((s, p) => s + p.stock, 0), bg: 'rgba(232,160,191,0.15)', color: 'var(--accent)' },
      { icon: '💰', label: 'Valor Inventario', value: `$${this.totalStockValue.toFixed(0)}`, bg: 'rgba(201,169,110,0.15)', color: 'var(--gold)' },
      { icon: '⚠️', label: 'Stock Bajo', value: this.lowStockProducts.length, bg: 'rgba(255,193,7,0.15)', color: 'var(--warning)' },
      { icon: '❌', label: 'Sin Stock', value: this.products.filter(p => p.stock === 0).length, bg: 'rgba(244,67,54,0.15)', color: 'var(--danger)' },
    ];
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const ms = !this.search || p.name.toLowerCase().includes(this.search.toLowerCase()) || p.sku.toLowerCase().includes(this.search.toLowerCase());
      const mc = !this.filterCat || p.category === this.filterCat;
      const msk = !this.filterStock ||
        (this.filterStock === 'out' && p.stock === 0) ||
        (this.filterStock === 'low' && p.stock > 0 && p.stock < 5) ||
        (this.filterStock === 'ok' && p.stock >= 5);
      return ms && mc && msk;
    });
  }

  ngDoCheck() { this.applyFilters(); }

  adjustStock(p: Product, delta: number) {
    const newStock = Math.max(0, p.stock + delta);
    this.dataService.updateProduct(p.id, { stock: newStock });
    this.toast.success(`Stock de ${p.name}: ${newStock} u.`);
  }

  openStockModal(p: Product) {
    this.adjustProduct = p;
    this.adjustForm = { productId: p.id, type: 'add', quantity: 0, reason: 'Compra de mercadería', notes: '' };
  }

  applyAdjust() {
    const pid = this.adjustProduct?.id || this.adjustForm.productId;
    const product = this.products.find(p => p.id === pid);
    if (!product || this.adjustForm.quantity <= 0) {
      this.toast.error('Ingresa una cantidad válida');
      return;
    }
    let newStock = product.stock;
    if (this.adjustForm.type === 'add') newStock += Number(this.adjustForm.quantity);
    else if (this.adjustForm.type === 'remove') newStock = Math.max(0, newStock - Number(this.adjustForm.quantity));
    else newStock = Number(this.adjustForm.quantity);
    this.dataService.updateProduct(pid, { stock: newStock });
    this.toast.success(`Stock actualizado: ${newStock} u.`);
    this.closeAdjust();
  }

  closeAdjust() { this.showAdjust = false; this.adjustProduct = null; }

  getStockBadge(stock: number): string {
    return stock === 0 ? 'badge-danger' : stock < 5 ? 'badge-warning' : 'badge-success';
  }
  getStockLabel(stock: number): string {
    return stock === 0 ? '❌ Sin stock' : stock < 5 ? '⚠️ Bajo' : '✅ Normal';
  }
  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/40/50';
  }

  exportarInventario() {
    const data = this.filteredProducts.map(p => ({
      'Producto': p.name,
      'SKU': p.sku,
      'Categoría': p.category,
      'Costo Unitario': p.cost,
      'Precio Venta': p.price,
      'Stock Actual': p.stock,
      'Valor en Stock': p.cost * p.stock,
      'Tallas': p.sizes.join(', '),
      'Colores': p.colors.join(', '),
      'Estado': p.status
    }));
    this.exportService.exportCSV(data, 'inventario_onelove');
    this.toast.success('Inventario exportado a CSV');
  }
}
