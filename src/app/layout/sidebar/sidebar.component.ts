import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NavItem {
  icon: SafeHtml;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C20 4 8 10 8 20C8 30 20 36 20 36C20 36 32 30 32 20C32 10 20 4 20 4Z"
                  stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
            <path d="M14 20C14 20 17 16 20 18C23 20 26 16 26 20"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="20" cy="8" r="2" fill="currentColor"/>
          </svg>
        </div>
        <div class="logo-text" *ngIf="!collapsed">
          <span class="logo-main">ONE LOVE</span>
          <span class="logo-sub">Sistema · v1.0</span>
        </div>
        <button class="sidebar-toggle" (click)="toggleSidebar.emit()" [title]="collapsed ? 'Expandir' : 'Colapsar'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path *ngIf="!collapsed" d="M15 18l-6-6 6-6"/>
            <path *ngIf="collapsed" d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <!-- Principal -->
        <div class="nav-section">
          <span class="nav-label" *ngIf="!collapsed">PRINCIPAL</span>
          <a *ngFor="let item of mainNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [attr.title]="collapsed ? item.label : null">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-text" *ngIf="!collapsed">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="item.badge && !collapsed">{{ item.badge }}</span>
          </a>
        </div>

        <!-- Gestión -->
        <div class="nav-section">
          <span class="nav-label" *ngIf="!collapsed">GESTIÓN</span>
          <a *ngFor="let item of manageNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [attr.title]="collapsed ? item.label : null">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-text" *ngIf="!collapsed">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="item.badge && !collapsed">{{ item.badge }}</span>
          </a>
        </div>

        <!-- Sistema -->
        <div class="nav-section">
          <span class="nav-label" *ngIf="!collapsed">SISTEMA</span>
          <a *ngFor="let item of systemNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [attr.title]="collapsed ? item.label : null">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-text" *ngIf="!collapsed">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <!-- Footer user -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="user-profile">
          <div class="avatar avatar-sm">A</div>
          <div class="user-info">
            <span class="user-name">Admin ONE LOVE</span>
            <span class="user-role">Administradora</span>
          </div>
        </div>
      </div>
      <!-- Footer collapsed: sólo avatar -->
      <div class="sidebar-footer sidebar-footer-collapsed" *ngIf="collapsed">
        <div class="avatar avatar-sm" title="Admin ONE LOVE">A</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      min-height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    /* ── Logo ── */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 14px;
      border-bottom: 1px solid var(--border);
      min-height: 72px;
      overflow: hidden;
    }

    .logo-mark {
      width: 36px;
      height: 36px;
      min-width: 36px;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      flex-shrink: 0;
      svg { width: 22px; height: 22px; }
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .logo-main {
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: 0.05em;
    }

    .logo-sub {
      font-size: 0.62rem;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .sidebar-toggle {
      width: 26px;
      height: 26px;
      min-width: 26px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      transition: var(--transition-fast);
      cursor: pointer;
      flex-shrink: 0;
      svg { width: 13px; height: 13px; }

      &:hover {
        background: var(--bg-surface2);
        color: var(--accent);
        border-color: var(--accent);
      }
    }

    /* ── Nav ── */
    .sidebar-nav {
      flex: 1;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 2px;
      & + & { margin-top: 10px; }
    }

    .nav-label {
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 0 8px;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      transition: var(--transition-fast);
      position: relative;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;

      &:hover {
        background: var(--bg-surface);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(232, 160, 191, 0.1);
        color: var(--accent);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: var(--accent);
          border-radius: 0 2px 2px 0;
        }
      }
    }

    /* Icon always visible */
    .nav-icon {
      width: 20px;
      height: 20px;
      min-width: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      svg { width: 18px; height: 18px; }
    }

    .nav-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background: var(--accent);
      color: var(--primary);
      font-size: 0.62rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: var(--radius-full);
      min-width: 18px;
      text-align: center;
      flex-shrink: 0;
    }

    /* ── Footer ── */
    .sidebar-footer {
      padding: 14px;
      border-top: 1px solid var(--border);
    }

    .sidebar-footer-collapsed {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.68rem;
      color: var(--text-muted);
    }

    /* Tooltip-like on collapsed */
    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 10px;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  mainNav: NavItem[];
  manageNav: NavItem[];
  systemNav: NavItem[];

  constructor(private sanitizer: DomSanitizer) {
    const svg = (d: string) => sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${d}</svg>`
    );
    this.mainNav = [
      { icon: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'), label: 'Dashboard', route: '/dashboard' },
      { icon: svg('<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>'), label: 'Ventas', route: '/ventas', badge: 3 },
      { icon: svg('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'), label: 'Chat', route: '/chat', badge: 5 },
    ];
    this.manageNav = [
      { icon: svg('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'), label: 'Figuras / Productos', route: '/productos' },
      { icon: svg('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>'), label: 'Clientes', route: '/clientes' },
      { icon: svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'), label: 'Gastos', route: '/gastos' },
      { icon: svg('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'), label: 'Inventario', route: '/inventario' },
      { icon: svg('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'), label: 'Reportes', route: '/reportes' },
    ];
    this.systemNav = [
      { icon: svg('<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2"/>'), label: 'Configuración', route: '/configuracion' },
    ];
  }
}
