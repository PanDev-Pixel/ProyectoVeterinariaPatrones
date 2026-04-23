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
import { NgZone } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

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
          <mat-icon>logout</mat-icon>
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

          <mat-card routerLink="/vet/facturacion" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">receipt</mat-icon>
            </mat-card-header>
            <mat-card-title>Facturación</mat-card-title>
            <mat-card-content>
              <p>Genera facturas por consultas realizadas</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Facturar</button>
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
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      flex: 1;
      overflow-y: auto;
      padding: 30px;
      background-color: #f5f5f5;
    }

    h1 {
      color: #333;
      margin-bottom: 5px;
    }

    h2 {
      color: #555;
      margin-top: 40px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e91e63;
      padding-bottom: 10px;
    }

    .opciones-principales {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .option-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .option-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .mascotas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .mascota-card {
      border-left: 4px solid #e91e63;
    }

    .mascota-card mat-card-header {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .pet-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #e91e63;
    }

    .header-info {
      flex: 1;
    }

    .subtitle {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .info-item {
      margin: 8px 0;
      font-size: 14px;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    mat-card-actions {
      display: flex;
      gap: 10px;
    }

    mat-card-actions button {
      flex: 1;
    }
  `]
})
export class DashboardVeterinarioComponent implements OnInit {
  usuarioNombre = '';
  especialidad = '';
  mascotas: MascotaConDueno[] = [];
  isLoadingMascotas = false;

  constructor(
    private authService: AuthService,
    private mascotaVetService: MascotaVetService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPerfilVeterinario();
    this.cargarTodasMascotas();
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

  cargarTodasMascotas() {
    this.isLoadingMascotas = true;
    this.mascotaVetService.obtenerTodasMascotas().subscribe({
      next: (mascotas) => {
        this.ngZone.run(() => {
          this.mascotas = mascotas;
          this.isLoadingMascotas = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoadingMascotas = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error al cargar pacientes', 'Cerrar', { duration: 3000 });
        });
      }
    });
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