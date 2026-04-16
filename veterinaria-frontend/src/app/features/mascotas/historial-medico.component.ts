import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { ConsultaService, HistorialItem } from '../../core/services/consulta.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="historial-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Historial Médico</span>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando historial...</p>
        </div>

        <div *ngIf="!isLoading && historial.length === 0" class="empty-state">
          <mat-icon>history</mat-icon>
          <p>No hay consultas registradas para esta mascota</p>
        </div>

        <div *ngIf="!isLoading && historial.length > 0" class="historial-list">
          <h2>Citas y Consultas</h2>
          <mat-accordion>
            <mat-expansion-panel *ngFor="let item of historial" class="historial-item">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  {{ item.fecha }} - {{ item.veterinario || 'Sin veterinario' }}
                </mat-panel-title>
                <mat-panel-description>
                  <mat-icon [ngClass]="'estado-' + item.estado">
                    {{ getEstadoIcon(item.estado) }}
                  </mat-icon>
                  {{ item.estado }}
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="panel-content">
                <p><strong>Hora:</strong> {{ item.hora }}</p>
                <p><strong>Veterinario:</strong> {{ item.veterinario || 'No disponible' }}</p>
                <p *ngIf="item.especialidad"><strong>Especialidad:</strong> {{ item.especialidad }}</p>

                <mat-divider *ngIf="item.diagnostico" style="margin: 15px 0;"></mat-divider>

                <div *ngIf="item.diagnostico" class="diagnosis-section">
                  <h4>Diagnóstico</h4>
                  <p>{{ item.diagnostico }}</p>

                  <p *ngIf="item.observaciones"><strong>Observaciones:</strong> {{ item.observaciones }}</p>

                  <div *ngIf="item.tratamiento" class="treatment-section">
                    <h4>Tratamiento</h4>
                    <p>{{ item.tratamiento }}</p>
                    <p *ngIf="item.medicamento"><strong>Medicamento:</strong> {{ item.medicamento }}</p>
                    <p *ngIf="item.duracion"><strong>Duración:</strong> {{ item.duracion }}</p>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </div>
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
      padding: 30px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      overflow-y: auto;
    }

    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    .loading p {
      margin-top: 20px;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #e91e63;
    }

    .historial-list {
      max-width: 1000px;
      margin: 0 auto;
    }

    .historial-list h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .historial-item {
      margin-bottom: 10px;
    }

    .panel-content {
      padding: 20px;
      color: #666;
    }

    .panel-content p {
      margin: 10px 0;
    }

    .diagnosis-section {
      margin-top: 15px;
    }

    .diagnosis-section h4 {
      color: #e91e63;
      margin-bottom: 10px;
    }

    .treatment-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .treatment-section h4 {
      color: #ff5722;
      margin-bottom: 10px;
    }

    .estado-confirmada {
      color: #4caf50;
    }

    .estado-cancelada {
      color: #f44336;
    }

    .estado-completada {
      color: #2196f3;
    }
  `]
})
export class HistorialMedicoComponent implements OnInit {
  historial: HistorialItem[] = [];
  isLoading = true;
  mascotaId: number = 0;

  constructor(
    private consultaService: ConsultaService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.mascotaId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.consultaService.obtenerHistorial(this.mascotaId).subscribe({
      next: (historial) => {
        this.ngZone.run(() => {
          this.historial = historial;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/mascotas']);
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'check_circle';
      case 'cancelada':
        return 'cancel';
      case 'completada':
        return 'done_all';
      default:
        return 'info';
    }
  }
}
