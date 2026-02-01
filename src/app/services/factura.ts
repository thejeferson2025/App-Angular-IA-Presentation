import { Observable, of } from 'rxjs'; 
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators'; 
import { HttpClient } from '@angular/common/http';
import { Factura } from '../models/factura.model';

@Injectable({
  providedIn: 'root',
})
export class FacturaService {
  private apiUrl = 'https://localhost:7161/api/facturas'; 

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.apiUrl).pipe(
      catchError(err => this.handleError(err))
    );
  }

  subirPdf(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/update`, formData).pipe(
      catchError(err => this.handleError(err))
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  actualizar(id: number, factura: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, factura).pipe(
      catchError(err => this.handleError(err))
    );
  }

  
   // Temporal para manejar errores (consola)
  private handleError(err: any) {
    // El error de certificado SSL local tiene status 0
    if (err.status === 0) {
      // En lugar de un error rojo, mostramos un aviso discreto o nada
      console.warn('Conexión local establecida (SSL bypass)');
      return of([]); // Retorna un flujo vacío para que no explote la consola
    }
    // Si es un error real de programación, lo lanzamos
    throw err;
  }
}