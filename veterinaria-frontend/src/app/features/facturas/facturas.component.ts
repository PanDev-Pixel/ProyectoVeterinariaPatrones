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
import { MatDialogModule } from '@angular/material/dialog';
import { FacturaService } from '../../core/services/factura.service';
import { AuthService } from '../../core/services/auth.service';
import { NgZone } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-facturas',
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
    <div class="facturas-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Mis Facturas</span>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando facturas...</p>
        </div>

        <div *ngIf="!isLoading && facturas.length === 0" class="empty-state">
          <mat-icon>receipt</mat-icon>
          <p>No tiene facturas registradas</p>
        </div>

        <div *ngIf="!isLoading && facturas.length > 0" class="facturas-grid">
          <mat-card *ngFor="let factura of facturas" class="factura-card">
            <mat-card-header>
              <mat-card-title>{{ factura.mascota_nombre }}</mat-card-title>
              <mat-card-subtitle>{{ factura.fecha | date:'dd/MM/yyyy' }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p><strong>Veterinario:</strong> {{ factura.veterinario_nombre }}</p>
              <p><strong>Diagnóstico:</strong> {{ factura.diagnostico }}</p>
              <p *ngIf="factura.tratamiento">
                <strong>Tratamiento:</strong> {{ factura.tratamiento }}
              </p>
              <p *ngIf="factura.medicamento">
                <strong>Medicamento:</strong> {{ factura.medicamento }}
              </p>
              <p class="total">
                <strong>Total:</strong> $ {{ factura.total }}
              </p>
            </mat-card-content>

            <mat-card-actions>
              <button 
                mat-button 
                color="primary" 
                (click)="verDetalles(factura.id)"
              >
                <mat-icon>visibility</mat-icon> Ver Detalles
              </button>
              <button 
                mat-button 
                color="accent" 
                (click)="descargarPDF(factura.id)"
              >
                <mat-icon>download</mat-icon> Descargar
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .facturas-container {
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

    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(0, 0, 0, 0.54);
    }

    .facturas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .factura-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .factura-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    mat-card-content p {
      margin: 8px 0;
      font-size: 14px;
    }

    .total {
      font-size: 18px;
      color: #2c3e50;
      margin-top: 16px;
      border-top: 1px solid #ecf0f1;
      padding-top: 8px;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    mat-icon {
      margin-right: 4px;
    }
  `]
})
export class FacturasComponent implements OnInit, OnDestroy {
  facturas: any[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private facturaService: FacturaService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.isLoading = true;
    this.facturaService.obtenerFacturas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (facturas) => {
          this.ngZone.run(() => {
            this.facturas = facturas;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Error al cargar facturas:', error);
            this.isLoading = false;
            this.snackBar.open('Error al cargar facturas', 'Cerrar', { duration: 3000 });
            this.cdr.detectChanges();
          });
        }
      });
  }

  verDetalles(facturaId: number) {
    this.ngZone.run(() => {
      this.router.navigate(['/facturas', facturaId]);
    });
  }

  descargarPDF(facturaId: number) {
    // TODO: Implementar descarga de PDF
    this.snackBar.open('Descarga en desarrollo', 'Cerrar', { duration: 3000 });
  }

  goBack() {
    this.ngZone.run(() => this.router.navigate(['/dashboard']));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
