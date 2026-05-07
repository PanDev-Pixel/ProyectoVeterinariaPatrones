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
  selector: 'app-login',
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
    <div class="login-container">
      <mat-toolbar color="primary">
        <span>Clínica Veterinaria - Login</span>
      </mat-toolbar>

      <div class="login-content">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Iniciar Sesión</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm">
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput type="password" formControlName="contraseña" required>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" (click)="login()" [disabled]="!loginForm.valid || isLoading">
                  <span *ngIf="!isLoading">Iniciar Sesión</span>
                  <span *ngIf="isLoading">
                    <mat-spinner diameter="20"></mat-spinner> Cargando...
                  </span>
                </button>
              </div>

              <p class="register-prompt">
                ¿No tienes cuenta? <a routerLink="/registro">Regístrate aquí</a>
              </p>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
    }

    .login-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 20px;
      background: transparent;
      min-height: calc(100vh - 64px);
    }

    mat-card {
      width: 100%;
      max-width: 450px;
      padding: 40px;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #4a90e2;
      box-shadow: 0 8px 30px rgba(74, 144, 226, 0.15);
    }

    mat-card-title {
      color: #4a4a4a;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 1.8rem;
      text-align: center;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    mat-form-field {
      margin-bottom: 24px;
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
      margin-top: 30px;
      display: flex;
      gap: 10px;
    }

    .form-actions button {
      width: 100%;
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

    .form-actions button:disabled {
      background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
      color: #999999;
      transform: none;
      box-shadow: none;
    }

    .register-prompt {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #666666;
      font-family: 'Inter', sans-serif;
    }

    .register-prompt a {
      color: #4a90e2;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .register-prompt a:hover {
      color: #2196f3;
      text-decoration: underline;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 10px;
    }

    mat-spinner circle {
      stroke: #4a90e2;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.authService.setToken(response.token);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Sesión iniciada correctamente', 'Cerrar', { duration: 3000 });
          if (response.usuario.rol === 'veterinario') {
            this.router.navigate(['/dashboard-vet']);
          } else {
            this.router.navigate(['/dashboard']);
          } 
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open(
            error.error?.mensaje || 'Error al iniciar sesión',
            'Cerrar',
            { duration: 3000 }
          );
        });
      }
    });
  }
}
