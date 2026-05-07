import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/admin`;

export interface DashboardStats {
  totalUsuarios: number;
  totalVeterinarios: number;
  totalMascotas: number;
  totalCitas: number;
  citasHoy: number;
  ingresosMes: number;
  citasPendientes: number;
  citasCompletadas: number;
}

export interface RecentActivity {
  id: number;
  tipo: 'cita' | 'usuario' | 'mascota' | 'factura';
  descripcion: string;
  fecha: Date;
  icono: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  /**
   * Obtener estadísticas del dashboard
   * GET /api/admin/stats
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_URL}/stats`);
  }

  /**
   * Obtener actividad reciente
   * GET /api/admin/activity
   */
  getRecentActivity(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${API_URL}/activity`);
  }

  /**
   * Obtener todos los usuarios
   * GET /api/admin/usuarios
   */
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/usuarios`);
  }

  /**
   * Crear nuevo usuario
   * POST /api/admin/usuarios
   */
  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${API_URL}/usuarios`, usuario);
  }

  /**
   * Actualizar usuario
   * PUT /api/admin/usuarios/:id
   */
  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${API_URL}/usuarios/${id}`, usuario);
  }

  /**
   * Eliminar usuario
   * DELETE /api/admin/usuarios/:id
   */
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/usuarios/${id}`);
  }

  /**
   * Obtener todos los veterinarios
   * GET /api/admin/veterinarios
   */
  getVeterinarios(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/veterinarios`);
  }

  /**
   * Crear nuevo veterinario
   * POST /api/admin/veterinarios
   */
  createVeterinario(veterinario: any): Observable<any> {
    return this.http.post(`${API_URL}/veterinarios`, veterinario);
  }

  /**
   * Actualizar veterinario
   * PUT /api/admin/veterinarios/:id
   */
  updateVeterinario(id: number, veterinario: any): Observable<any> {
    return this.http.put(`${API_URL}/veterinarios/${id}`, veterinario);
  }

  /**
   * Eliminar veterinario
   * DELETE /api/admin/veterinarios/:id
   */
  deleteVeterinario(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/veterinarios/${id}`);
  }

  /**
   * Obtener todos los tratamientos
   * GET /api/admin/tratamientos
   */
  getTratamientos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/tratamientos`);
  }

  /**
   * Crear nuevo tratamiento
   * POST /api/admin/tratamientos
   */
  createTratamiento(tratamiento: any): Observable<any> {
    return this.http.post(`${API_URL}/tratamientos`, tratamiento);
  }

  /**
   * Actualizar tratamiento
   * PUT /api/admin/tratamientos/:id
   */
  updateTratamiento(id: number, tratamiento: any): Observable<any> {
    return this.http.put(`${API_URL}/tratamientos/${id}`, tratamiento);
  }

  /**
   * Eliminar tratamiento
   * DELETE /api/admin/tratamientos/:id
   */
  deleteTratamiento(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/tratamientos/${id}`);
  }

  /**
   * Obtener facturas
   * GET /api/admin/facturas
   */
  getFacturas(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/facturas`);
  }

  /**
   * Generar backup de datos
   * GET /api/admin/backup
   */
  generateBackup(): Observable<Blob> {
    return this.http.get(`${API_URL}/backup`, { responseType: 'blob' });
  }

  /**
   * Obtener reporte de ingresos
   * GET /api/admin/reportes/ingresos
   */
  getIngresosReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/reportes/ingresos?start=${startDate}&end=${endDate}`);
  }

  /**
   * Obtener reporte de citas
   * GET /api/admin/reportes/citas
   */
  getCitasReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/reportes/citas?start=${startDate}&end=${endDate}`);
  }
}
