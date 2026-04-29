import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CitaVetService, CitaVet } from '../../core/services/cita-vet.service';
import { TratamientoService } from '../../core/services/tratamiento.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-consultas-vet',
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
    <div class="consulta-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/dashboard-vet">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Registrar Consulta Médica</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Nueva Consulta</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <!-- Formulario Principal -->
            <div [formGroup]="consultaForm">
              <!-- Seleccionar Cita -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Seleccionar Cita Pendiente</mat-label>
                <mat-select formControlName="citaId" (selectionChange)="onCitaChange($event)">
                  <mat-option *ngFor="let cita of citasPendientes" [value]="cita.id">
                    {{ cita.fecha | date:'dd/MM/yyyy' }} {{ cita.hora }} - {{ cita.mascotaNombre }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="consultaForm.get('citaId')?.hasError('required')">
                  Selecciona una cita
                </mat-error>
              </mat-form-field>

              <div *ngIf="citasPendientes.length === 0 && !cargando" class="empty-state">
                <mat-icon>event_busy</mat-icon>
                <p>No tienes citas pendientes</p>
              </div>

              <mat-spinner *ngIf="cargando" diameter="40" class="spinner"></mat-spinner>

            <!-- Formulario de Consulta -->
            <form *ngIf="citaSeleccionada" [formGroup]="consultaForm">
              <div class="cita-info">
                <p><strong>Paciente:</strong> {{ citaSeleccionada.mascotaNombre }}</p>
                <p><strong>Fecha:</strong> {{ citaSeleccionada.fecha | date:'longDate' }}</p>
                <p><strong>Hora:</strong> {{ citaSeleccionada.hora }}</p>
              </div>

                <!-- Diagnóstico -->
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Diagnóstico *</mat-label>
                  <mat-select formControlName="diagnostico">
                    <mat-option value="Gastroenteritis">Gastroenteritis</mat-option>
                    <mat-option value="Infección respiratoria">Infección respiratoria</mat-option>
                    <mat-option value="Dermatitis">Dermatitis</mat-option>
                    <mat-option value="Otitis">Otitis</mat-option>
                    <mat-option value="Parásitos">Parásitos</mat-option>
                    <mat-option value="Revisión general">Revisión general</mat-option>
                    <mat-option value="Vacunación">Vacunación</mat-option>
                    <mat-option value="Otro">Otro</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Observaciones -->
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Observaciones *</mat-label>
                  <textarea matInput formControlName="observaciones" rows="3" required></textarea>
                </mat-form-field>

                <!-- Tratamiento -->
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Tratamiento recomendado</mat-label>
                  <textarea matInput formControlName="tratamiento" rows="2"></textarea>
                </mat-form-field>

                <!-- Medicamento -->
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Medicamento</mat-label>
                  <input matInput formControlName="medicamento" placeholder="Ej: Amoxicilina 500mg">
                </mat-form-field>

              <!-- Duración -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Duración del tratamiento</mat-label>
                <input matInput formControlName="duracion" placeholder="Ej: 7 días">
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" 
                        (click)="guardarConsulta()" 
                        [disabled]="!consultaForm.valid || guardando">
                  <mat-icon>save</mat-icon> 
                  {{ guardando ? 'Guardando...' : 'Guardar Consulta' }}
                </button>
                <button mat-button routerLink="/dashboard-vet">Cancelar</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .consulta-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content {
      flex: 1;
      padding: 30px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .form-card {
      width: 100%;
      max-width: 700px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .cita-info {
      background-color: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #1976d2;
    }

    .cita-info p {
      margin: 5px 0;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .form-actions button {
      flex: 1;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 15px;
    }

    .spinner {
      margin: 20px auto;
    }
  `]
})
export class ConsultasVetComponent implements OnInit {
  consultaForm: FormGroup;
  citasPendientes: CitaVet[] = [];
  citaSeleccionada: CitaVet | null = null;
  cargando = true;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private citaVetService: CitaVetService,
    private tratamientoService: TratamientoService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.consultaForm = this.fb.group({
      citaId: ['', Validators.required],
      diagnostico: ['', Validators.required],
      observaciones: ['', Validators.required],
      tratamiento: [''],
      medicamento: [''],
      duracion: [''],
      precio: ['']
    });
  }

  ngOnInit() {
    this.cargarCitasPendientes();
  }

  onCitaChange(event?: any) {
    const citaId = this.consultaForm.get('citaId')?.value;
    console.log('🔍 onCitaChange disparado');
    console.log('Cambio de cita - citaId recibido:', citaId, 'tipo:', typeof citaId);
    console.log('Citas pendientes disponibles:', this.citasPendientes);
    
    if (citaId) {
      const citaIdNumber = typeof citaId === 'string' ? parseInt(citaId, 10) : citaId;
      console.log('Buscando cita con ID:', citaIdNumber);
      const cita = this.citasPendientes.find(c => {
        console.log('Comparando:', c.id, '===', citaIdNumber, '?', c.id === citaIdNumber);
        return c.id === citaIdNumber;
      });
      this.citaSeleccionada = cita || null;
      console.log('✅ Cita seleccionada:', this.citaSeleccionada);
      this.cdr.detectChanges();
    } else {
      this.citaSeleccionada = null;
      console.log('❌ No hay cita seleccionada');
      this.cdr.detectChanges();
    }
  }

  private actualizarCitaSeleccionada(citaId: any) {
    if (citaId) {
      const cita = this.citasPendientes.find(c => c.id === parseInt(citaId));
      this.citaSeleccionada = cita || null;
      console.log('Cita seleccionada:', this.citaSeleccionada);
      this.cdr.markForCheck();
    } else {
      this.citaSeleccionada = null;
      this.cdr.markForCheck();
    }
  }

  cargarCitasPendientes() {
    this.cargando = true;
    this.citaVetService.obtenerCitas().subscribe({
      next: (citas) => {
        this.ngZone.run(() => {
          console.log('Citas obtenidas:', citas);
          this.citasPendientes = citas.filter(c => 
            c.estado === 'pendiente' || c.estado === 'confirmada'
          );
          console.log('Citas pendientes filtradas:', this.citasPendientes);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error al cargar citas:', error);
          this.cargando = false;
          this.snackBar.open('Error al cargar citas', 'Cerrar', { duration: 3000 });
          this.cdr.detectChanges();
        });
      }
    });
  }

  onCitaChange() {
    const citaId = this.consultaForm.get('citaId')?.value;
    this.citaSeleccionada = this.citasPendientes.find(c => c.id === citaId) || null;
  }

  guardarConsulta() {
    if (!this.citaSeleccionada || this.consultaForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.guardando = true;
    const formData = this.consultaForm.value;
    
    console.log('📋 guardarConsulta iniciado');
    console.log('formData:', formData);
    console.log('¿Hay tratamiento?:', !!formData.tratamiento);

    // Si hay tratamiento, crearlo primero
    if (formData.tratamiento) {
      this.tratamientoService.crearTratamiento({
        descripcion: formData.tratamiento,
        medicamento: formData.medicamento,
        duracion: formData.duracion
      }).subscribe({
        next: (tratamiento) => {
          this.registrarConsulta(tratamiento.id);
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('❌ Error al crear tratamiento:', error);
            this.guardando = false;
            this.cdr.detectChanges();
            this.snackBar.open('Error al crear tratamiento', 'Cerrar', { duration: 3000 });
          });
        }
      });
    } else {
      this.registrarConsulta(null);
    }
  }

  private registrarConsulta(idTratamiento: number | null) {
    const formData = this.consultaForm.value;
    
    this.citaVetService.registrarConsulta(this.citaSeleccionada!.id, {
      diagnostico: formData.diagnostico,
      observaciones: formData.observaciones,
      id_tratamiento: idTratamiento
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          console.log('✅ Consulta registrada exitosamente');
          this.guardando = false;
          console.log('✅ Consulta registrada exitosamente');
          this.snackBar.open('✅ Consulta registrada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard-vet']);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('❌ Error al registrar consulta:', error);
          this.guardando = false;
          this.cdr.detectChanges();
          this.snackBar.open(
            error.error?.mensaje || 'Error al registrar consulta',
            'Cerrar',
            { duration: 3000 }
          );
        });
      }
    });
  }
}