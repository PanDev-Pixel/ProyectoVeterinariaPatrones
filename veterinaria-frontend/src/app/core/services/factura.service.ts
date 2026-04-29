import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Factura {
  id: number;
  fecha: string;
  total: number;
  mascota?: string;
  tratamiento?: string;
  diagnostico?: string;
  observaciones?: string;
  usuario_nombre?: string;
}

export interface FacturaDetalle {
  id: number;
  fecha: string;
  total: number;
  mascota_nombre: string;
  mascota_especie: string;
  mascota_raza: string;
  mascota_edad: number;
  // Alias para compatibilidad con componente
  especie?: string;
  raza?: string;
  edad?: number;
  veterinario_nombre: string;
  especialidad: string;
  diagnostico: string;
  observaciones: string;
  tratamiento_desc: string;
  medicamento: string;
  duracion: string;
  dueno_nombre: string;
  email: string;
  tel: string;
  // Alias para compatibilidad con componente
  dueno_email?: string;
  dueno_tel?: string;
  cita_fecha?: string;
  cita_hora?: string;
}

export interface CrearFacturaData {
  id_consulta: number;
  id_tratamiento?: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las facturas del usuario
   */
  obtenerFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.apiUrl);
  }

  /**
   * Obtener detalle de una factura específica
   */
  obtenerFactura(id: number): Observable<FacturaDetalle> {
    return this.http.get<FacturaDetalle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva factura
   */
  crearFactura(datos: CrearFacturaData): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  /**
   * Actualizar una factura
   */
  actualizarFactura(id: number, total: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { total });
  }

  /**
   * Eliminar una factura
   */
  eliminarFactura(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener facturas por consulta
   */
  obtenerFacturasPorConsulta(id_consulta: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/consulta/${id_consulta}`);
  }

  /**
   * Obtener facturas del veterinario (facturas de citas atendidas por el vet)
   */
  obtenerFacturasVeterinario(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/veterinario`);
  }
}
