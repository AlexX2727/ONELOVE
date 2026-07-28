import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ToastContainerComponent } from '../shared/toast-container/toast-container.component';

const LAYOUT_IMPORTS = [
  CommonModule,
  RouterOutlet,
  SidebarComponent,
  TopbarComponent,
  ToastContainerComponent
] as const;

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [...LAYOUT_IMPORTS],
  template: `
    <div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed">
      <app-sidebar
        [collapsed]="sidebarCollapsed"
        (toggleSidebar)="toggleSidebar()">
      </app-sidebar>
      <div class="main-content">
        <app-topbar
          [sidebarCollapsed]="sidebarCollapsed"
          (toggleSidebar)="toggleSidebar()">
        </app-topbar>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
    <app-toast-container></app-toast-container>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      position: relative;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: var(--sidebar-width);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 0;
      overflow: hidden;
    }

    .app-shell.sidebar-collapsed .main-content {
      margin-left: 72px;
    }

    .page-content {
      flex: 1;
      padding: 28px;
      overflow-y: auto;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0 !important;
      }
    }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = window.innerWidth <= 768;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
