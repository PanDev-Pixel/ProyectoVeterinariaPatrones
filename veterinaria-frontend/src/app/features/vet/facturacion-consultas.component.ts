import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FacturaService, CrearFacturaData } from '../../core/services/factura.service';
import { CitaVetService } from '../../core/services/cita-vet.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-facturacion-consultas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="facturacion-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/dashboard-vet">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Facturación de Consultas</span>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando consultas...</p>
        </div>

        <div *ngIf="!isLoading && consultasSinFactura.length === 0" class="empty-state">
          <mat-icon>done_all</mat-icon>
          <p>No hay consultas sin facturar</p>
          <p class="subtitle">Todas tus consultas han sido facturadas</p>
          <button mat-raised-button color="primary" routerLink="/dashboard-vet">
            Volver
          </button>
        </div>

        <div *ngIf="!isLoading && consultasSinFactura.length > 0" class="consultas-grid">
          <mat-card 
            *ngFor="let consulta of consultasSinFactura" 
            class="consulta-card"
            [class.expanded]="consultaSeleccionada?.id === consulta.id"
          >
            <mat-card-header (click)="seleccionarConsulta(consulta)">
              <mat-card-title>
                {{ consulta.mascota_nombre }}
              </mat-card-title>
              <mat-card-subtitle>
                Diagnóstico: {{ consulta.diagnostico }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content *ngIf="consultaSeleccionada?.id === consulta.id">
              <div class="consulta-info">
                <p><strong>Mascota:</strong> {{ consulta.mascota_nombre }}</p>
                <p><strong>Diagnóstico:</strong> {{ consulta.diagnostico }}</p>
                <p><strong>Observaciones:</strong> {{ consulta.observaciones }}</p>
                <p *ngIf="consulta.tratamiento">
                  <strong>Tratamiento:</strong> {{ consulta.tratamiento }}
                </p>
                <p *ngIf="consulta.medicamento">
                  <strong>Medicamento:</strong> {{ consulta.medicamento }}
                </p>
                <p *ngIf="consulta.duracion">
                  <strong>Duración:</strong> {{ consulta.duracion }}
                </p>
                <p><strong>Fecha Cita:</strong> {{ consulta.fecha_cita | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>

              <form [formGroup]="facturaForm" class="factura-form">
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Monto Total ($)*</mat-label>
                  <input 
                    matInput 
                    type="number" 
                    formControlName="total" 
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="Ej: 75.00"
                  >
                </mat-form-field>

                <div class="form-actions">
                  <button 
                    mat-raised-button 
                    color="primary"
                    (click)="generarFactura(consulta)"
                    [disabled]="!facturaForm.valid || generando"
                  >
                    <mat-icon>receipt</mat-icon>
                    {{ generando ? 'Generando...' : 'Generar Factura' }}
                  </button>
                  <button 
                    mat-button 
                    type="button"
                    (click)="limpiar()"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </mat-card-content>

            <mat-card-actions *ngIf="consultaSeleccionada?.id !== consulta.id">
              <button mat-button (click)="seleccionarConsulta(consulta)">
                <mat-icon>edit</mat-icon> Facturar
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .facturacion-container {
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
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #999;
    }

    .empty-state .subtitle {
      color: #999;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .consultas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .consulta-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .consulta-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .consulta-card.expanded {
      grid-column: span 1;
    }

    mat-card-header {
      cursor: pointer;
      padding: 16px;
      user-select: none;
    }

    .consulta-info {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .consulta-info p {
      margin: 6px 0;
      font-size: 13px;
      line-height: 1.5;
    }

    .factura-form {
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .form-actions button {
      flex: 1;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class FacturacionConsultasComponent implements OnInit {
  consultasSinFactura: any[] = [];
  consultaSeleccionada: any = null;
  facturaForm: FormGroup;
  isLoading = true;
  generando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private facturaService: FacturaService,
    private citaVetService: CitaVetService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.facturaForm = this.fb.group({
      total: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.cargarConsultasSinFactura();
  }

  cargarConsultasSinFactura() {
    this.isLoading = true;
    // Nota: Aquí se cargarían las consultas sin factura del servidor
    // Por ahora, es un placeholder
    this.ngZone.run(() => {
      this.consultasSinFactura = [];
      this.isLoading = false;
      this.snackBar.open(
        'ℹ️ Las consultas aparecerán aquí después de registrarlas',
        'Ok',
        { duration: 3000 }
      );
      this.cdr.detectChanges();
    });
  }

  seleccionarConsulta(consulta: any) {
    this.ngZone.run(() => {
      this.consultaSeleccionada = this.consultaSeleccionada?.id === consulta.id ? null : consulta;
      this.facturaForm.reset();
      this.cdr.detectChanges();
    });
  }

  generarFactura(consulta: any) {
    if (this.facturaForm.invalid) return;

    this.generando = true;
    const datos: CrearFacturaData = {
      id_consulta: consulta.id,
      id_tratamiento: consulta.id_tratamiento || null,
      total: parseFloat(this.facturaForm.get('total')?.value)
    };

    this.facturaService.crearFactura(datos).subscribe({
      next: (factura) => {
        this.ngZone.run(() => {
          this.generando = false;
          this.snackBar.open('✅ Factura generada exitosamente', 'Ver', {
            duration: 3000
          }).onAction().subscribe(() => {
            this.router.navigate(['/facturas', factura.id]);
          });
          this.limpiar();
          this.cargarConsultasSinFactura();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.generando = false;
          console.error('Error al generar factura:', error);
          this.snackBar.open(
            error.error?.mensaje || 'Error al generar factura',
            'Cerrar',
            { duration: 3000 }
          );
          this.cdr.detectChanges();
        });
      }
    });
  }

  limpiar() {
    this.ngZone.run(() => {
      this.consultaSeleccionada = null;
      this.facturaForm.reset();
      this.cdr.detectChanges();
    });
  }
}
