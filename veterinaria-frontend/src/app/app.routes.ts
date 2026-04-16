import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ListaMascotasComponent } from './features/mascotas/lista-mascotas.component';
import { AgregarMascotaComponent } from './features/mascotas/agregar-mascota.component';
import { HistorialMedicoComponent } from './features/mascotas/historial-medico.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'mascotas', component: ListaMascotasComponent, canActivate: [authGuard] },
  { path: 'mascotas/add', component: AgregarMascotaComponent, canActivate: [authGuard] },
  { path: 'mascotas/:id/historial', component: HistorialMedicoComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
