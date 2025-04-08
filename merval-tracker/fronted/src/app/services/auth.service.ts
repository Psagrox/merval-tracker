import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { TokenService } from './token.service';
import { enviroment } from '../../'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${enviroment.apiUrl}`
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.tokenService.getUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData)
    .pipe(
      tap(response => {
        if (response && response.token) {
          this.tokenService.setToken(response.token);
          this.tokenService.setUser(response.user);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
    .pipe(
      tap(response => {
        if (response && response.token) {
          this.tokenService.setToken(response.token);
          this.tokenService.setUser(response.user);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    this.tokenService.clear();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  refreshUserData(): Observable<any> {
    return this.getMe().pipe(
      tap(response => {
        if (response && response.data) {
          this.tokenService.setUser(response.data);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

}
