import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardVeterinarioComponent } from './features/dashboard/dashboard-veterinario.component';
import { ListaMascotasComponent } from './features/mascotas/lista-mascotas.component';
import { AgregarMascotaComponent } from './features/mascotas/agregar-mascota.component';
import { HistorialMedicoComponent } from './features/mascotas/historial-medico.component';
import { CrearCitaComponent } from './features/citas/crear-cita.component';
import { CitasVetComponent } from './features/vet/citas-vet.component';
import { ConsultasVetComponent } from './features/vet/consultas-vet.component';
import { HistorialMascotaVetComponent } from './features/vet/historial-mascota-vet.component';
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
  { path: 'citas/crear', component: CrearCitaComponent, canActivate: [authGuard] },
  
  // Veterinario
  { path: 'dashboard-vet', component: DashboardVeterinarioComponent, canActivate: [authGuard] },
  { path: 'vet/citas', component: CitasVetComponent, canActivate: [authGuard] },
  { path: 'vet/consultas', component: ConsultasVetComponent, canActivate: [authGuard] },
  { path: 'vet/historial/:id', component: HistorialMascotaVetComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: '/login' }
];