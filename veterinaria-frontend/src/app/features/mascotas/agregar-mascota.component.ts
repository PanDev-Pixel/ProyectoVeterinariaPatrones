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
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .form-card {
      width: 100%;
      max-width: 500px;
      margin-top: 20px;
    }

    mat-form-field {
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
