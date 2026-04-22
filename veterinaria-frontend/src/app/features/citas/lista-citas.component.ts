import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { CitaService, Cita } from '../../core/services/cita.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NgZone } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lista-citas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="citas-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Mis Citas</span>
        <span class="spacer"></span>
        <button mat-raised-button routerLink="/citas/crear" color="accent">
          <mat-icon>add</mat-icon> Nueva Cita
        </button>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando citas...</p>
        </div>

        <div *ngIf="!isLoading && citas.length === 0" class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <p>No tienes citas agendadas</p>
          <button mat-raised-button color="primary" routerLink="/citas/crear">
            Agendar Primera Cita
          </button>
        </div>

        <div *ngIf="!isLoading && citas.length > 0" class="citas-grid">
          <mat-card *ngFor="let cita of citas" class="cita-card" [ngClass]="'estado-' + cita.estado">
            <mat-card-header>
              <mat-card-title>{{ cita.mascota }}</mat-card-title>
              <mat-card-subtitle>Dr(a). {{ cita.veterinario }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="cita-info">
                <p><strong>Fecha:</strong> {{ cita.fecha | date:'dd/MM/yyyy' }}</p>
                <p><strong>Hora:</strong> {{ cita.hora }}</p>
                <p>
                  <strong>Estado:</strong>
                  <mat-chip-set aria-label="Estado de cita">
                    <mat-chip
                      [class]="'chip-' + cita.estado"
                      selected
                      disabled>
                      {{ cita.estado | uppercase }}
                    </mat-chip>
                  </mat-chip-set>
                </p>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button
                mat-button
                color="primary"
                (click)="editarCita(cita.id)"
                [disabled]="cita.estado === 'completada' || cita.estado === 'cancelada'">
                <mat-icon>edit</mat-icon> Editar
              </button>
              <button
                mat-button
                color="warn"
                (click)="cancelarCita(cita.id)"
                [disabled]="cita.estado === 'completada' || cita.estado === 'cancelada'">
                <mat-icon>cancel</mat-icon> Cancelar
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .citas-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .spacer {
      flex: 1 1 auto;
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
      margin-bottom: 15px;
    }

    .citas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .cita-card {
      transition: transform 0.3s, box-shadow 0.3s;
      border-left: 5px solid #ccc;
    }

    .cita-card.estado-pendiente {
      border-left-color: #ff9800;
    }

    .cita-card.estado-confirmada {
      border-left-color: #4caf50;
    }

    .cita-card.estado-completada {
      border-left-color: #2196f3;
    }

    .cita-card.estado-cancelada {
      border-left-color: #f44336;
      opacity: 0.7;
    }

    .cita-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .cita-info {
      margin-top: 15px;
    }

    .cita-info p {
      margin: 10px 0;
      font-size: 14px;
    }

    .chip-pendiente {
      background: #ffe0b2 !important;
      color: #e65100 !important;
    }

    .chip-confirmada {
      background: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .chip-completada {
      background: #bbdefb !important;
      color: #1565c0 !important;
    }

    .chip-cancelada {
      background: #ffcdd2 !important;
      color: #c62828 !important;
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
export class ListaCitasComponent implements OnInit, OnDestroy {
  citas: Cita[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private citaService: CitaService,
    private router: Router,
    private snackBar: MatSnackBar,
    private confirmDialog: ConfirmDialogService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCitas();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCitas() {
    this.isLoading = true;
    this.citaService.obtenerCitas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas) => {
          this.ngZone.run(() => {
            this.citas = citas;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Error al cargar citas:', error);
            this.isLoading = false;
            this.cdr.detectChanges();
            this.snackBar.open('Error al cargar citas', 'Cerrar', { duration: 3000 });
          });
        }
      });
  }

  async cancelarCita(id: number) {
    const confirmed = await this.confirmDialog.confirm(
      'Cancelar Cita',
      '¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.',
      'Cancelar Cita'
    );

    if (confirmed) {
      this.citaService.cancelarCita(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('✅ Cita cancelada exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarCitas();
          },
          error: (error) => {
            console.error('Error al cancelar cita:', error);
            this.snackBar.open(
              error.error?.mensaje || 'Error al cancelar cita',
              'Cerrar',
              { duration: 3000 }
            );
          }
        });
    }
  }

  editarCita(id: number) {
    this.router.navigate(['/citas', id, 'editar']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
