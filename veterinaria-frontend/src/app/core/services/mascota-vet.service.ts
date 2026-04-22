import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MascotaVet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  dueno_mascota: string;
  tel: string;
  email: string;
}

export interface HistorialMascota {
  cita_id: number;
  fecha: string;
  hora: string;
  estado: string;
  veterinario: string;
  especialidad: string;
  consulta_id: number;
  diagnostico: string;
  observaciones: string;
  tratamiento: string;
  medicamento: string;
  duracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaVetService {
  private apiUrl = `${environment.apiUrl}/vet`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene TODAS las mascotas del sistema (para veterinario)
   * GET /api/vet/mascotas
   */
  obtenerTodasMascotas(): Observable<MascotaVet[]> {
    return this.http.get<MascotaVet[]>(`${this.apiUrl}/mascotas`);
  }

  /**
   * Obtiene una mascota específica por ID
   * GET /api/vet/mascotas/:id
   */
  obtenerMascota(id: number): Observable<MascotaVet> {
    return this.http.get<MascotaVet>(`${this.apiUrl}/mascotas/${id}`);
  }

  /**
   * Obtiene el historial completo de una mascota
   * GET /api/vet/mascotas/:id/historial
   */
  obtenerHistorialMascota(mascotaId: number): Observable<HistorialMascota[]> {
    return this.http.get<HistorialMascota[]>(
      `${this.apiUrl}/mascotas/${mascotaId}/historial`
    );
  }

  /**
   * Busca mascotas por nombre o dueño
   * GET /api/vet/mascotas/buscar?q=:query
   */
  buscarMascotas(query: string): Observable<MascotaVet[]> {
    return this.http.get<MascotaVet[]>(
      `${this.apiUrl}/mascotas/buscar`,
      { params: { q: query } }
    );
  }
}