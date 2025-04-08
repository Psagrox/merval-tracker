import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = `${environment.apiUrl}/stocks`;

  constructor(private http: HttpClient) { }

  getStocks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getStockById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createStock(stockData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, stockData);
  }

  updateStockPrices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/update-prices`);
  }
}
