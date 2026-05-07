import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CitaService, Cita } from '../../core/services/cita.service';
import { MascotaService, Mascota } from '../../core/services/mascota.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-editar-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="editar-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Editar Cita</span>
        <span class="spacer"></span>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="isLoading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Cargando datos de la cita...</p>
        </div>

        <div *ngIf="!isLoading && cita" class="form-card">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Editar Cita para {{ cita.mascota }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="citaForm" (ngSubmit)="actualizarCita()">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mascota</mat-label>
                    <mat-select formControlName="mascota_id" required>
                      <mat-option *ngFor="let mascota of mascotas" [value]="mascota.id">
                        {{ mascota.nombre }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="citaForm.get('mascota_id')?.hasError('required')">
                      La mascota es requerida
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Fecha</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="fecha" required>
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error *ngIf="citaForm.get('fecha')?.hasError('required')">
                      La fecha es requerida
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Hora</mat-label>
                    <mat-select formControlName="hora" required>
                      <mat-option *ngFor="let hora of horasDisponibles" [value]="hora">
                        {{ hora }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="citaForm.get('hora')?.hasError('required')">
                      La hora es requerida
                    </mat-error>
                  </mat-form-field>
                </div>

                
                <div class="form-actions">
                  <button mat-raised-button color="primary" 
                          type="submit" 
                          [disabled]="!citaForm.valid || guardando">
                    <mat-icon>save</mat-icon> 
                    {{ guardando ? 'Actualizando...' : 'Actualizar Cita' }}
                  </button>
                  <button mat-button type="button" (click)="goBack()">
                    <mat-icon>cancel</mat-icon> Cancelar
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <div *ngIf="!isLoading && !cita" class="error-state">
          <mat-icon>error</mat-icon>
          <p>No se encontró la cita</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Volver
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editar-container {
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
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .form-card {
      width: 100%;
      max-width: 600px;
      margin-top: 20px;
    }

    .loading, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 20px;
      color: #666;
    }

    .loading mat-icon, .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }

    .error-state mat-icon {
      color: #f44336;
    }

    .form-row {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .form-actions button {
      flex: 1;
    }

    mat-card-title {
      color: #4a4a4a;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
    }

    mat-form-field {
      font-family: 'Inter', sans-serif;
    }

    mat-form-field.mat-mdc-form-field {
      --mat-mdc-form-field-focus-color: #4a90e2;
    }

    mat-form-field.mat-mdc-form-field .mat-mdc-text-field-wrapper {
      border: 2px solid #4a90e2;
      border-radius: 8px;
    }

    mat-form-field.mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      border-color: #2196f3;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .form-actions button[type="submit"] {
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 50%, #e3f2fd 100%);
      color: #4a4a4a;
      border: 1px solid #4a90e2;
      font-weight: 500;
      font-family: 'Poppins', sans-serif;
    }

    .form-actions button[type="submit"]:hover {
      background: linear-gradient(135deg, #2196f3 0%, #4a90e2 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
    }
  `]
})
export class EditarCitaComponent implements OnInit, OnDestroy {
  citaForm: FormGroup;
  cita: Cita | null = null;
  citaId: number | null = null;
  mascotas: Mascota[] = [];
  isLoading = true;
  guardando = false;
  horasDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.citaForm = this.fb.group({
      mascota_id: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('Inicializando EditarCitaComponent');
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID obtenido de la ruta:', id);
    
    if (id) {
      const idNumerico = parseInt(id);
      console.log('ID convertido a número:', idNumerico);
      
      if (!isNaN(idNumerico)) {
        this.citaId = idNumerico;
        this.cargarMascotas();
      } else {
        console.error('ID no es un número válido:', id);
        this.snackBar.open('ID de cita no válido', 'Cerrar', { duration: 3000 });
        this.goBack();
      }
    } else {
      console.error('No se encontró ID en la ruta');
      this.snackBar.open('ID de cita no válido', 'Cerrar', { duration: 3000 });
      this.goBack();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCita(id: number) {
    console.log('Cargando cita con ID:', id);
    this.citaService.obtenerCita(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cita) => {
          console.log('Cita recibida:', cita);
          this.cita = cita;
          
          // Buscar el ID de la mascota por nombre si no viene mascota_id
          let mascotaId: number | null = cita.mascota_id ? Number(cita.mascota_id) : null;
          if (!mascotaId && this.mascotas.length > 0) {
            const mascotaEncontrada = this.mascotas.find(m => m.nombre === cita.mascota);
            if (mascotaEncontrada) {
              mascotaId = Number(mascotaEncontrada.id);
            }
          }
          
          // Asegurarnos de que tengamos un valor válido para el formulario
          const finalMascotaId = mascotaId && mascotaId > 0 ? mascotaId : 0;
          
          this.citaForm.patchValue({
            mascota_id: finalMascotaId,
            fecha: new Date(cita.fecha),
            hora: cita.hora.split(':').slice(0, 2).join(':') // Formatear hora a HH:MM
          });
          console.log('Formulario actualizado:', this.citaForm.value);
          console.log('Poniendo isLoading en false...');
          this.isLoading = false;
          console.log('isLoading actual:', this.isLoading);
          
          // Forzar detección de cambios con ChangeDetectorRef
          this.cdr.detectChanges();
          console.log('Detección de cambios forzada');
          
          // Doble seguridad con setTimeout
          setTimeout(() => {
            console.log('Verificando isLoading en timeout:', this.isLoading);
            if (this.isLoading) {
              console.log('Forzando isLoading a false en timeout');
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          }, 100);
        },
        error: (error) => {
          console.error('Error al cargar cita:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          this.snackBar.open(
            error.error?.mensaje || 'Error al cargar la cita', 
            'Cerrar', 
            { duration: 3000 }
          );
          this.isLoading = false;
          // Si hay error, regresar después de 2 segundos
          setTimeout(() => {
            this.goBack();
          }, 2000);
        }
      });
  }

  cargarMascotas() {
    console.log('Cargando mascotas...');
    this.mascotaService.obtenerMascotas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mascotas) => {
          console.log('Mascotas recibidas:', mascotas);
          this.mascotas = mascotas;
          // Ahora que tenemos las mascotas, cargar la cita
          if (this.citaId) {
            this.cargarCita(this.citaId);
          }
        },
        error: (error) => {
          console.error('Error al cargar mascotas:', error);
          console.error('Status:', error.status);
          this.snackBar.open(
            error.error?.mensaje || 'Error al cargar las mascotas', 
            'Cerrar', 
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      });
  }

  actualizarCita() {
    if (this.citaForm.valid && this.cita) {
      this.guardando = true;
      
      const formData = this.citaForm.value;
      const citaActualizada = {
        id_mascota: formData.mascota_id,
        id_veterinario: 1, // Necesitarás obtener esto de la cita original o del formulario
        fecha: formData.fecha.toISOString().split('T')[0],
        hora: formData.hora
      };

      this.citaService.actualizarCita(this.cita.id, citaActualizada)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('✅ Cita actualizada exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/citas']);
          },
          error: (error) => {
            console.error('Error al actualizar cita:', error);
            this.snackBar.open(
              error.error?.mensaje || 'Error al actualizar la cita',
              'Cerrar',
              { duration: 3000 }
            );
            this.guardando = false;
          }
        });
    }
  }

  goBack() {
    this.router.navigate(['/citas']);
  }
}
