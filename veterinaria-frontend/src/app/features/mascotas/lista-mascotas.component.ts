import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MascotaService, Mascota } from '../../core/services/mascota.service';
import { AuthService } from '../../core/services/auth.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-lista-mascotas',
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
    MatDialogModule
  ],
  template: `
    <div class="mascotas-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Mis Mascotas</span>
        <span class="spacer"></span>
        <button mat-raised-button routerLink="/mascotas/add">
          <mat-icon>add</mat-icon> Agregar Mascota
        </button>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando mascotas...</p>
        </div>

        <div *ngIf="!isLoading && mascotas.length === 0" class="empty-state">
          <mat-icon>pets</mat-icon>
          <p>No tiene mascotas registradas</p>
          <button mat-raised-button color="primary" routerLink="/mascotas/add">
            Agregar Mascota
          </button>
        </div>

        <div *ngIf="!isLoading && mascotas.length > 0" class="mascotas-grid">
          <mat-card *ngFor="let mascota of mascotas" class="mascota-card">
            <mat-card-header>
              <mat-card-title>{{ mascota.nombre }}</mat-card-title>
              <mat-card-subtitle>{{ mascota.especie }} - {{ mascota.raza }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p><strong>Edad:</strong> {{ mascota.edad }} años</p>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/mascotas', mascota.id, 'historial']">
                <mat-icon>history</mat-icon> Ver Historial
              </button>
              <button mat-button color="warn" (click)="deleteMascota(mascota.id)">
                <mat-icon>delete</mat-icon> Eliminar
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mascotas-container {
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
    }

    .mascotas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .mascota-card {
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .mascota-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    mat-card-actions button {
      margin-right: 10px;
    }
  `]
})
export class ListaMascotasComponent implements OnInit {
  mascotas: Mascota[] = [];
  isLoading = true;

  constructor(
    private mascotaService: MascotaService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarMascotas();
  }

  cargarMascotas() {
    this.isLoading = true;
    this.mascotaService.obtenerMascotas().subscribe({
      next: (mascotas) => {
        this.ngZone.run(() => {
          this.mascotas = mascotas;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error al cargar mascotas', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  deleteMascota(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta mascota?')) {
      this.mascotaService.eliminarMascota(id).subscribe({
        next: () => {
          this.snackBar.open('Mascota eliminada', 'Cerrar', { duration: 3000 });
          this.cargarMascotas();
        },
        error: (error) => {
          this.snackBar.open('Error al eliminar mascota', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
