import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tratamiento {
    id: number;
    descripcion: string;
    medicamento?: string;
    duracion?: string;
    precio?: number;
    fecha_creacion?: string;
}

export interface CrearTratamientoData {
    descripcion: string;
    medicamento?: string;
    duracion?: string;
    precio?: number;
}

@Injectable({
    providedIn: 'root'
})
export class TratamientoService {
    private apiUrl = `${environment.apiUrl}/tratamientos`;

    constructor(private http: HttpClient) {}

    obtenerTratamientos(): Observable<Tratamiento[]> {
        return this.http.get<Tratamiento[]>(this.apiUrl);
    }

    obtenerTratamiento(id: number): Observable<Tratamiento> {
        return this.http.get<Tratamiento>(`${this.apiUrl}/${id}`);
    }

    crearTratamiento(datos: CrearTratamientoData): Observable<Tratamiento> {
        return this.http.post<Tratamiento>(this.apiUrl, datos);
    }
}