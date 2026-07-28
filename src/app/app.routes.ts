import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { GastosComponent } from './pages/gastos/gastos.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'ventas/nuevo', component: VentasComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'gastos', component: GastosComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
