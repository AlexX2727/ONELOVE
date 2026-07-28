import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fadeIn">
      <div class="page-header">
        <div class="page-title">
          <h2>Configuración</h2>
          <p>Personaliza tu sistema ONE LOVE</p>
        </div>
        <button class="btn btn-primary" (click)="save()">💾 Guardar Cambios</button>
      </div>

      <div class="grid" style="grid-template-columns:240px 1fr;gap:24px">
        <!-- Nav -->
        <div class="card" style="padding:12px;height:fit-content">
          <nav style="display:flex;flex-direction:column;gap:4px">
            <button *ngFor="let s of sections" 
                    class="settings-nav-btn" [class.active]="activeSection === s.id"
                    (click)="activeSection = s.id">
              <span>{{ s.icon }}</span>
              {{ s.label }}
            </button>
          </nav>
        </div>

        <!-- Content -->
        <div>
          <!-- Negocio -->
          <div class="card" *ngIf="activeSection === 'negocio'">
            <h3 style="font-size:1rem;margin-bottom:20px">Información del Negocio</h3>
            <div style="display:flex;flex-direction:column;gap:16px">
              <div style="text-align:center;margin-bottom:8px">
                <div class="avatar avatar-xl" style="margin:0 auto 12px;font-size:1.5rem">💕</div>
                <button class="btn btn-secondary btn-sm">Cambiar Logo</button>
              </div>
              <div class="form-group">
                <label>Nombre del Negocio</label>
                <input type="text" class="form-control" [(ngModel)]="config.businessName">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                <div class="form-group">
                  <label>Instagram</label>
                  <input type="text" class="form-control" [(ngModel)]="config.instagram">
                </div>
                <div class="form-group">
                  <label>WhatsApp</label>
                  <input type="text" class="form-control" [(ngModel)]="config.whatsapp">
                </div>
              </div>
              <div class="form-group">
                <label>Email de contacto</label>
                <input type="email" class="form-control" [(ngModel)]="config.email">
              </div>
              <div class="form-group">
                <label>Ciudad / País</label>
                <input type="text" class="form-control" [(ngModel)]="config.location">
              </div>
              <div class="form-group">
                <label>Descripción del negocio</label>
                <textarea class="form-control" [(ngModel)]="config.description" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Ventas -->
          <div class="card" *ngIf="activeSection === 'ventas'">
            <h3 style="font-size:1rem;margin-bottom:20px">Configuración de Ventas</h3>
            <div style="display:flex;flex-direction:column;gap:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                <div class="form-group">
                  <label>Moneda</label>
                  <select class="form-select" [(ngModel)]="config.currency">
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Costo de Envío por Defecto</label>
                  <div class="input-group">
                    <span class="input-prefix">\$</span>
                    <input type="number" class="form-control" [(ngModel)]="config.defaultShipping">
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>IVA (%)</label>
                <input type="number" class="form-control" [(ngModel)]="config.taxRate" style="max-width:150px">
              </div>
              <div style="display:flex;flex-direction:column;gap:12px">
                <p style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Opciones</p>
                <label *ngFor="let opt of saleOptions" style="display:flex;align-items:center;gap:10px;cursor:pointer">
                  <input type="checkbox" [(ngModel)]="opt.enabled" style="accent-color:var(--accent);width:16px;height:16px">
                  <div>
                    <p style="font-size:0.875rem;font-weight:500">{{ opt.label }}</p>
                    <p style="font-size:0.75rem;color:var(--text-muted)">{{ opt.desc }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Notificaciones -->
          <div class="card" *ngIf="activeSection === 'notificaciones'">
            <h3 style="font-size:1rem;margin-bottom:20px">Notificaciones</h3>
            <div style="display:flex;flex-direction:column;gap:16px">
              <div *ngFor="let n of notifications" 
                   style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg-surface);border-radius:var(--radius-md)">
                <div>
                  <p style="font-weight:500;font-size:0.875rem">{{ n.label }}</p>
                  <p style="font-size:0.75rem;color:var(--text-muted)">{{ n.desc }}</p>
                </div>
                <label style="position:relative;width:44px;height:24px;cursor:pointer">
                  <input type="checkbox" [(ngModel)]="n.enabled" style="opacity:0;position:absolute">
                  <div [style.background]="n.enabled ? 'var(--accent)' : 'var(--bg-surface2)'"
                       style="position:absolute;inset:0;border-radius:12px;transition:all 0.2s">
                    <div [style.transform]="n.enabled ? 'translateX(20px)' : 'translateX(2px)'"
                         style="position:absolute;top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:all 0.2s"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Perfil -->
          <div class="card" *ngIf="activeSection === 'perfil'">
            <h3 style="font-size:1rem;margin-bottom:20px">Perfil de Administradora</h3>
            <div style="display:flex;flex-direction:column;gap:16px">
              <div class="form-group">
                <label>Nombre</label>
                <input type="text" class="form-control" [(ngModel)]="config.adminName">
              </div>
              <div class="form-group">
                <label>Contraseña actual</label>
                <input type="password" class="form-control" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label>Nueva contraseña</label>
                <input type="password" class="form-control" placeholder="••••••••">
              </div>
              <div style="padding:16px;background:rgba(232,160,191,0.05);border:1px solid var(--border);border-radius:var(--radius-md)">
                <p style="font-size:0.8rem;color:var(--text-muted)">💡 Sistema v1.0 · ONE LOVE Fashion Store · Ecuador 🇪🇨</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-nav-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      color: var(--text-muted);
      background: none;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: var(--transition-fast);
      
      &:hover { background: var(--bg-surface); color: var(--text-primary); }
      &.active { background: rgba(232,160,191,0.1); color: var(--accent); }
    }
  `]
})
export class ConfiguracionComponent {
  activeSection = 'negocio';

  sections = [
    { id: 'negocio', icon: '🏪', label: 'Negocio' },
    { id: 'ventas', icon: '🛍️', label: 'Ventas' },
    { id: 'notificaciones', icon: '🔔', label: 'Notificaciones' },
    { id: 'perfil', icon: '👤', label: 'Mi Perfil' },
  ];

  config = {
    businessName: 'ONE LOVE',
    instagram: '@onelovee1_',
    whatsapp: '+593991234567',
    email: 'hola@onelovefashion.ec',
    location: 'Ecuador 🇪🇨',
    description: 'Tu boutique fashion favorita. Ropa y accesorios para mujeres que se aman 💕',
    currency: 'USD',
    defaultShipping: 5,
    taxRate: 0,
    adminName: 'Admin ONE LOVE'
  };

  saleOptions = [
    { label: 'Calcular IVA automáticamente', desc: 'Aplica IVA en todos los pedidos', enabled: false },
    { label: 'Stock mínimo de 5 unidades', desc: 'Alerta cuando el stock baje de 5', enabled: true },
    { label: 'Confirmar pedido automáticamente', desc: 'Al crear un pedido se confirma directamente', enabled: false },
    { label: 'Enviar mensaje WhatsApp al crear pedido', desc: 'Notifica al cliente por WhatsApp', enabled: true },
  ];

  notifications = [
    { label: 'Nuevo pedido', desc: 'Alerta cuando llegue un pedido nuevo', enabled: true },
    { label: 'Stock bajo', desc: 'Cuando un producto baje de 5 unidades', enabled: true },
    { label: 'Mensaje nuevo', desc: 'Nuevo mensaje en el chat', enabled: true },
    { label: 'Pedido entregado', desc: 'Confirmación de entrega', enabled: false },
  ];

  constructor(private toast: ToastService) {}

  save() { this.toast.success('Configuración guardada ✓'); }
}
