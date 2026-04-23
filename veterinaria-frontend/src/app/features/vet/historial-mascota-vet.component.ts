import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MascotaVetService, HistorialMascota } from '../../core/services/mascota-vet.service';
import { NgZone } from '@angular/core';

interface ItemHistorial {
  cita_id: number;
  fecha: string;
  hora: string;
  estado: string;
  veterinario: string;
  especialidad: string;
  consulta_id: number | null;
  diagnostico: string | null;
  observaciones: string | null;
  tratamiento: string | null;
  medicamento: string | null;
  duracion: string | null;
}

@Component({
  selector: 'app-historial-mascota-vet',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  template: `
    <div class="historial-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Historial Médico - {{ mascotaNombre }}</span>
      </mat-toolbar>

      <div class="content">
        <!-- INFORMACIÓN GENERAL -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Información del Paciente</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <strong>Nombre:</strong> {{ mascotaNombre }}
              </div>
              <div class="info-item">
                <strong>Especie:</strong> {{ mascotaEspecie }}
              </div>
              <div class="info-item">
                <strong>Raza:</strong> {{ mascotaRaza }}
              </div>
              <div class="info-item">
                <strong>Edad:</strong> {{ mascotaEdad }} años
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- HISTORIAL -->
        <mat-card class="historial-card">
          <mat-card-header>
            <mat-card-title>Historial de Citas y Consultas</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div *ngIf="isLoading" class="loading">
              <mat-spinner></mat-spinner>
              <p>Cargando historial...</p>
            </div>

            <div *ngIf="!isLoading && historial.length === 0" class="empty-state">
              <mat-icon>assignment_late</mat-icon>
              <p>No hay citas registradas para esta mascota</p>
            </div>

            <mat-accordion *ngIf="!isLoading && historial.length > 0" class="historial-accordion">
              <mat-expansion-panel *ngFor="let item of historial" class="cita-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon class="status-icon" [ngClass]="getStatusClass(item.estado)">
                      {{ getStatusIcon(item.estado) }}
                    </mat-icon>
                    <strong>{{ item.fecha | date:'dd/MM/yyyy' }} - {{ item.hora }}</strong>
                  </mat-panel-title>
                  <mat-panel-description>
                    <span class="status-badge" [ngClass]="'estado-' + item.estado">
                      {{ item.estado }}
                    </span>
                    <span *ngIf="item.diagnostico" class="diagnostico-tag">
                      📋 {{ item.diagnostico }}
                    </span>
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <!-- DETALLES DE LA CITA -->
                <div class="panel-content">
                  <div class="cita-section">
                    <h4>Información de la Cita</h4>
                    <div class="detail-group">
                      <p><strong>Veterinario:</strong> Dr/a. {{ item.veterinario }}</p>
                      <p><strong>Especialidad:</strong> {{ item.especialidad }}</p>
                      <p><strong>Hora:</strong> {{ item.hora }}</p>
                      <p><strong>Estado:</strong> {{ item.estado }}</p>
                    </div>
                  </div>

                  <!-- DETALLES DE LA CONSULTA -->
                  <div *ngIf="item.consulta_id" class="consulta-section">
                    <h4>Consulta Médica</h4>
                    <div class="detail-group">
                      <p><strong>Diagnóstico:</strong> {{ item.diagnostico }}</p>
                      <p><strong>Observaciones:</strong></p>
                      <p class="observaciones">{{ item.observaciones }}</p>
                    </div>

                    <!-- TRATAMIENTO -->
                    <div *ngIf="item.tratamiento" class="treatment-section">
                      <h4>Tratamiento Recomendado</h4>
                      <div class="treatment-details">
                        <p><strong>Descripción:</strong> {{ item.tratamiento }}</p>
                        <p *ngIf="item.medicamento">
                          <strong>Medicamento:</strong> {{ item.medicamento }}
                        </p>
                        <p *ngIf="item.duracion">
                          <strong>Duración:</strong> {{ item.duracion }}
                        </p>
                      </div>
                    </div>

                    <div *ngIf="!item.tratamiento" class="no-treatment">
                      <p><mat-icon>info</mat-icon> Sin tratamiento registrado</p>
                    </div>
                  </div>

                  <div *ngIf="!item.consulta_id" class="no-consulta">
                    <p><mat-icon>pending</mat-icon> Cita sin consulta registrada aún</p>
                  </div>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .historial-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .info-card {
      margin-bottom: 20px;
      background: white;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .info-item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 3px solid #1976d2;
    }

    .historial-card {
      background: white;
    }

    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 15px;
    }

    .historial-accordion {
      display: block;
    }

    .cita-panel {
      margin-bottom: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .status-icon {
      margin-right: 10px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-icon.confirmada {
      color: #4caf50;
    }

    .status-icon.completada {
      color: #2196f3;
    }

    .status-icon.cancelada {
      color: #f44336;
    }

    .status-icon.pendiente {
      color: #ff9800;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-right: 10px;
    }

    .estado-confirmada {
      background: #c8e6c9;
      color: #2e7d32;
    }

    .estado-completada {
      background: #bbdefb;
      color: #1565c0;
    }

    .estado-cancelada {
      background: #ffcdd2;
      color: #c62828;
    }

    .estado-pendiente {
      background: #ffe0b2;
      color: #e65100;
    }

    .diagnostico-tag {
      margin-left: 10px;
      font-size: 13px;
      color: #666;
    }

    .panel-content {
      padding: 15px;
    }

    .cita-section {
      margin-bottom: 20px;
    }

    .consulta-section {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #ff5722;
    }

    .treatment-section {
      margin-top: 15px;
      padding: 15px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }

    .treatment-details {
      margin-top: 10px;
    }

    .treatment-details p {
      margin: 8px 0;
      line-height: 1.6;
    }

    .no-treatment, .no-consulta {
      padding: 15px;
      background: #f0f0f0;
      border-radius: 8px;
      text-align: center;
      color: #999;
    }

    .no-treatment mat-icon, .no-consulta mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 16px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .detail-group {
      padding: 10px 0;
    }

    .detail-group p {
      margin: 8px 0;
      line-height: 1.6;
    }

    .observaciones {
      margin: 10px 0;
      padding: 10px;
      background: #fafafa;
      border-left: 3px solid #2196f3;
      font-style: italic;
      line-height: 1.6;
    }
  `]
})
export class HistorialMascotaVetComponent implements OnInit {
  mascotaId: number = 0;
  mascotaNombre: string = '';
  mascotaEspecie: string = '';
  mascotaRaza: string = '';
  mascotaEdad: number = 0;
  historial: ItemHistorial[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mascotaVetService: MascotaVetService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.mascotaId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarMascota();
    this.cargarHistorial();
  }

  cargarMascota() {
    this.mascotaVetService.obtenerMascota(this.mascotaId).subscribe({
      next: (mascota) => {
        this.ngZone.run(() => {
          this.mascotaNombre = mascota.nombre;
          this.mascotaEspecie = mascota.especie;
          this.mascotaRaza = mascota.raza;
          this.mascotaEdad = mascota.edad;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error al cargar mascota:', error);
          this.snackBar.open('Error al cargar datos de mascota', 'Cerrar', { duration: 3000 });
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarHistorial() {
    this.isLoading = true;
    this.mascotaVetService.obtenerHistorialMascota(this.mascotaId).subscribe({
      next: (items: any[]) => {
        this.ngZone.run(() => {
          this.historial = items;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error al cargar historial:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'check_circle';
      case 'completada':
        return 'done_all';
      case 'cancelada':
        return 'cancel';
      case 'pendiente':
        return 'schedule';
      default:
        return 'info';
    }
  }

  getStatusClass(estado: string): string {
    return estado;
  }

  goBack() {
    this.router.navigate(['/dashboard-vet']);
  }
}
