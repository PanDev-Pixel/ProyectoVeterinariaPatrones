import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/consultas`;

export interface HistorialItem {
  cita_id: number;
  fecha: string;
  hora: string;
  estado: string;
  veterinario: string;
  especialidad: string;
  consulta_id?: number;
  diagnostico?: string;
  observaciones?: string;
  tratamiento?: string;
  medicamento?: string;
  duracion?: string;
}

export interface DetalleConsulta {
  id: number;
  diagnostico: string;
  observaciones: string;
  fecha_cita: string;
  hora_cita: string;
  mascota: string;
  veterinario: string;
  tratamiento: string;
  medicamento: string;
  duracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  constructor(private http: HttpClient) {}

  obtenerHistorial(mascotaId: number): Observable<HistorialItem[]> {
    return this.http.get<HistorialItem[]>(`${API_URL}/mascota/${mascotaId}`);
  }

  obtenerConsulta(id: number): Observable<DetalleConsulta> {
    return this.http.get<DetalleConsulta>(`${API_URL}/${id}`);
  }
}
