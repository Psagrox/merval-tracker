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


}
