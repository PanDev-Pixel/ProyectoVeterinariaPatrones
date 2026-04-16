import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/mascotas`;

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
}

export interface CrearMascotaData {
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  constructor(private http: HttpClient) {}

  obtenerMascotas(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(API_URL);
  }

  obtenerMascota(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${API_URL}/${id}`);
  }

  crearMascota(datos: CrearMascotaData): Observable<any> {
    return this.http.post(API_URL, datos);
  }

  actualizarMascota(id: number, datos: CrearMascotaData): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, datos);
  }

  eliminarMascota(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }
}
