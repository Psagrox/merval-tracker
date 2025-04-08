import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/portfolios`;

  constructor(private http: HttpClient) { }

  getPortfolio(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updatePortfolioName(name: string): Observable<any> {
    return this.http.put<any>(this.apiUrl, { name });
  }
}
