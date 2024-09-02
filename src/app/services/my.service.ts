import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  private apiUrl = 'your_api_endpoint'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  checkUserExistence(name: string, surname: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-user`, {
      params: { name, surname },
    });
  }

  getUserData(name: string, surname: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-user-data`, {
      params: { name, surname },
    });
  }

  submitForm(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/submit-form`, formData);
  }
}
