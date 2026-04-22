import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MascotaService, Mascota } from '../../core/services/mascota.service';
import { CitaService } from '../../core/services/cita.service';
import { MascotaVetService, MascotaVet } from '../../core/services/mascota-vet.service';
import { VeterinarioService, Veterinario } from '../../core/services/veterinario.service';
import { NgZone } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-crear-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="cita-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/mascotas">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Agendar Nueva Cita</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Formulario de Cita</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="citaForm">
              <!-- MASCOTA -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Seleccionar Mascota *</mat-label>
                <mat-select formControlName="id_mascota" (selectionChange)="onMascotaChange()">
                  <mat-option *ngFor="let mascota of mascotas" [value]="mascota.id">
                    {{ mascota.nombre }} ({{ mascota.especie }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="citaForm.get('id_mascota')?.hasError('required')">
                  Selecciona una mascota
                </mat-error>
              </mat-form-field>

              <!-- VETERINARIO -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Seleccionar Veterinario *</mat-label>
                <mat-select formControlName="id_veterinario" (selectionChange)="onVeterinarioChange()">
                  <mat-option *ngFor="let vet of veterinarios" [value]="vet.id">
                    Dr/a. {{ vet.nombre }} - {{ vet.especialidad }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="citaForm.get('id_veterinario')?.hasError('required')">
                  Selecciona un veterinario
                </mat-error>
              </mat-form-field>

              <!-- FECHA -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Seleccionar Fecha *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="fecha" 
                       (dateChange)="onFechaChange($event)" readonly>
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="citaForm.get('fecha')?.hasError('required')">
                  Selecciona una fecha
                </mat-error>
              </mat-form-field>

              <!-- HORARIO -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Seleccionar Horario *</mat-label>
                <mat-select formControlName="hora" [disabled]="horariosDisponibles.length === 0">
                  <mat-option *ngFor="let horario of horariosDisponibles" [value]="horario">
                    {{ horario }}
                  </mat-option>
                </mat-select>
                <mat-hint *ngIf="horariosDisponibles.length === 0">
                  Selecciona fecha y veterinario para ver horarios disponibles
                </mat-hint>
                <mat-error *ngIf="citaForm.get('hora')?.hasError('required')">
                  Selecciona un horario
                </mat-error>
              </mat-form-field>

              <!-- CARGANDO HORARIOS -->
              <div *ngIf="cargandoHorarios" class="loading-horarios">
                <mat-spinner diameter="30"></mat-spinner>
                <p>Cargando horarios disponibles...</p>
              </div>

              <!-- INFORMACIÓN DE DISPONIBILIDAD -->
              <div *ngIf="!cargandoHorarios && horariosDisponibles.length > 0" class="info-horarios">
                <mat-icon>check_circle</mat-icon>
                <p>{{ horariosDisponibles.length }} horarios disponibles</p>
              </div>

              <!-- BOTONES DE ACCIÓN -->
              <div class="form-actions">
                <button mat-raised-button color="primary" 
                        (click)="crearCita()" 
                        [disabled]="!citaForm.valid || cargandoHorarios || guardando">
                  <mat-icon>event</mat-icon> 
                  {{ guardando ? 'Creando cita...' : 'Agendar Cita' }}
                </button>
                <button mat-button routerLink="/mascotas">Cancelar</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .cita-container {
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
      overflow-y: auto;
    }

    .form-card {
      width: 100%;
      max-width: 600px;
      margin-top: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .form-actions button {
      flex: 1;
    }

    .loading-horarios {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
      margin: 15px 0;
    }

    .loading-horarios p {
      margin: 0;
      color: #1976d2;
    }

    .info-horarios {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #c8e6c9;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #4caf50;
    }

    .info-horarios mat-icon {
      color: #4caf50;
    }

    .info-horarios p {
      margin: 0;
      color: #2e7d32;
      font-weight: 500;
    }
  `]
})
export class CrearCitaComponent implements OnInit, OnDestroy {
  citaForm: FormGroup;
  mascotas: Mascota[] = [];
  veterinarios: Veterinario[] = [];
  horariosDisponibles: string[] = [];
  cargandoHorarios = false;
  guardando = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mascotaService: MascotaService,
    private citaService: CitaService,
    private mascotaVetService: MascotaVetService,
    private veterinarioService: VeterinarioService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.citaForm = this.fb.group({
      id_mascota: ['', Validators.required],
      id_veterinario: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarMascotas();
    this.cargarVeterinarios();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarMascotas() {
    this.mascotaService.obtenerMascotas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mascotas) => {
          this.ngZone.run(() => {
            this.mascotas = mascotas;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Error al cargar mascotas:', error);
            this.snackBar.open(
              error.error?.mensaje || 'Error al cargar mascotas',
              'Cerrar',
              { duration: 3000 }
            );
          });
        }
      });
  }

  cargarVeterinarios() {
    this.veterinarioService.obtenerVeterinarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (veterinarios) => {
          this.ngZone.run(() => {
            this.veterinarios = veterinarios;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Error al cargar veterinarios:', error);
            this.snackBar.open(
              error.error?.mensaje || 'Error al cargar veterinarios',
              'Cerrar',
              { duration: 3000 }
            );
          });
        }
      });
  }

  onMascotaChange() {
    this.horariosDisponibles = [];
    this.citaForm.patchValue({ hora: '' });
    this.verificarHorariosDisponibles();
  }

  onVeterinarioChange() {
    this.horariosDisponibles = [];
    this.citaForm.patchValue({ hora: '' });
    this.verificarHorariosDisponibles();
  }

  onFechaChange(event: any) {
    this.horariosDisponibles = [];
    this.citaForm.patchValue({ hora: '' });
    this.verificarHorariosDisponibles();
  }

  verificarHorariosDisponibles() {
    const veterinarioId = this.citaForm.get('id_veterinario')?.value;
    const fecha = this.citaForm.get('fecha')?.value;

    if (!veterinarioId || !fecha) {
      return;
    }

    // Convertir fecha a formato YYYY-MM-DD
    const fechaFormato = this.formatearFecha(fecha);

    this.cargandoHorarios = true;
    this.citaService.obtenerHorariosDisponibles(veterinarioId, fechaFormato)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          this.ngZone.run(() => {
            this.horariosDisponibles = respuesta.horarios_disponibles;
            this.cargandoHorarios = false;
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Error al obtener horarios:', error);
            this.cargandoHorarios = false;
            this.horariosDisponibles = [];
            this.snackBar.open(
              error.error?.mensaje || 'Error al cargar horarios disponibles',
              'Cerrar',
              { duration: 3000 }
            );
            this.cdr.detectChanges();
          });
        }
      });
  }

  private formatearFecha(fecha: Date | string): string {
    const f = new Date(fecha);
    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');
    const day = String(f.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  crearCita() {
    if (!this.citaForm.valid) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar que la fecha no sea del pasado
    const fechaSeleccionada = new Date(this.citaForm.get('fecha')?.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      this.snackBar.open('La fecha no puede ser en el pasado', 'Cerrar', { duration: 3000 });
      return;
    }

    this.guardando = true;
    const formData = this.citaForm.value;
    formData.fecha = this.formatearFecha(formData.fecha);

    this.citaService.crearCita(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.snackBar.open('✅ Cita agendada exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/mascotas']);
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Error al crear cita:', error);
            this.guardando = false;
            this.cdr.detectChanges();
            this.snackBar.open(
              error.error?.mensaje || 'Error al agendar cita',
              'Cerrar',
              { duration: 3000 }
            );
          });
        }
      });
  }
}