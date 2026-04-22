import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { CitaVetService } from '../../core/services/cita-vet.service';
import { AuthService } from '../../core/services/auth.service';
import { NgZone } from '@angular/core';

@Component({
    selector: 'app-citas-vet',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDialogModule
    ],
    template: `
        <div class="citas-container">
            <mat-toolbar color="primary">
                <button mat-icon-button (click)="goBack()">
                    <mat-icon>arrow_back</mat-icon>
                </button>
                <span>Mis Citas</span>
            </mat-toolbar>
            <div class="content">
                <div *ngIf="isLoading" class="loading">
                    <mat-spinner></mat-spinner>
                    <p>Cargando citas...</p>
                </div> 
                <div *ngIf="!isLoading && citas.length === 0" class="empty-state">
                    <mat-icon>event_busy</mat-icon>
                    <p>No tiene citas registradas</p>
                </div>
                <div *ngIf="!isLoading && citas.length > 0" class="citas-grid">
                    <mat-card *ngFor="let cita of citas" class="cita-card">
                        <mat-card-header>
                            <mat-card-title>{{ cita.mascotaNombre }}</mat-card-title>
                            <mat-card-subtitle>{{ cita.fecha | date:'short' }}</mat-card-subtitle>
                        </mat-card-header>
                        <mat-card-content>
                            <p>fecha: {{ cita.fecha | date:'short'}}</p>
                            <p>hora: {{ cita.hora }}</p>
                            <p>Estado: {{ cita.estado }}</p>
                        </mat-card-content>
                    </mat-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .citas-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .content {
            flex: 1;
            padding: 16px;
        }
        .loading, .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: rgba(0, 0, 0, 0.54);
        }
        .citas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
        }
        .cita-card {
            transition: transform 0.2s;
        }
        .cita-card:hover {
            transform: translateY(-4px);
        }
    `]
})
export class CitasVetComponent implements OnInit {
    citas: any[] = [];
    isLoading = true;
    constructor(
        private citavetService: CitaVetService,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) {}
    ngOnInit() {
        this.cargarCitas();
    }
    cargarCitas() {
        this.isLoading = true;
        this.citavetService.obtenerCitas().subscribe({
            next: (citas) => {
                this.citas = citas;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error al cargar las citas:', error);
                this.isLoading = false;
            }
        });
    }
    goBack() {
        this.ngZone.run(() => this.router.navigate(['/dashboard-vet']));
    }
}