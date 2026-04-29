import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Factura {
  id: number;
  fecha: string;
  total: number;
  diagnostico?: string;
  observaciones?: string;
  mascota?: string;
  tratamiento?: string;
  usuario_nombre?: string;
}

export interface FacturaDetalle {
  id: number;
  id_usuario: number;
  id_consulta: number;
  id_tratamiento?: number;
  fecha: string;
  total: number;
  consulta_id?: number;
  diagnostico?: string;
  observaciones?: string;
  cita_fecha?: string;
  cita_hora?: string;
  mascota_id?: number;
  mascota_nombre?: string;
  especie?: string;
  raza?: string;
  edad?: number;
  especialidad?: string;
  veterinario_nombre?: string;
  dueno_nombre?: string;
  dueno_email?: string;
  dueno_tel?: string;
  tratamiento_id?: number;
  tratamiento_desc?: string;
  medicamento?: string;
  duracion?: string;
  usuario_nombre?: string;
  usuario_email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las facturas del usuario autenticado
   * GET /api/facturas
   */
  obtenerFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.apiUrl);
  }

  /**
   * Obtener detalle de una factura específica
   * GET /api/facturas/:id
   */
  obtenerFactura(id: number): Observable<FacturaDetalle> {
    return this.http.get<FacturaDetalle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva factura (opcional, ya se genera automáticamente)
   * POST /api/facturas
   */
  crearFactura(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  /**
   * Actualizar una factura
   * PUT /api/facturas/:id
   */
  actualizarFactura(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  /**
   * Eliminar una factura
   * DELETE /api/facturas/:id
   */
  eliminarFactura(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
