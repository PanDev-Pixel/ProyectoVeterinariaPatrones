import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService, DashboardStats, RecentActivity } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Router,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-dashboard">
      <mat-toolbar color="primary" class="dashboard-toolbar">
        <mat-icon>dashboard</mat-icon>
        <span>Panel de Administración</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="refreshData()" matTooltip="Actualizar datos">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button (click)="goBack()" matTooltip="Volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </mat-toolbar>

      <div class="dashboard-content">
        <!-- Loading -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando estadísticas...</p>
        </div>

        <!-- Estadísticas principales -->
        <div *ngIf="!loading" class="stats-grid">
          <mat-card class="stat-card primary">
            <mat-card-header>
              <mat-icon mat-card-avatar>people</mat-icon>
              <mat-card-title>Usuarios Totales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.totalUsuarios }}</div>
              <div class="stat-subtitle">Clientes registrados</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card secondary">
            <mat-card-header>
              <mat-icon mat-card-avatar>medical_services</mat-icon>
              <mat-card-title>Veterinarios</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.totalVeterinarios }}</div>
              <div class="stat-subtitle">Personal médico</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card accent">
            <mat-card-header>
              <mat-icon mat-card-avatar>pets</mat-icon>
              <mat-card-title>Mascotas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.totalMascotas }}</div>
              <div class="stat-subtitle">Pacientes registrados</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card warn">
            <mat-card-header>
              <mat-icon mat-card-avatar>event</mat-icon>
              <mat-card-title>Citas Totales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.totalCitas }}</div>
              <div class="stat-subtitle">Historial completo</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Estadísticas adicionales -->
        <div *ngIf="!loading" class="secondary-stats">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>today</mat-icon>
              <mat-card-title>Citas Hoy</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.citasHoy }}</div>
              <div class="stat-subtitle">Agendadas para hoy</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>pending</mat-icon>
              <mat-card-title>Pendientes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.citasPendientes }}</div>
              <div class="stat-subtitle">Citas por confirmar</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>check_circle</mat-icon>
              <mat-card-title>Completadas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ stats.citasCompletadas }}</div>
              <div class="stat-subtitle">Citas realizadas</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>payments</mat-icon>
              <mat-card-title>Ingresos Mes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">${{ stats.ingresosMes.toLocaleString() }}</div>
              <div class="stat-subtitle">Facturación actual</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Acciones rápidas -->
        <div *ngIf="!loading" class="quick-actions">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Acciones Rápidas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="actions-grid">
                <button mat-raised-button color="primary" (click)="navigateTo('/admin/usuarios')">
                  <mat-icon>people</mat-icon>
                  Gestionar Usuarios
                </button>
                <button mat-raised-button color="accent" (click)="navigateTo('/admin/veterinarios')">
                  <mat-icon>medical_services</mat-icon>
                  Gestionar Veterinarios
                </button>
                <button mat-raised-button color="warn" (click)="navigateTo('/admin/tratamientos')">
                  <mat-icon>medication</mat-icon>
                  Gestionar Tratamientos
                </button>
                <button mat-raised-button color="primary" (click)="navigateTo('/admin/facturacion')">
                  <mat-icon>receipt</mat-icon>
                  Ver Facturación
                </button>
                <button mat-raised-button color="secondary" (click)="navigateTo('/admin/backup')">
                  <mat-icon>backup</mat-icon>
                  Backup de Datos
                </button>
                <button mat-raised-button color="basic" (click)="navigateTo('/citas')">
                  <mat-icon>event</mat-icon>
                  Ver Citas
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Actividad reciente -->
        <div *ngIf="!loading" class="recent-activity">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Actividad Reciente</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                <div *ngFor="let activity of recentActivities" class="activity-item">
                  <mat-icon>{{ activity.icono }}</mat-icon>
                  <div class="activity-content">
                    <div class="activity-description">{{ activity.descripcion }}</div>
                    <div class="activity-date">{{ activity.fecha | date:'short' }}</div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
    }

    .dashboard-toolbar {
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 50%, #e3f2fd 100%);
      color: white;
      box-shadow: 0 2px 10px rgba(74, 144, 226, 0.2);
    }

    .dashboard-toolbar span {
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 20px;
    }

    .loading-container p {
      color: #4a90e2;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .secondary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(74, 144, 226, 0.2);
    }

    .stat-card.primary {
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 100%);
      color: white;
    }

    .stat-card.secondary {
      background: linear-gradient(135deg, #87ceeb 0%, #e3f2fd 100%);
      color: #4a90e2;
    }

    .stat-card.accent {
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
      color: #4a90e2;
    }

    .stat-card.warn {
      background: linear-gradient(135deg, #f0f8ff 0%, #f8fafc 100%);
      color: #4a4a4a;
    }

    .stat-card mat-card-header {
      padding-bottom: 8px;
    }

    .stat-card mat-card-title {
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
    }

    .stat-card mat-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      padding: 8px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      margin: 10px 0;
      font-family: 'Poppins', sans-serif;
    }

    .stat-subtitle {
      font-size: 12px;
      opacity: 0.8;
      font-family: 'Inter', sans-serif;
    }

    .quick-actions {
      margin-bottom: 30px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .actions-grid button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
    }

    .actions-grid button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .recent-activity {
      margin-bottom: 30px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #4a90e2;
    }

    .activity-item mat-icon {
      color: #4a90e2;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      font-weight: 500;
      color: #4a4a4a;
      font-family: 'Inter', sans-serif;
    }

    .activity-date {
      font-size: 12px;
      color: #666666;
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .secondary-stats {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalUsuarios: 0,
    totalVeterinarios: 0,
    totalMascotas: 0,
    totalCitas: 0,
    citasHoy: 0,
    ingresosMes: 0,
    citasPendientes: 0,
    citasCompletadas: 0
  };

  recentActivities: RecentActivity[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Cargar estadísticas del dashboard
    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: DashboardStats) => {
          this.stats = stats;
          console.log('Estadísticas cargadas:', stats);
        },
        error: (error: any) => {
          console.error('Error al cargar estadísticas:', error);
          // Si hay error, usar valores por defecto
          this.stats = {
            totalUsuarios: 0,
            totalVeterinarios: 0,
            totalMascotas: 0,
            totalCitas: 0,
            citasHoy: 0,
            ingresosMes: 0,
            citasPendientes: 0,
            citasCompletadas: 0
          };
          this.snackBar.open('Error al cargar estadísticas', 'Cerrar', { duration: 3000 });
        }
      });

    // Cargar actividad reciente
    this.adminService.getRecentActivity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities: RecentActivity[]) => {
          this.recentActivities = activities.map((activity: RecentActivity) => ({
            ...activity,
            fecha: new Date(activity.fecha)
          }));
          console.log('Actividad reciente cargada:', activities);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al cargar actividad reciente:', error);
          // Si hay error, usar datos de ejemplo
          this.recentActivities = [
            {
              id: 1,
              tipo: 'cita',
              descripcion: 'Nueva cita agendada',
              fecha: new Date(),
              icono: 'event'
            }
          ];
          this.loading = false;
          this.snackBar.open('Error al cargar actividad reciente', 'Cerrar', { duration: 3000 });
        }
      });
  }

  refreshData() {
    this.snackBar.open('Actualizando datos...', 'Cerrar', { duration: 2000 });
    this.loadDashboardData();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
