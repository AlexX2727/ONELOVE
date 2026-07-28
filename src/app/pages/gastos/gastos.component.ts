import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  notes?: string;
}

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div class="page-title">
          <h2>Control de Gastos</h2>
          <p>Administración de egresos del negocio</p>
        </div>
        <button class="btn btn-primary" (click)="showModal = true">
          + Registrar Gasto
        </button>
      </div>

      <!-- Summary -->
      <div class="grid grid-4" style="margin-bottom:24px">
        <div class="stat-card" *ngFor="let s of statCards">
          <div class="stat-icon" [style.background]="s.bg" [style.color]="s.color">{{ s.icon }}</div>
          <div class="stat-value" style="font-size:1.5rem">\${{ s.value | number:'1.0-0' }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <!-- By Category -->
      <div class="grid" style="grid-template-columns:1fr 1.5fr;margin-bottom:24px">
        <div class="card">
          <h3 style="font-size:1rem;margin-bottom:16px">Por Categoría</h3>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div *ngFor="let cat of byCategory">
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
                <span style="color:var(--text-secondary)">{{ cat.icon }} {{ cat.category }}</span>
                <span style="font-weight:600">\${{ cat.total | number:'1.0-0' }}</span>
              </div>
              <div class="progress">
                <div class="progress-bar" [style.width]="(cat.total / maxCategoryTotal * 100) + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:20px 20px 12px;border-bottom:1px solid var(--border)">
            <h3 style="font-size:1rem">Historial de Gastos</h3>
          </div>
          <div class="table-container" style="border:none">
            <table class="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of expenses">
                  <td>
                    <p style="font-weight:600;font-size:0.875rem">{{ e.description }}</p>
                    <p *ngIf="e.notes" style="font-size:0.75rem;color:var(--text-muted)">{{ e.notes }}</p>
                  </td>
                  <td>
                    <span class="badge badge-accent">{{ getCatIcon(e.category) }} {{ e.category }}</span>
                  </td>
                  <td style="font-weight:700;color:var(--danger)">\${{ e.amount | number:'1.2-2' }}</td>
                  <td style="font-size:0.75rem;color:var(--text-muted)">{{ e.date | date:'dd/MM/yy' }}</td>
                  <td>
                    <button class="btn btn-danger btn-icon btn-sm" (click)="deleteExpense(e.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Registrar Gasto</h3>
          <button class="btn btn-ghost btn-icon" (click)="showModal = false">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-group">
            <label>Descripción *</label>
            <input type="text" class="form-control" [(ngModel)]="form.description" placeholder="Compra de mercadería, arriendo...">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="form-group">
              <label>Categoría *</label>
              <select class="form-select" [(ngModel)]="form.category">
                <option *ngFor="let c of categories" [value]="c.name">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Monto *</label>
              <div class="input-group">
                <span class="input-prefix">\$</span>
                <input type="number" class="form-control" [(ngModel)]="form.amount" placeholder="0.00">
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" class="form-control" [(ngModel)]="form.date">
          </div>
          <div class="form-group">
            <label>Notas adicionales</label>
            <textarea class="form-control" [(ngModel)]="form.notes" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
          <button class="btn btn-primary" (click)="saveExpense()">Registrar</button>
        </div>
      </div>
    </div>
  `
})
export class GastosComponent implements OnInit {
  expenses: Expense[] = [];
  showModal = false;
  statCards: any[] = [];
  byCategory: any[] = [];
  maxCategoryTotal = 0;

  categories = [
    { name: 'Mercadería', icon: '👗' },
    { name: 'Arriendo', icon: '🏠' },
    { name: 'Publicidad', icon: '📢' },
    { name: 'Envíos', icon: '📦' },
    { name: 'Servicios', icon: '⚡' },
    { name: 'Personal', icon: '👤' },
    { name: 'Equipos', icon: '💻' },
    { name: 'Otros', icon: '📌' },
  ];

  form = this.emptyForm();

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.expenses = this.getMockExpenses();
    this.updateStats();
  }

  updateStats() {
    const today = new Date();
    const thisMonth = this.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    const thisYear = this.expenses.filter(e => new Date(e.date).getFullYear() === today.getFullYear());

    this.statCards = [
      { icon: '📆', label: 'Este Mes', value: thisMonth.reduce((s, e) => s + e.amount, 0), bg: 'rgba(244,67,54,0.15)', color: 'var(--danger)' },
      { icon: '📅', label: 'Este Año', value: thisYear.reduce((s, e) => s + e.amount, 0), bg: 'rgba(255,193,7,0.15)', color: 'var(--warning)' },
      { icon: '💼', label: 'Total Registrado', value: this.expenses.reduce((s, e) => s + e.amount, 0), bg: 'rgba(232,160,191,0.15)', color: 'var(--accent)' },
      { icon: '📊', label: 'Promedio Mensual', value: thisYear.reduce((s, e) => s + e.amount, 0) / Math.max(today.getMonth() + 1, 1), bg: 'rgba(33,150,243,0.15)', color: '#2196F3' },
    ];

    const catTotals: Record<string, number> = {};
    this.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    this.byCategory = Object.entries(catTotals)
      .map(([category, total]) => ({ category, total, icon: this.getCatIcon(category) }))
      .sort((a, b) => b.total - a.total);
    this.maxCategoryTotal = this.byCategory.reduce((m, c) => Math.max(m, c.total), 0);
  }

  getCatIcon(cat: string): string {
    return this.categories.find(c => c.name === cat)?.icon || '📌';
  }

  saveExpense() {
    if (!this.form.description || this.form.amount <= 0) {
      this.toast.error('Completa los campos requeridos');
      return;
    }
    this.expenses = [{
      id: Date.now().toString(),
      description: this.form.description,
      category: this.form.category,
      amount: Number(this.form.amount),
      date: new Date(this.form.date),
      notes: this.form.notes
    }, ...this.expenses];
    this.updateStats();
    this.showModal = false;
    this.form = this.emptyForm();
    this.toast.success('Gasto registrado ✓');
  }

  deleteExpense(id: string) {
    if (confirm('¿Eliminar este gasto?')) {
      this.expenses = this.expenses.filter(e => e.id !== id);
      this.updateStats();
      this.toast.success('Gasto eliminado');
    }
  }

  emptyForm() {
    return { description: '', category: 'Mercadería', amount: 0, date: new Date().toISOString().substring(0, 10), notes: '' };
  }

  getMockExpenses(): Expense[] {
    return [
      { id: '1', category: 'Mercadería', description: 'Compra colección verano', amount: 850, date: new Date(Date.now() - 86400000 * 5), notes: 'Proveedor Guayaquil' },
      { id: '2', category: 'Arriendo', description: 'Arriendo local Julio', amount: 400, date: new Date(Date.now() - 86400000 * 10) },
      { id: '3', category: 'Publicidad', description: 'Anuncios Instagram', amount: 120, date: new Date(Date.now() - 86400000 * 3) },
      { id: '4', category: 'Envíos', description: 'Servientrega - lote pedidos', amount: 85, date: new Date(Date.now() - 86400000 * 2) },
      { id: '5', category: 'Servicios', description: 'Plan internet', amount: 45, date: new Date(Date.now() - 86400000 * 15) },
      { id: '6', category: 'Mercadería', description: 'Bolsas y empaques', amount: 60, date: new Date(Date.now() - 86400000 * 1) },
      { id: '7', category: 'Publicidad', description: 'Fotografía de productos', amount: 200, date: new Date(Date.now() - 86400000 * 20) },
    ];
  }
}
