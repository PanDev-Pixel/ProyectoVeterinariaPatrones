import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
                mat-raised-button 
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
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
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

    /* Asegurar tema médico azul - eliminar colores rosa */
    .factura-card {
      background: #ffffff !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 12px !important;
    }

    mat-card-title {
      color: #4a4a4a !important;
      font-family: 'Poppins', sans-serif !important;
      font-weight: 600 !important;
    }

    mat-card-subtitle {
      color: #666666 !important;
      font-family: 'Inter', sans-serif !important;
    }

    /* Botones con tema médico */
    button.mat-raised-button {
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 8px 16px !important;
      font-weight: 500 !important;
      font-family: 'Inter', sans-serif !important;
      transition: all 0.3s ease !important;
    }

    button.mat-raised-button:hover {
      background: linear-gradient(135deg, #2196f3 0%, #4a90e2 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3) !important;
    }

    button.mat-button {
      color: #4a90e2 !important;
      font-family: 'Inter', sans-serif !important;
      font-weight: 500 !important;
    }

    button.mat-button:hover {
      background: rgba(74, 144, 226, 0.1) !important;
    }

    /* Íconos visibles */
    mat-icon {
      color: inherit !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .total {
      color: #4a90e2 !important;
      font-weight: 600 !important;
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
            // Forzar estilos blancos después de cargar
            setTimeout(() => {
              this.forceWhiteStyles();
            }, 100);
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

  forceWhiteStyles() {
    // Forzar estilos blancos en todas las tarjetas de factura
    const cards = document.querySelectorAll('app-facturas mat-card, app-facturas .factura-card');
    cards.forEach((card: any) => {
      if (card) {
        card.style.setProperty('background', '#ffffff', 'important');
        card.style.setProperty('background-color', '#ffffff', 'important');
        card.style.setProperty('border', '1px solid #e0e0e0', 'important');
      }
    });

    // Forzar estilos en headers y content
    const headers = document.querySelectorAll('app-facturas mat-card-header, app-facturas mat-card-content');
    headers.forEach((header: any) => {
      if (header) {
        header.style.setProperty('background', '#ffffff', 'important');
        header.style.setProperty('background-color', '#ffffff', 'important');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
