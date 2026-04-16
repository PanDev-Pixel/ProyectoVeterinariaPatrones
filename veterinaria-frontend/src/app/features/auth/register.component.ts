import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-toolbar color="primary">
        <span>Clínica Veterinaria - Registro</span>
      </mat-toolbar>

      <div class="register-content">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Crear Cuenta</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Nombre Completo</mat-label>
                <input matInput formControlName="nombre" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="tel" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>DIC/Cédula</mat-label>
                <input matInput formControlName="dic" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput type="password" formControlName="contraseña" required>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" (click)="register()" [disabled]="!registerForm.valid || isLoading">
                  <span *ngIf="!isLoading">Registrarse</span>
                  <span *ngIf="isLoading">
                    <mat-spinner diameter="20"></mat-spinner> Cargando...
                  </span>
                </button>
              </div>

              <p class="login-prompt">
                ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
              </p>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .register-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    mat-card {
      width: 100%;
      max-width: 450px;
      padding: 30px;
      border-radius: 8px;
    }

    mat-form-field {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }

    .form-actions button {
      width: 100%;
    }

    .login-prompt {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .login-prompt a {
      color: #e91e63;
      text-decoration: none;
      font-weight: bold;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 10px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', Validators.required],
      dic: ['', Validators.required],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  register() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.authService.registro(this.registerForm.value).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Registro exitoso. Por favor inicia sesión', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open(
            error.error?.mensaje || 'Error al registrar',
            'Cerrar',
            { duration: 3000 }
          );
        });
      }
    });
  }
}
