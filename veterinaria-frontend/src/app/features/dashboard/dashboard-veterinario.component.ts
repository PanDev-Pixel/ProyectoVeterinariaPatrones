import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { MascotaVetService, MascotaVet } from '../../core/services/mascota-vet.service';
import { CitaVetService } from '../../core/services/cita-vet.service';
import { NgZone } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';

interface MascotaConDueno extends MascotaVet {
  dueno_mascota: string;
  tel: string;
  email: string;
}

@Component({
  selector: 'app-dashboard-veterinario',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-toolbar color="primary">
        <span>Clínica Veterinaria - Dashboard Veterinario</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="logout()" matTooltip="Cerrar sesión">
          <mat-icon>exit_to_app</mat-icon>
        </button>
      </mat-toolbar>

      <div class="dashboard-content">
        <h1>Bienvenido, Dr/a. {{ usuarioNombre }}</h1>
        <p>Especialidad: {{ especialidad }}</p>

        <div class="opciones-principales">
          <mat-card routerLink="/vet/citas" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">event</mat-icon>
            </mat-card-header>
            <mat-card-title>Citas Pendientes</mat-card-title>
            <mat-card-content>
              <p>Revisa tus próximas citas</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Ver Citas</button>
            </mat-card-actions>
          </mat-card>

          <mat-card routerLink="/vet/consultas" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">history</mat-icon>
            </mat-card-header>
            <mat-card-title>Registrar Consulta</mat-card-title>
            <mat-card-content>
              <p>Documenta diagnósticos y tratamientos</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Nueva Consulta</button>
            </mat-card-actions>
          </mat-card>

          <mat-card routerLink="/facturas-vet" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">receipt_long</mat-icon>
            </mat-card-header>
            <mat-card-title>Facturas</mat-card-title>
            <mat-card-content>
              <p>Revisa todas tus facturas</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Ver Facturas</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- SECCIÓN: MIS PACIENTES (TODAS LAS MASCOTAS) -->
        <h2>Mis Pacientes</h2>
        
        <div *ngIf="isLoadingMascotas" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando pacientes...</p>
        </div>

        <div *ngIf="!isLoadingMascotas && mascotas.length === 0" class="empty-state">
          <mat-icon>pets</mat-icon>
          <p>No hay pacientes registrados</p>
        </div>

        <div *ngIf="!isLoadingMascotas && mascotas.length > 0" class="mascotas-grid">
          <mat-card *ngFor="let mascota of mascotas" class="mascota-card">
            <mat-card-header>
              <mat-icon class="pet-icon">
                {{ mascota.especie === 'Perro' ? 'pets' : 'cat' }}
              </mat-icon>
              <div class="header-info">
                <mat-card-title>{{ mascota.nombre }}</mat-card-title>
                <p class="subtitle">{{ mascota.especie }} - {{ mascota.raza }}</p>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="info-item">
                <strong>Edad:</strong> {{ mascota.edad }} años
              </div>
              <div class="info-item">
                <strong>Dueño:</strong> {{ mascota.dueno_mascota }}
              </div>
              <div class="info-item">
                <strong>Teléfono:</strong> {{ mascota.tel }}
              </div>
              <div class="info-item">
                <strong>Email:</strong> {{ mascota.email }}
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" 
                      (click)="verHistorial(mascota.id)">
                Ver Historial
              </button>
              <button mat-button color="accent" 
                      *ngIf="tieneCitasPendientes(mascota.id)"
                      (click)="registrarConsulta(mascota.id, mascota.nombre)">
                Nueva Consulta
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      flex: 1;
      overflow-y: auto;
      padding: 30px;
      background: transparent;
      min-height: calc(100vh - 64px);
    }

    h1 {
      color: #4a4a4a;
      margin-bottom: 5px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 2.2rem;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      color: #4a4a4a;
      margin-top: 40px;
      margin-bottom: 20px;
      border-bottom: 3px solid #4a90e2;
      padding-bottom: 10px;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 1.5rem;
    }

    .opciones-principales {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .option-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      background: #ffffff;
      border: 1px solid #4a90e2;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(255, 183, 197, 0.15);
      padding: 24px;
      text-align: center;
    }

    .option-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 30px rgba(255, 183, 197, 0.25);
      border-color: #2196f3;
    }

    .mascotas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .mascota-card {
      background: #ffffff;
      border: 1px solid #4a90e2;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(255, 183, 197, 0.15);
      transition: transform 0.3s, box-shadow 0.3s;
      border-left: 4px solid #4a90e2;
    }

    .mascota-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(255, 183, 197, 0.25);
      border-left-color: #2196f3;
    }

    .mascota-card mat-card-header {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .pet-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4a90e2;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-info {
      flex: 1;
    }

    .subtitle {
      font-size: 12px;
      color: #666666;
      margin: 0;
      font-family: 'Inter', sans-serif;
    }

    .info-item {
      margin: 8px 0;
      font-size: 14px;
      color: #4a4a4a;
      font-family: 'Inter', sans-serif;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #666666;
      font-family: 'Inter', sans-serif;
    }

    mat-card-actions {
      display: flex;
      gap: 10px;
    }

    mat-card-actions button {
      flex: 1;
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 50%, #e3f2fd 100%);
      color: #4a4a4a;

  mat-card-actions {
    display: flex;
    gap: 10px;
  }

  mat-card-actions button {
    flex: 1;
    background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 50%, #e3f2fd 100%);
    color: #4a4a4a;
    border: 1px solid #4a90e2;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
  }
      color: #4a90e2;
      margin: 16px 0;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    mat-card-title {
      color: #4a4a4a;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 1.3rem;
      margin: 16px 0;
    }

    mat-card-content p {
      color: #666666;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      line-height: 1.5;
    }
  `]
})
export class DashboardVeterinarioComponent implements OnInit, OnDestroy {
  usuarioNombre = '';
  especialidad = '';
  mascotas: MascotaConDueno[] = [];
  isLoadingMascotas = false;
  citasPendientes: Map<number, boolean> = new Map(); // Mapa de mascota_id -> tiene citas pendientes
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private mascotaVetService: MascotaVetService,
    private citaVetService: CitaVetService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPerfilVeterinario();
    this.cargarDatos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPerfilVeterinario() {
    this.authService.perfil().subscribe({
      next: (usuario: any) => {
        this.ngZone.run(() => {
          this.usuarioNombre = usuario.nombre;
          this.especialidad = usuario.especialidad || 'Medicina General';
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error al cargar perfil:', error);
          this.especialidad = 'Medicina General';
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Cargar mascotas y citas en paralelo
  cargarDatos() {
    this.isLoadingMascotas = true;
    
    forkJoin({
      mascotas: this.mascotaVetService.obtenerTodasMascotas(),
      citas: this.citaVetService.obtenerCitas()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resultado) => {
        this.ngZone.run(() => {
          this.mascotas = resultado.mascotas;
          
          // Construir mapa de citas pendientes por mascota
          // Una cita es "pendiente de consulta" si estado es "pendiente"
          this.citasPendientes.clear();
          
          resultado.citas.forEach(cita => {
            if (cita.estado === 'pendiente') {
              // Obtener el id_mascota de la cita (usando mascotaNombre o similar)
              // Como no tenemos id_mascota directo en CitaVet, buscaremos por nombre
              const mascotaConEsaNombre = this.mascotas.find(m => m.nombre === cita.mascotaNombre);
              if (mascotaConEsaNombre) {
                this.citasPendientes.set(mascotaConEsaNombre.id, true);
              }
            }
          });
          
          console.log('✅ Mapa de citas pendientes:', Array.from(this.citasPendientes.entries()));
          
          this.isLoadingMascotas = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error al cargar datos:', error);
          this.isLoadingMascotas = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error al cargar pacientes', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  // Verificar si una mascota tiene citas pendientes
  tieneCitasPendientes(mascotaId: number): boolean {
    return this.citasPendientes.has(mascotaId) && this.citasPendientes.get(mascotaId) === true;
  }

  verHistorial(mascotaId: number) {
    this.router.navigate(['/vet/historial', mascotaId]);
  }

  registrarConsulta(mascotaId: number, nombreMascota: string) {
    this.router.navigate(['/vet/consultas'], {
      queryParams: { mascota_id: mascotaId, mascota_nombre: nombreMascota }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}