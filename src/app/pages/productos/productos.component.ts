import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title">
          <h2>Figuras & Productos</h2>
          <p>{{ filteredProducts.length }} productos · Gestión de catálogo</p>
        </div>
        <div class="flex gap-3">
          <div class="tabs">
            <span class="tab-item" [class.active]="viewMode==='grid'" (click)="viewMode='grid'">Grid</span>
            <span class="tab-item" [class.active]="viewMode==='list'" (click)="viewMode='list'">Lista</span>
          </div>
          <button class="btn btn-primary" (click)="openModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar Producto
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat-card" *ngFor="let s of statCards">
          <div class="stat-icon" [style.background]="s.bg" [style.color]="s.color">{{ s.icon }}</div>
          <div class="stat-value" style="font-size:1.5rem">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="padding:16px 20px;margin-bottom:20px">
        <div class="flex gap-3 items-center">
          <div class="search-wrapper" style="flex:1">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input type="text" class="form-control" placeholder="Buscar producto, SKU..." [(ngModel)]="searchTerm">
          </div>
          <select class="form-select" style="width:160px" [(ngModel)]="filterCategory">
            <option value="">Todas las categorías</option>
            <option *ngFor="let c of categories">{{ c }}</option>
          </select>
          <select class="form-select" style="width:140px" [(ngModel)]="filterStatus">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="out_of_stock">Sin Stock</option>
          </select>
          <select class="form-select" style="width:140px" [(ngModel)]="filterStock">
            <option value="">Stock</option>
            <option value="low">Stock Bajo (< 5)</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      <!-- Category Pills -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <span class="pill" [class.active]="filterCategory === ''" (click)="filterCategory = ''">Todos</span>
        <span class="pill" *ngFor="let c of categories" [class.active]="filterCategory === c" (click)="filterCategory = c">{{ c }}</span>
      </div>

      <!-- Grid View -->
      <div *ngIf="viewMode === 'grid'" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
        <div class="product-card" *ngFor="let p of filteredProducts">
          <div class="product-image">
            <img [src]="p.images[0]" [alt]="p.name" loading="lazy" (error)="onImgError($event, p)">
            <div class="product-status-badge">
              <span class="badge" [ngClass]="getStatusBadge(p.status)">{{ getStatusLabel(p.status) }}</span>
            </div>
            <div class="product-img-overlay">
              <button class="btn btn-primary btn-sm" (click)="editProduct(p)">Editar</button>
              <button class="btn btn-secondary btn-sm" (click)="duplicateProduct(p)">Duplicar</button>
            </div>
          </div>
          <div class="product-info">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div style="flex:1;min-width:0">
                <p class="product-name">{{ p.name }}</p>
                <p class="product-category">{{ p.category }}</p>
              </div>
              <span *ngIf="p.featured" style="font-size:0.8rem" title="Destacado">⭐</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <span class="product-price">\${{ p.price }}</span>
              <span class="badge" [ngClass]="p.stock < 5 ? (p.stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'">
                {{ p.stock === 0 ? 'Sin stock' : p.stock + ' u.' }}
              </span>
            </div>
            <p style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">SKU: {{ p.sku }}</p>
            <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap">
              <span *ngFor="let s of p.sizes.slice(0,4)" 
                    style="font-size:0.65rem;padding:2px 6px;background:var(--bg-surface2);border-radius:4px;color:var(--text-muted)">{{ s }}</span>
            </div>
          </div>
          <div style="padding:0 16px 14px;display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" style="flex:1;font-size:0.75rem" (click)="editProduct(p)">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" (click)="deleteProduct(p.id)">🗑️</button>
          </div>
        </div>
        
        <!-- Add New Card -->
        <div class="product-card-add" (click)="openModal()">
          <div class="add-icon">+</div>
          <p>Nuevo Producto</p>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="viewMode === 'list'" class="card" style="padding:0">
        <div class="table-container" style="border:none">
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Costo</th>
                <th>Margen</th>
                <th>Stock</th>
                <th>Tallas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredProducts">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <img [src]="p.images[0]" [alt]="p.name" style="width:36px;height:44px;object-fit:cover;border-radius:6px" (error)="onImgError($event, p)">
                    <div>
                      <p style="font-weight:600;font-size:0.875rem">{{ p.name }}</p>
                      <p style="font-size:0.7rem;color:var(--text-muted)">{{ p.description | slice:0:40 }}...</p>
                    </div>
                  </div>
                </td>
                <td><span class="badge badge-accent">{{ p.category }}</span></td>
                <td style="font-family:monospace;font-size:0.8rem;color:var(--text-muted)">{{ p.sku }}</td>
                <td style="font-weight:700;color:var(--accent)">\${{ p.price }}</td>
                <td style="color:var(--text-secondary)">\${{ p.cost }}</td>
                <td>
                  <span [style.color]="getMarginColor(p.price, p.cost)">{{ getMargin(p.price, p.cost) }}%</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="p.stock < 5 ? (p.stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'">
                    {{ p.stock }} u.
                  </span>
                </td>
                <td style="font-size:0.75rem">{{ p.sizes.join(', ') }}</td>
                <td><span class="badge" [ngClass]="getStatusBadge(p.status)">{{ getStatusLabel(p.status) }}</span></td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-icon" (click)="editProduct(p)" title="Editar">✏️</button>
                    <button class="btn btn-danger btn-icon" (click)="deleteProduct(p.id)" title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="filteredProducts.length === 0">
        <div class="empty-icon">👗</div>
        <h4>Sin productos</h4>
        <p>No hay productos con los filtros aplicados</p>
        <button class="btn btn-primary" (click)="openModal()">Agregar Producto</button>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" style="max-width:620px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button class="btn btn-ghost btn-icon" (click)="closeModal()">✕</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group" style="grid-column:1/-1">
              <label>Nombre del Producto *</label>
              <input type="text" class="form-control" [(ngModel)]="form.name" placeholder="Blusa Floral Premium">
            </div>
            <div class="form-group">
              <label>Categoría *</label>
              <select class="form-select" [(ngModel)]="form.category">
                <option *ngFor="let c of categories">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input type="text" class="form-control" [(ngModel)]="form.sku" placeholder="OL-BLU-001">
            </div>
            <div class="form-group">
              <label>Precio de Venta *</label>
              <div class="input-group">
                <span class="input-prefix">\$</span>
                <input type="number" class="form-control" [(ngModel)]="form.price" placeholder="0.00">
              </div>
            </div>
            <div class="form-group">
              <label>Costo</label>
              <div class="input-group">
                <span class="input-prefix">\$</span>
                <input type="number" class="form-control" [(ngModel)]="form.cost" placeholder="0.00">
              </div>
            </div>
            <div class="form-group">
              <label>Stock Actual</label>
              <input type="number" class="form-control" [(ngModel)]="form.stock" placeholder="0">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select class="form-select" [(ngModel)]="form.status">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Tallas disponibles</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <label *ngFor="let s of allSizes" style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.875rem;color:var(--text-secondary)">
                  <input type="checkbox" [checked]="form.sizes.includes(s)" (change)="toggleSize(s)" style="accent-color:var(--accent)">
                  {{ s }}
                </label>
              </div>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Colores</label>
              <input type="text" class="form-control" [(ngModel)]="form.colorsStr" placeholder="Negro, Rosa, Beige (separados por coma)">
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Descripción</label>
              <textarea class="form-control" [(ngModel)]="form.description" rows="2" placeholder="Describe el producto..."></textarea>
            </div>
            <div class="form-group" style="grid-column:1/-1;display:flex;align-items:center;gap:8px">
              <input type="checkbox" [(ngModel)]="form.featured" style="accent-color:var(--accent)" id="featuredCb">
              <label for="featuredCb" style="font-size:0.875rem;color:var(--text-secondary);cursor:pointer">Marcar como producto destacado ⭐</label>
            </div>
          </div>
          
          <div *ngIf="form.price > 0 && form.cost > 0" 
               style="background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.2);border-radius:var(--radius-md);padding:12px 16px">
            <p style="font-size:0.8rem;color:var(--success)">
              💰 Margen: <strong>{{ getMargin(form.price, form.cost) }}%</strong> · 
              Ganancia por unidad: <strong>\${{ (form.price - form.cost).toFixed(2) }}</strong>
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="saveProduct()">
            {{ editingProduct ? '✓ Actualizar' : '+ Crear Producto' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pill {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 500;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      transition: var(--transition-fast);
      
      &:hover, &.active {
        background: rgba(232,160,191,0.1);
        border-color: var(--accent);
        color: var(--accent);
      }
    }
    
    .product-status-badge {
      position: absolute;
      top: 8px;
      left: 8px;
    }
    
    .product-card-add {
      background: var(--bg-card);
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      aspect-ratio: 3/4;
      cursor: pointer;
      transition: var(--transition);
      color: var(--text-muted);
      gap: 12px;
      
      &:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: rgba(232,160,191,0.05);
      }
      
      .add-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--bg-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        transition: var(--transition-fast);
      }
      
      p { font-size: 0.875rem; font-weight: 500; }
    }
  `]
})
export class ProductosComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  showModal = false;
  editingProduct: Product | null = null;
  searchTerm = '';
  filterCategory = '';
  filterStatus = '';
  filterStock = '';

  categories = ['Blusas', 'Vestidos', 'Pantalones', 'Faldas', 'Conjuntos', 'Accesorios', 'Chaquetas', 'Shorts'];
  allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

  statCards: any[] = [];

  form = this.emptyForm();

  constructor(private dataService: DataService, private toast: ToastService) {}

  ngOnInit() {
    this.dataService.products$.subscribe(products => {
      this.products = products;
      this.updateStats();
      this.applyFilters();
    });
  }

  updateStats() {
    this.statCards = [
      { icon: '👗', label: 'Total Productos', value: this.products.length, bg: 'rgba(232,160,191,0.15)', color: 'var(--accent)' },
      { icon: '✅', label: 'Activos', value: this.products.filter(p => p.status === 'active').length, bg: 'rgba(76,175,80,0.15)', color: 'var(--success)' },
      { icon: '⚠️', label: 'Stock Bajo', value: this.products.filter(p => p.stock < 5).length, bg: 'rgba(255,193,7,0.15)', color: 'var(--warning)' },
      { icon: '⭐', label: 'Destacados', value: this.products.filter(p => p.featured).length, bg: 'rgba(201,169,110,0.15)', color: 'var(--gold)' },
    ];
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const ms = !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      const mc = !this.filterCategory || p.category === this.filterCategory;
      const mst = !this.filterStatus || p.status === this.filterStatus;
      const mstk = !this.filterStock || (this.filterStock === 'low' ? p.stock < 5 : p.stock >= 5);
      return ms && mc && mst && mstk;
    });
  }

  ngDoCheck() { this.applyFilters(); }

  openModal() { this.form = this.emptyForm(); this.editingProduct = null; this.showModal = true; }

  editProduct(p: Product) {
    this.editingProduct = p;
    this.form = { name: p.name, category: p.category, sku: p.sku, price: p.price, cost: p.cost, stock: p.stock, status: p.status, sizes: [...p.sizes], colorsStr: p.colors.join(', '), description: p.description, featured: p.featured };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingProduct = null; }

  saveProduct() {
    if (!this.form.name || !this.form.category || this.form.price <= 0) {
      this.toast.error('Completa los campos requeridos');
      return;
    }
    const productData: Partial<Product> = {
      name: this.form.name,
      category: this.form.category,
      sku: this.form.sku || `OL-${this.form.category.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      price: Number(this.form.price),
      cost: Number(this.form.cost),
      stock: Number(this.form.stock),
      status: this.form.status as Product['status'],
      sizes: this.form.sizes,
      colors: this.form.colorsStr.split(',').map((c: string) => c.trim()).filter(Boolean),
      description: this.form.description,
      featured: this.form.featured,
      images: this.editingProduct?.images || [`https://picsum.photos/seed/${this.form.name}/400/500`]
    };
    if (this.editingProduct) {
      this.dataService.updateProduct(this.editingProduct.id, productData);
      this.toast.success('Producto actualizado ✓');
    } else {
      this.dataService.addProduct({ id: Date.now().toString(), ...productData, createdAt: new Date(), updatedAt: new Date() } as Product);
      this.toast.success('Producto creado ✓');
    }
    this.closeModal();
  }

  duplicateProduct(p: Product) {
    const dup: Product = { ...p, id: Date.now().toString(), name: p.name + ' (Copia)', sku: p.sku + '-C', createdAt: new Date(), updatedAt: new Date() };
    this.dataService.addProduct(dup);
    this.toast.success('Producto duplicado');
  }

  deleteProduct(id: string) {
    if (confirm('¿Eliminar este producto?')) {
      this.dataService.deleteProduct(id);
      this.toast.success('Producto eliminado');
    }
  }

  toggleSize(size: string) {
    const idx = this.form.sizes.indexOf(size);
    if (idx >= 0) this.form.sizes.splice(idx, 1);
    else this.form.sizes.push(size);
  }

  getMargin(price: number, cost: number): string {
    return cost > 0 ? (((price - cost) / price) * 100).toFixed(0) : '—';
  }

  getMarginColor(price: number, cost: number): string {
    const m = cost > 0 ? ((price - cost) / price) * 100 : 0;
    return m > 40 ? 'var(--success)' : m > 20 ? 'var(--warning)' : 'var(--danger)';
  }

  getStatusBadge(s: string): string {
    return s === 'active' ? 'badge-success' : s === 'inactive' ? 'badge-warning' : 'badge-danger';
  }
  getStatusLabel(s: string): string {
    return s === 'active' ? 'Activo' : s === 'inactive' ? 'Inactivo' : 'Sin Stock';
  }

  onImgError(event: Event, p: Product) {
    (event.target as HTMLImageElement).src = `https://picsum.photos/seed/${p.id}/400/500`;
  }

  emptyForm() {
    return { name: '', category: 'Blusas', sku: '', price: 0, cost: 0, stock: 0, status: 'active', sizes: ['S', 'M', 'L'] as string[], colorsStr: '', description: '', featured: false };
  }
}
