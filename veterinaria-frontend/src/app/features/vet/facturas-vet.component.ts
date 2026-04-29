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
  selector: 'app-facturas-vet',
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
        <button mat-icon-button routerLink="/dashboard-vet">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Facturas Generadas</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="facturas-card">
          <mat-card-header>
            <mat-card-title>Todas las Facturas</mat-card-title>
            <mat-card-subtitle>Facturas generadas por tus consultas</mat-card-subtitle>
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
              <div class="stats">
                <div class="stat-item">
                  <strong>Total de Facturas:</strong> {{ facturas.length }}
                </div>
                <div class="stat-item">
                  <strong>Ingresos Totales:</strong> $ {{ calcularTotal() | number: '1.2-2' }}
                </div>
              </div>

              <table mat-table [dataSource]="facturas" class="facturas-table">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let element">{{ element.id }}</td>
                </ng-container>

                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let element">{{ element.fecha | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="mascota">
                  <th mat-header-cell *matHeaderCellDef>Mascota</th>
                  <td mat-cell *matCellDef="let element">{{ element.mascota }}</td>
                </ng-container>

                <ng-container matColumnDef="usuario_nombre">
                  <th mat-header-cell *matHeaderCellDef>Dueño</th>
                  <td mat-cell *matCellDef="let element">{{ element.usuario_nombre }}</td>
                </ng-container>

                <ng-container matColumnDef="diagnostico">
                  <th mat-header-cell *matHeaderCellDef>Diagnóstico</th>
                  <td mat-cell *matCellDef="let element">{{ element.diagnostico }}</td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let element" class="total">
                    $ {{ element.total | number: '1.2-2' }}
                  </td>
                </ng-container>

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
  styles: [`
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
    }
    .facturas-card { 
      max-width: 1200px; 
      margin: 0 auto; 
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
    }
    mat-card-header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 20px; 
    }
    mat-card-title { 
      color: white; 
      font-size: 24px; 
      margin-bottom: 5px; 
    }
    mat-card-subtitle { 
      color: rgba(255, 255, 255, 0.8); 
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
    .stats { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 20px; 
      margin-bottom: 30px; 
    }
    .stat-item { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 20px; 
      border-radius: 8px; 
      text-align: center; 
    }
    .facturas-table { 
      width: 100%; 
      margin-top: 20px; 
    }
    .facturas-table th { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 12px; 
      text-align: left; 
      font-weight: 500; 
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
    @media (max-width: 900px) { 
      .stats { grid-template-columns: 1fr; } 
    }
  `]
})
export class FacturasVetComponent implements OnInit {
  facturas: Factura[] = [];
  cargando = true;
  displayedColumns: string[] = ['id', 'fecha', 'mascota', 'usuario_nombre', 'diagnostico', 'total', 'acciones'];

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
    this.facturaService.obtenerFacturasVeterinario().subscribe({
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
    this.router.navigate(['/factura-detalle-vet', id]);
  }

  calcularTotal(): number {
    return this.facturas.reduce((sum, factura) => sum + (factura.total || 0), 0);
  }
}
