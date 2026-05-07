import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-toolbar color="primary">
        <span>Clínica Veterinaria</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="logout()" matTooltip="Cerrar sesión">
          <mat-icon>exit_to_app</mat-icon>
        </button>
      </mat-toolbar>

      <div class="dashboard-content">
        <h1>Bienvenido a tu Dashboard</h1>
        <p>Selecciona una opción para continuar:</p>

        <div class="options-grid">
          <mat-card routerLink="/mascotas" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">pets</mat-icon>
            </mat-card-header>
            <mat-card-title>Mis Mascotas</mat-card-title>
            <mat-card-content>
              <p>Visualiza y gestiona tus mascotas</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Ver Mascotas</button>
            </mat-card-actions>
          </mat-card>

          <mat-card routerLink="/mascotas/add" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">add_circle</mat-icon>
            </mat-card-header>
            <mat-card-title>Agregar Mascota</mat-card-title>
            <mat-card-content>
              <p>Registra una nueva mascota</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Agregar</button>
            </mat-card-actions>
          </mat-card>

          <mat-card routerLink="/citas/crear" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">event</mat-icon>
            </mat-card-header>
            <mat-card-title>Agendar Cita</mat-card-title>
            <mat-card-content>
              <p>Reserva una cita con un veterinario</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Nueva Cita</button>
            </mat-card-actions>
          </mat-card>

          <mat-card routerLink="/citas" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">calendar_today</mat-icon>
            </mat-card-header>
            <mat-card-title>Mis Citas</mat-card-title>
            <mat-card-content>
              <p>Ve el historial de tus citas</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Ver Citas</button>
            </mat-card-actions>
          </mat-card>

          <mat-card routerLink="/facturas" class="option-card">
            <mat-card-header>
              <mat-icon class="large-icon">receipt_long</mat-icon>
            </mat-card-header>
            <mat-card-title>Facturas</mat-card-title>
            <mat-card-content>
              <p>Consulta todas tus facturas</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Ver Facturas</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #f8fafc 100%);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      flex: 1;
      padding: 40px 20px;
      max-width: none;
      margin: 0;
      width: 100%;
      background: transparent;
      min-height: calc(100vh - 64px);
    }

    h1 {
      color: #4a4a4a;
      margin-bottom: 10px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 2.5rem;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      color: #666666;
      margin-bottom: 30px;
      font-family: 'Inter', sans-serif;
      font-size: 1.1rem;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-top: 30px;
      padding: 0;
    }

    .option-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      background: #ffffff;
      border: 1px solid #4a90e2;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(255, 183, 197, 0.15);
      padding: 24px;
      text-align: center;
    }

    .option-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 30px rgba(255, 183, 197, 0.25);
      border-color: #2196f3;
    }

    .large-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #4a90e2;
      margin: 16px 0;
      background: linear-gradient(135deg, #4a90e2 0%, #2196f3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    mat-icon {
      color: #4a90e2;
    }

    mat-card-title {
      color: #4a4a4a;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 1.3rem;
      margin: 16px 0;
    }

    mat-card-content p {
      color: #666666;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      line-height: 1.5;
    }

    button {
      background: linear-gradient(135deg, #4a90e2 0%, #87ceeb 50%, #e3f2fd 100%);
      color: #4a4a4a;
      border: 1px solid #4a90e2;
      font-weight: 500;
      font-family: 'Poppins', sans-serif;
    }

    button:hover {
      background: linear-gradient(135deg, #2196f3 0%, #4a90e2 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar perfil del usuario si es necesario
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
