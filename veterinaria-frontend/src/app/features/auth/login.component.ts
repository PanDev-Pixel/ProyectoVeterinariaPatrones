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
    }

    .login-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    mat-card {
      width: 100%;
      max-width: 400px;
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

    .register-prompt {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .register-prompt a {
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
          this.router.navigate(['/dashboard']);
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
