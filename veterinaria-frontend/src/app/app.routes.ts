import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardVeterinarioComponent } from './features/dashboard/dashboard-veterinario.component';
import { ListaMascotasComponent } from './features/mascotas/lista-mascotas.component';
import { AgregarMascotaComponent } from './features/mascotas/agregar-mascota.component';
import { HistorialMedicoComponent } from './features/mascotas/historial-medico.component';
import { ListaCitasComponent } from './features/citas/lista-citas.component';
import { CrearCitaComponent } from './features/citas/crear-cita.component';
import { CitasVetComponent } from './features/vet/citas-vet.component';
import { ConsultasVetComponent } from './features/vet/consultas-vet.component';
import { HistorialMascotaVetComponent } from './features/vet/historial-mascota-vet.component';
import { ListaFacturasComponent } from './features/mascotas/lista-facturas.component';
import { FacturaDetalleComponent } from './features/mascotas/factura-detalle.component';
import { FacturasVetComponent } from './features/vet/facturas-vet.component';
import { FacturaDetalleVetComponent } from './features/vet/factura-detalle-vet.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  
  // Usuario normal
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'mascotas', component: ListaMascotasComponent, canActivate: [authGuard] },
  { path: 'mascotas/add', component: AgregarMascotaComponent, canActivate: [authGuard] },
  { path: 'mascotas/:id/historial', component: HistorialMedicoComponent, canActivate: [authGuard] },
  { path: 'citas', component: ListaCitasComponent, canActivate: [authGuard] },
  { path: 'citas/crear', component: CrearCitaComponent, canActivate: [authGuard] },
  { path: 'facturas', component: ListaFacturasComponent, canActivate: [authGuard] },
  { path: 'factura-detalle/:id', component: FacturaDetalleComponent, canActivate: [authGuard] },
  
  // Veterinario
  { path: 'dashboard-vet', component: DashboardVeterinarioComponent, canActivate: [authGuard] },
  { path: 'vet/citas', component: CitasVetComponent, canActivate: [authGuard] },
  { path: 'vet/consultas', component: ConsultasVetComponent, canActivate: [authGuard] },
  { path: 'vet/historial/:id', component: HistorialMascotaVetComponent, canActivate: [authGuard] },
  { path: 'facturas-vet', component: FacturasVetComponent, canActivate: [authGuard] },
  { path: 'factura-detalle-vet/:id', component: FacturaDetalleVetComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: '/login' }
];