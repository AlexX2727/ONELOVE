import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="btn btn-ghost btn-icon" (click)="toggleSidebar.emit()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="search-wrapper" style="width: 280px;">
          <span class="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" class="form-control" placeholder="Buscar pedidos, clientes...">
        </div>
      </div>

      <div class="topbar-right">
        <!-- Theme Toggle -->
        <button class="theme-toggle" (click)="theme.toggle()" [title]="theme.theme() === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'">
          <!-- Sun icon (shown in dark mode → click to go light) -->
          <svg *ngIf="theme.theme() === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon icon (shown in light mode → click to go dark) -->
          <svg *ngIf="theme.theme() === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <span class="theme-label">{{ theme.theme() === 'dark' ? 'Claro' : 'Oscuro' }}</span>
        </button>

        <!-- Notifications -->
        <div class="topbar-action" style="position:relative">
          <button class="btn btn-ghost btn-icon" (click)="showNotifs = !showNotifs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="notif-dot"></span>
          </button>

          <div class="dropdown-panel" *ngIf="showNotifs">
            <div class="dropdown-header">
              <span>Notificaciones</span>
              <span class="badge badge-accent">4</span>
            </div>
            <div class="notif-list">
              <div class="notif-item" *ngFor="let n of notifications">
                <div class="notif-icon" [style.background]="n.color">{{ n.icon }}</div>
                <div class="notif-content">
                  <p>{{ n.message }}</p>
                  <span class="notif-time">{{ n.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- New order button -->
        <button class="btn btn-primary btn-sm" routerLink="/ventas/nuevo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Pedido
        </button>

        <!-- User menu -->
        <div class="user-chip">
          <div class="avatar avatar-sm">A</div>
          <div class="hide-mobile" style="display:flex;flex-direction:column">
            <span style="font-size:0.8rem;font-weight:600">Admin</span>
            <span style="font-size:0.7rem;color:var(--text-muted)">Propietaria</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--header-height);
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* ── Theme toggle button ── */
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-fast);
      font-family: 'Inter', sans-serif;

      &:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--bg-surface2);
      }
    }

    .theme-label {
      letter-spacing: 0.03em;
    }

    .notif-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      border: 2px solid var(--bg-card);
      animation: pulse 2s infinite;
    }

    .topbar-action { position: relative; }

    .dropdown-panel {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 320px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 200;
      overflow: hidden;
      animation: slideUp 0.2s ease;
    }

    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .notif-list { max-height: 280px; overflow-y: auto; }

    .notif-item {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      transition: var(--transition-fast);

      &:hover { background: var(--bg-surface2); }
      &:last-child { border-bottom: none; }
    }

    .notif-icon {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .notif-content p { font-size: 0.825rem; color: var(--text-primary); line-height: 1.4; }
    .notif-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; display: block; }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: var(--transition-fast);

      &:hover { border-color: var(--accent); background: var(--bg-surface2); }
    }
  `]
})
export class TopbarComponent {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  showNotifs = false;

  notifications = [
    { icon: '🛍️', message: 'Nuevo pedido #OL-1012 de María García', time: 'Hace 5 min', color: 'rgba(232,160,191,0.15)' },
    { icon: '📦', message: 'Stock bajo: Blusa Floral (2 unidades)', time: 'Hace 23 min', color: 'rgba(255,193,7,0.15)' },
    { icon: '💬', message: 'Nuevo mensaje de @sofia_ql', time: 'Hace 1h', color: 'rgba(33,150,243,0.15)' },
    { icon: '✅', message: 'Pedido #OL-1009 entregado', time: 'Hace 2h', color: 'rgba(76,175,80,0.15)' },
  ];

  constructor(public theme: ThemeService) {}
}
