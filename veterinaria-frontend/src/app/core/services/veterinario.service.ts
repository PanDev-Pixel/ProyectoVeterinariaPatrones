import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Veterinario {
  id: number;
  nombre: string;
  email?: string;
  tel?: string;
  especialidad: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VeterinarioService {
  private apiUrl = `${environment.apiUrl}/veterinarios`;

  constructor(private http: HttpClient) {}

  obtenerVeterinarios(): Observable<Veterinario[]> {
    return this.http.get<Veterinario[]>(this.apiUrl);
  }

  obtenerVeterinario(id: number): Observable<Veterinario> {
    return this.http.get<Veterinario>(`${this.apiUrl}/${id}`);
  }

  obtenerHorariosDisponibles(id: number, fecha: string): Observable<{ horas: string[] }> {
    return this.http.get<{ horas: string[] }>(
      `${this.apiUrl}/${id}/horarios?fecha=${fecha}`
    );
  }
}
