import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService, DashboardStats, RecentActivity } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
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
