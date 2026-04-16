import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

export interface RegistroData {
  nombre: string;
  email: string;
  contraseña: string;
  tel: string;
  dic: string;
}

export interface LoginData {
  email: string;
  contraseña: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient) {}

  registro(datos: RegistroData): Observable<any> {
    return this.http.post(`${API_URL}/registro`, datos);
  }

  login(datos: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/login`, datos);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  perfil(): Observable<any> {
    return this.http.get(`${API_URL}/profile`);
  }
}
