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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FacturaService } from '../../core/services/factura.service';
import { ConsultaService } from '../../core/services/consulta.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-generar-factura',
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
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="factura-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/dashboard-vet">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Generar Factura</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Nueva Factura de Consulta</mat-card-title>
            <mat-card-subtitle>Registra el cobro de una consulta</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="facturaForm">
              <!-- Información: Mostrar últimas consultas sin factura -->
              <div class="info-section">
                <p>
                  <strong>Nota:</strong> Aquí puedes generar facturas por las consultas 
                  que has registrado.
                </p>
              </div>

              <!-- Nota explicativa -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Descripción de la factura (opcional)</mat-label>
                <textarea 
                  matInput 
                  formControlName="descripcion" 
                  rows="3"
                  placeholder="Ej: Consulta por dolor abdominal en canino"
                ></textarea>
              </mat-form-field>

              <!-- Monto total -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Monto Total ($)*</mat-label>
                <input 
                  matInput 
                  type="number" 
                  formControlName="total" 
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                >
              </mat-form-field>

              <!-- Información de guía de precios -->
              <div class="pricing-info">
                <mat-icon>info</mat-icon>
                <div>
                  <strong>Guía de precios sugeridos:</strong>
                  <ul>
                    <li>Consulta general: $50 - $100</li>
                    <li>Consulta con examen: $80 - $150</li>
                    <li>Consulta con receta: $100 - $200</li>
                  </ul>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="generarFactura()"
                  [disabled]="!facturaForm.valid || generando"
                >
                  <mat-icon>receipt</mat-icon> 
                  {{ generando ? 'Generando...' : 'Generar Factura' }}
                </button>
                <button mat-button routerLink="/dashboard-vet">
                  Cancelar
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Nota sobre facturas sin consulta -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>¿Cómo funciona la facturación?</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ol>
              <li>Registra una <strong>consulta</strong> desde "Registrar Consulta Médica"</li>
              <li>La consulta se vincula automáticamente a la cita del paciente</li>
              <li>Accede a "Generar Factura" para cobrar por la consulta</li>
              <li>Establece el monto y genera la factura</li>
              <li>El usuario podrá descargar su factura desde su cuenta</li>
            </ol>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
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
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .form-card {
      width: 100%;
      max-width: 600px;
    }

    .info-card {
      width: 100%;
      max-width: 600px;
      background: #f0f4f8;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .info-section {
      background-color: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #1976d2;
    }

    .info-section p {
      margin: 0;
      font-size: 14px;
    }

    .pricing-info {
      display: flex;
      gap: 12px;
      background-color: #fff3e0;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #f57c00;
    }

    .pricing-info mat-icon {
      color: #f57c00;
      flex-shrink: 0;
    }

    .pricing-info ul {
      margin: 8px 0;
      padding-left: 20px;
      font-size: 13px;
    }

    .pricing-info li {
      margin: 4px 0;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .form-actions button {
      flex: 1;
    }

    mat-card-content ol {
      margin: 0;
      padding-left: 20px;
    }

    mat-card-content li {
      margin: 8px 0;
      line-height: 1.6;
    }
  `]
})
export class GenerarFacturaComponent implements OnInit {
  facturaForm: FormGroup;
  generando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private facturaService: FacturaService,
    private consultaService: ConsultaService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.facturaForm = this.fb.group({
      descripcion: [''],
      total: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    // En una versión futura, aquí podríamos cargar las últimas consultas sin factura
  }

  generarFactura() {
    if (this.facturaForm.invalid) return;

    this.generando = true;
    const formData = this.facturaForm.value;

    // TODO: Aquí se implementaría lógica para asociar la factura a una consulta específica
    // Por ahora, es solo un formulario de demostración
    
    this.ngZone.run(() => {
      this.snackBar.open(
        '⚠️ Por favor completa el registro de consulta primero en "Registrar Consulta Médica"',
        'Ok',
        { duration: 4000 }
      );
      this.generando = false;
      this.cdr.detectChanges();
    });
  }
}
