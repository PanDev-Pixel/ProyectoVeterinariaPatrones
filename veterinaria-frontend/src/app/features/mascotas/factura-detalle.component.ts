import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FacturaService, FacturaDetalle } from '../../core/services/factura.service';

@Component({
  selector: 'app-factura-detalle',
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
  template: `
    <div class="factura-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Detalle de Factura</span>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="cargando" class="loading">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando factura...</p>
        </div>

        <div *ngIf="!cargando && factura" class="factura-detalle">
          <!-- Encabezado Factura -->
          <mat-card class="header-card">
            <mat-card-content>
              <div class="factura-header">
                <div class="factura-numero">
                  <h2>Factura #{{ factura.id }}</h2>
                  <p class="fecha">Fecha: {{ factura.fecha | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="factura-total">
                  <h3>Total</h3>
                  <p class="monto">$ {{ factura.total | number: '1.2-2' }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Información de la Mascota -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>Información de la Mascota</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Mascota:</label>
                  <p>{{ factura.mascota_nombre }}</p>
                </div>
                <div class="info-item">
                  <label>Especie:</label>
                  <p>{{ factura.especie }}</p>
                </div>
                <div class="info-item">
                  <label>Raza:</label>
                  <p>{{ factura.raza }}</p>
                </div>
                <div class="info-item">
                  <label>Edad:</label>
                  <p>{{ factura.edad }} años</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Información de la Consulta -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>Información de la Consulta</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item full-width">
                  <label>Diagnóstico:</label>
                  <p>{{ factura.diagnostico }}</p>
                </div>
                <div class="info-item full-width">
                  <label>Observaciones:</label>
                  <p>{{ factura.observaciones }}</p>
                </div>
                <div class="info-item">
                  <label>Fecha de Cita:</label>
                  <p>{{ factura.cita_fecha | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="info-item">
                  <label>Hora:</label>
                  <p>{{ factura.cita_hora }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Información del Tratamiento -->
          <mat-card class="info-card" *ngIf="factura.tratamiento_desc">
            <mat-card-header>
              <mat-card-title>Tratamiento</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item full-width">
                  <label>Descripción:</label>
                  <p>{{ factura.tratamiento_desc }}</p>
                </div>
                <div class="info-item">
                  <label>Medicamento:</label>
                  <p>{{ factura.medicamento || '-' }}</p>
                </div>
                <div class="info-item">
                  <label>Duración:</label>
                  <p>{{ factura.duracion || '-' }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Información del Veterinario -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>Veterinario</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Nombre:</label>
                  <p>{{ factura.veterinario_nombre }}</p>
                </div>
                <div class="info-item">
                  <label>Especialidad:</label>
                  <p>{{ factura.especialidad }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Acciones -->
          <div class="actions">
            <button mat-raised-button color="primary" (click)="imprimirFactura()">
              <mat-icon>print</mat-icon> Imprimir
            </button>
            <button mat-raised-button (click)="volver()">
              <mat-icon>arrow_back</mat-icon> Volver
            </button>
          </div>
        </div>

        <div *ngIf="!cargando && !factura" class="error-state">
          <mat-icon>error</mat-icon>
          <p>Factura no encontrada</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .factura-container {
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

    .loading, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 20px;
    }

    .error-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ff6b6b;
    }

    .factura-detalle {
      max-width: 900px;
      margin: 0 auto;
    }

    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .factura-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .factura-numero h2 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }

    .fecha {
      margin: 5px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .factura-total {
      text-align: right;
    }

    .factura-total h3 {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .monto {
      margin: 10px 0 0 0;
      font-size: 32px;
      font-weight: bold;
      color: #fff;
    }

    .info-card {
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      margin: -16px -16px 16px -16px;
    }

    mat-card-title {
      color: white;
      font-size: 18px;
      margin: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      display: block;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 5px;
      font-size: 12px;
      text-transform: uppercase;
    }

    .info-item p {
      margin: 0;
      color: #333;
      font-size: 16px;
      word-break: break-word;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 30px;
    }

    button {
      padding: 10px 30px;
    }

    @media (max-width: 600px) {
      .factura-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .factura-total {
        text-align: left;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
    `
  ]
})
export class FacturaDetalleComponent implements OnInit {
  factura: FacturaDetalle | null = null;
  cargando = true;

  constructor(
    private facturaService: FacturaService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarFactura();
  }

  cargarFactura() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/facturas']);
      return;
    }

    this.facturaService.obtenerFactura(parseInt(id)).subscribe({
      next: (data) => {
        this.factura = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar factura:', error);
        this.snackBar.open('Error al cargar factura', 'Cerrar', { duration: 3000 });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver() {
    this.router.navigate(['/facturas']);
  }

  imprimirFactura() {
    window.print();
  }
}
