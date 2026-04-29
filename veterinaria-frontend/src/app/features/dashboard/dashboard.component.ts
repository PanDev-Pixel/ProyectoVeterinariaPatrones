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
          <mat-icon>logout</mat-icon>
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
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      flex: 1;
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    h1 {
      color: #333;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      margin-bottom: 30px;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .option-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .option-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .large-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #e91e63;
      margin: 20px 0;
    }

    mat-icon {
      color: #e91e63;
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
