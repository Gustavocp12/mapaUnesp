import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private url = 'https://sili-api.onrender.com';

  public getCases(){
    return this.http.get(`${this.url}/cases`, { headers: this.authService.httpOptions.headers });
  }

}
