import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { Subject, takeUntil } from 'rxjs';

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
                <mat-error *ngIf="registerForm.get('nombre')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
                <mat-error *ngIf="registerForm.get('nombre')?.hasError('minlength')">
                  El nombre debe tener al menos 3 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  El email es requerido
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Ingresa un email válido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Teléfono (ej: 87654321)</mat-label>
                <input matInput formControlName="tel" required>
                <mat-error *ngIf="registerForm.get('tel')?.hasError('required')">
                  El teléfono es requerido
                </mat-error>
                <mat-error *ngIf="registerForm.get('tel')?.hasError('pattern')">
                  Ingresa un teléfono válido (8-15 dígitos)
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>DIC/Cédula (ej: 1-123-45678)</mat-label>
                <input matInput formControlName="dic" required>
                <mat-error *ngIf="registerForm.get('dic')?.hasError('required')">
                  La cédula es requerida
                </mat-error>
                <mat-error *ngIf="registerForm.get('dic')?.hasError('pattern')">
                  Formato: 1-123-45678
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput type="password" formControlName="contraseña" required>
                <mat-error *ngIf="registerForm.get('contraseña')?.hasError('required')">
                  La contraseña es requerida
                </mat-error>
                <mat-error *ngIf="registerForm.get('contraseña')?.hasError('minlength')">
                  La contraseña debe tener al menos 8 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Confirmar Contraseña</mat-label>
                <input matInput type="password" formControlName="confirmarContraseña" required>
                <mat-error *ngIf="registerForm.get('confirmarContraseña')?.hasError('required')">
                  Confirma la contraseña
                </mat-error>
              </mat-form-field>

              <mat-error *ngIf="registerForm.hasError('passwordMismatch')" class="form-error">
                Las contraseñas no coinciden
              </mat-error>

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
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
    }

    .register-content {
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
      max-width: 500px;
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

    mat-error {
      color: #ff6b6b;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
    }

    .form-error {
      color: #ff6b6b;
      font-size: 12px;
      margin: 10px 0;
      display: block;
      font-family: 'Inter', sans-serif;
      background: rgba(255, 107, 107, 0.1);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #ff6b6b;
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

    .login-prompt {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #666666;
      font-family: 'Inter', sans-serif;
    }

    .login-prompt a {
      color: #4a90e2;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .login-prompt a:hover {
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
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

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
      tel: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      dic: ['', [Validators.required, Validators.pattern(/^\d{1,2}-\d{3,4}-\d{1,5}$/)]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContraseña: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('contraseña')?.value;
    const confirmPassword = control.get('confirmarContraseña')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  register() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const { nombre, email, tel, dic, contraseña } = this.registerForm.value;

    this.authService.registro({ nombre, email, tel, dic, contraseña })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.snackBar.open('✅ Registro exitoso. Por favor inicia sesión', 'Cerrar', { duration: 3000 });
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
