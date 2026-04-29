import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FacturaService, Factura } from '../../core/services/factura.service';

@Component({
  selector: 'app-lista-facturas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="facturas-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/dashboard">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Mis Facturas</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="facturas-card">
          <mat-card-header>
            <mat-card-title>Historial de Facturas</mat-card-title>
            <mat-card-subtitle>Consulta todas tus facturas aquí</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div *ngIf="cargando" class="loading">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Cargando facturas...</p>
            </div>

            <div *ngIf="!cargando && facturas.length === 0" class="empty-state">
              <mat-icon>receipt_long</mat-icon>
              <p>No tienes facturas registradas</p>
            </div>

            <div *ngIf="!cargando && facturas.length > 0" class="facturas-list">
              <table mat-table [dataSource]="facturas" class="facturas-table">
                <!-- Columna ID -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let element">{{ element.id }}</td>
                </ng-container>

                <!-- Columna Fecha -->
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let element">{{ element.fecha | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <!-- Columna Mascota -->
                <ng-container matColumnDef="mascota">
                  <th mat-header-cell *matHeaderCellDef>Mascota</th>
                  <td mat-cell *matCellDef="let element">{{ element.mascota }}</td>
                </ng-container>

                <!-- Columna Tratamiento -->
                <ng-container matColumnDef="tratamiento">
                  <th mat-header-cell *matHeaderCellDef>Tratamiento</th>
                  <td mat-cell *matCellDef="let element">{{ element.tratamiento || '-' }}</td>
                </ng-container>

                <!-- Columna Total -->
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let element" class="total">
                    $ {{ element.total | number: '1.2-2' }}
                  </td>
                </ng-container>

                <!-- Columna Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let element">
                    <button mat-icon-button color="primary" (click)="verDetalle(element.id)" title="Ver detalle">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
    .facturas-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .content {
      flex: 1;
      padding: 30px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      overflow-y: auto;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }

    .facturas-card {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 4px 4px 0 0;
      margin: -16px -16px 20px -16px;
    }

    mat-card-title {
      color: white;
      font-size: 24px;
      margin-bottom: 5px;
    }

    mat-card-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 20px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 20px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
    }

    .empty-state p {
      color: #999;
      font-size: 16px;
      margin: 0;
    }

    .facturas-table {
      width: 100%;
      background: white;
      border-collapse: collapse;
    }

    .facturas-table th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 500;
      border-bottom: 2px solid #667eea;
    }

    .facturas-table td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .facturas-table tr:hover {
      background-color: #f9f9f9;
    }

    .total {
      font-weight: bold;
      color: #667eea;
    }

    button {
      margin: 0 5px;
    }
    `
  ]
})
export class ListaFacturasComponent implements OnInit {
  facturas: Factura[] = [];
  cargando = true;
  displayedColumns: string[] = ['id', 'fecha', 'mascota', 'tratamiento', 'total', 'acciones'];

  constructor(
    private facturaService: FacturaService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.cargando = true;
    this.facturaService.obtenerFacturas().subscribe({
      next: (data) => {
        this.facturas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar facturas:', error);
        this.snackBar.open('Error al cargar facturas', 'Cerrar', { duration: 3000 });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/factura-detalle', id]);
  }
}
