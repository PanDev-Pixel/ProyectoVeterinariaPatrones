import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FacturaService } from '../../core/services/factura.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-factura-detalle',
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
    <div class="factura-detalle-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Detalles de Factura</span>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando factura...</p>
        </div>

        <div *ngIf="!isLoading && factura" class="factura-content">
          <mat-card class="factura-card">
            <mat-card-header>
              <mat-card-title>Factura #{{ factura.id }}</mat-card-title>
              <mat-card-subtitle>{{ factura.fecha | date:'dd/MM/yyyy' }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="section">
                <h3>Información de la Mascota</h3>
                <p><strong>Mascota:</strong> {{ factura.mascota_nombre }}</p>
                <p><strong>Veterinario:</strong> {{ factura.veterinario_nombre }}</p>
              </div>

              <div class="section">
                <h3>Consulta Médica</h3>
                <p><strong>Diagnóstico:</strong> {{ factura.diagnostico }}</p>
                <p><strong>Observaciones:</strong> {{ factura.observaciones }}</p>
                <p><strong>Fecha de Cita:</strong> {{ factura.fecha_cita | date:'dd/MM/yyyy' }}</p>
              </div>

              <div class="section" *ngIf="factura.tratamiento">
                <h3>Tratamiento Recetado</h3>
                <p><strong>Descripción:</strong> {{ factura.tratamiento }}</p>
                <p *ngIf="factura.medicamento">
                  <strong>Medicamento:</strong> {{ factura.medicamento }}
                </p>
                <p *ngIf="factura.duracion">
                  <strong>Duración:</strong> {{ factura.duracion }}
                </p>
              </div>

              <div class="section total-section">
                <h3>Resumen Financiero</h3>
                <div class="total-row">
                  <span><strong>Monto Total:</strong></span>
                  <span class="total-amount">$ {{ factura.total }}</span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="imprimir()">
                <mat-icon>print</mat-icon> Imprimir
              </button>
              <button mat-raised-button color="accent" (click)="descargarPDF()">
                <mat-icon>download</mat-icon> Descargar PDF
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div *ngIf="!isLoading && !factura" class="error-state">
          <mat-icon>error</mat-icon>
          <p>Factura no encontrada</p>
          <button mat-raised-button (click)="goBack()">Volver</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .factura-detalle-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content {
      flex: 1;
      padding: 30px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .loading, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .factura-content {
      width: 100%;
      max-width: 700px;
    }

    .factura-card {
      width: 100%;
    }

    .section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ecf0f1;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h3 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }

    .section p {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.6;
    }

    .total-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 0;
      border-bottom: none;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #27ae60;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    mat-icon {
      margin-right: 4px;
    }

    @media print {
      .factura-detalle-container > mat-toolbar,
      mat-card-actions {
        display: none;
      }
    }
  `]
})
export class FacturaDetalleComponent implements OnInit {
  factura: any = null;
  isLoading = true;

  constructor(
    private facturaService: FacturaService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const facturaId = this.activatedRoute.snapshot.paramMap.get('id');
    if (facturaId) {
      this.cargarFactura(parseInt(facturaId));
    }
  }

  cargarFactura(id: number) {
    this.isLoading = true;
    this.facturaService.obtenerFactura(id).subscribe({
      next: (factura) => {
        this.ngZone.run(() => {
          this.factura = factura;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error al cargar factura:', error);
          this.isLoading = false;
          this.snackBar.open('Error al cargar factura', 'Cerrar', { duration: 3000 });
          this.cdr.detectChanges();
        });
      }
    });
  }

  imprimir() {
    window.print();
  }

  descargarPDF() {
    // TODO: Implementar descarga de PDF
    this.snackBar.open('Descarga en desarrollo', 'Cerrar', { duration: 3000 });
  }

  goBack() {
    this.ngZone.run(() => this.router.navigate(['/facturas']));
  }
}
