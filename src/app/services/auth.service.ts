import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private url = 'https://sili-api.onrender.com/login';

  public isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  public login(email: string, password: string) {
    return this.http.post<any>(this.url, { email: email, password: password })
  }

  //configurações do header para requisições http

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
  }
}
