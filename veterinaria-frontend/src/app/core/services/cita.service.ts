import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cita {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  mascota: string;
  veterinario: string;
}

export interface CrearCitaData {
  id_mascota: number;
  id_veterinario: number;
  fecha: string;
  hora: string;
}

export interface HorariosDisponibles {
  fecha: string;
  horarios_disponibles: string[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener horarios disponibles para un veterinario en una fecha específica
   * GET /api/citas/horarios-disponibles?veterinario_id=1&fecha=2024-04-21
   */
  obtenerHorariosDisponibles(veterinarioId: number, fecha: string): Observable<HorariosDisponibles> {
    return this.http.get<HorariosDisponibles>(`${this.apiUrl}/horarios-disponibles`, {
      params: {
        veterinario_id: veterinarioId.toString(),
        fecha: fecha
      }
    });
  }

  /**
   * Crear una nueva cita
   * POST /api/citas
   */
  crearCita(datos: CrearCitaData): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  /**
   * Obtener todas las citas del usuario autenticado
   * GET /api/citas
   */
  obtenerCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  /**
   * Obtener una cita específica
   * GET /api/citas/:id
   */
  obtenerCita(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar una cita
   * PUT /api/citas/:id
   */
  actualizarCita(id: number, datos: CrearCitaData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  /**
   * Cancelar una cita
   * DELETE /api/citas/:id
   */
  cancelarCita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener historial de consultas para una cita
   * GET /api/citas/:id/historial
   */
  obtenerHistorial(citaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${citaId}/historial`);
  }
}
