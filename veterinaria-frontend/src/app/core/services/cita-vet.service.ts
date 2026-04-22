// core/services/cita-vet.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface CitaVet {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    mascotaNombre: string;
    veterinario?: string;
    especialidad?: string;
    dueno_mascota?: string;
    tel?: string;
}

export interface CrearCitaVetData {
    mascotaId: number;
    fecha: string;
    hora: string;
}

export interface RegistrarConsultaData {
    diagnostico: string;
    observaciones: string;
    id_tratamiento?: number | null;
}

export interface ConsultaVet {
    id: number;
    diagnostico: string;
    observaciones: string;
    fecha: string;
    hora: string;
    mascota: string;
    veterinario: string;
    especialidad: string;
    tratamiento?: string;
    medicamento?: string;
    duracion?: string;
}

@Injectable({
    providedIn: "root"
})
export class CitaVetService {
    private apiUrl = `${environment.apiUrl}/vet`;
    
    constructor(private http: HttpClient) {}

    /**
     * Obtiene todas las citas del veterinario autenticado
     * GET /api/vet/citas
     */
    obtenerCitas(): Observable<CitaVet[]> {
        return this.http.get<CitaVet[]>(`${this.apiUrl}/citas`);
    }

    /**
     * Obtiene una cita específica por ID
     * GET /api/vet/citas/:id
     */
    obtenerCita(id: number): Observable<CitaVet> {
        return this.http.get<CitaVet>(`${this.apiUrl}/citas/${id}`);
    }

    /**
     * Registra una consulta para una cita específica
     * POST /api/vet/citas/:id/consulta
     */
    registrarConsulta(citaId: number, datos: RegistrarConsultaData): Observable<any> {
        return this.http.post(`${this.apiUrl}/citas/${citaId}/consulta`, datos);
    }

    /**
     * Obtiene todas las consultas realizadas por el veterinario
     * GET /api/vet/consultas
     */
    obtenerConsultas(): Observable<ConsultaVet[]> {
        return this.http.get<ConsultaVet[]>(`${this.apiUrl}/consultas`);
    }

    /**
     * Obtiene el detalle de una consulta específica
     * GET /api/vet/consultas/:id
     */
    obtenerConsultaDetalle(id: number): Observable<ConsultaVet> {
        return this.http.get<ConsultaVet>(`${this.apiUrl}/consultas/${id}`);
    }
}

