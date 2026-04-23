import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/facturas`;

export interface Factura {
  id: number;
  id_usuario: number;
  id_consulta: number;
  id_tratamiento: number | null;
  fecha: string;
  total: number;
}

export interface FacturaDetalle extends Factura {
  mascota_nombre: string;
  diagnostico: string;
  observaciones: string;
  fecha_cita: string;
  veterinario_nombre: string;
  tratamiento?: string;
  medicamento?: string;
  duracion?: string;
}

export interface CrearFacturaData {
  id_consulta: number;
  id_tratamiento?: number | null;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  constructor(private http: HttpClient) {}

  obtenerFacturas(): Observable<FacturaDetalle[]> {
    return this.http.get<FacturaDetalle[]>(`${API_URL}`);
  }

  obtenerFactura(id: number): Observable<FacturaDetalle> {
    return this.http.get<FacturaDetalle>(`${API_URL}/${id}`);
  }

  crearFactura(data: CrearFacturaData): Observable<Factura> {
    return this.http.post<Factura>(`${API_URL}`, data);
  }

  obtenerFacturasPorConsulta(consultaId: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${API_URL}/consulta/${consultaId}`);
  }

  actualizarMontoFactura(id: number, total: number): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, { total });
  }
}
