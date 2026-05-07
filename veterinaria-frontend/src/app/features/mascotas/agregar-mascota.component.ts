import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MascotaService } from '../../core/services/mascota.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-agregar-mascota',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div class="agregar-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Agregar Nueva Mascota</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Registro de Mascota</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="mascotaForm">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Nombre de la Mascota</mat-label>
                <input matInput formControlName="nombre" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Especie</mat-label>
                <mat-select formControlName="especie" required>
                  <mat-option value="Perro">Perro</mat-option>
                  <mat-option value="Gato">Gato</mat-option>
                  <mat-option value="Conejo">Conejo</mat-option>
                  <mat-option value="Hamster">Hamster</mat-option>
                  <mat-option value="Loro">Loro</mat-option>
                  <mat-option value="Tortuga">Tortuga</mat-option>
                  <mat-option value="Otro">Otro</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Raza</mat-label>
                <input matInput formControlName="raza" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Edad (años)</mat-label>
                <input matInput type="number" formControlName="edad" required>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" (click)="guardar()" [disabled]="!mascotaForm.valid || isLoading">
                  <mat-icon>save</mat-icon> Guardar Mascota
                </button>
                <button mat-button (click)="goBack()">
                  Cancelar
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .agregar-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content {
      flex: 1;
      padding: 30px 20px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
      min-height: calc(100vh - 64px);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .form-card {
      width: 100%;
      max-width: 500px;
      margin-top: 20px;
      background: #ffffff;
      border: 1px solid #4a90e2;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(255, 183, 197, 0.15);
      padding: 40px;
    }

    mat-card-title {
      color: #4a4a4a;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 1.5rem;
      text-align: center;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    mat-form-field {
      margin-bottom: 20px;
      font-family: 'Inter', sans-serif;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field.mat-mdc-form-field {
      --mat-mdc-form-field-container-color: #ffffff;
      --mat-mdc-form-field-focus-color: #4a90e2;
    }

    mat-form-field.mat-mdc-form-field .mat-mdc-text-field-wrapper {
      background-color: #ffffff;
      border: 2px solid #4a90e2;
      border-radius: 8px;
    }

    mat-form-field.mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      border-color: #2196f3;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    mat-label {
      color: #666666;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }

    mat-input {
      font-family: 'Inter', sans-serif;
      color: #4a4a4a;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .form-actions button {
      flex: 1;
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 50%, #e3f2fd 100%);
      color: #4a4a4a;
      border: 1px solid #4a90e2;
      font-weight: 500;
      font-family: 'Poppins', sans-serif;
      padding: 12px 24px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .form-actions button:hover {
      background: linear-gradient(135deg, #2196f3 0%, #4a90e2 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
    }
  `]
})
export class AgregarMascotaComponent {
  mascotaForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private mascotaService: MascotaService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.mascotaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]]
    });
  }

  guardar() {
    if (this.mascotaForm.invalid) return;

    this.isLoading = true;
    this.mascotaService.crearMascota(this.mascotaForm.value).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Mascota registrada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/mascotas']);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open(
            error.error?.mensaje || 'Error al registrar mascota',
            'Cerrar',
            { duration: 3000 }
          );
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/mascotas']);
  }
}
