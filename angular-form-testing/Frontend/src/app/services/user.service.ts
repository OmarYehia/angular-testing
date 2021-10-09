import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PasswordStrength {
  score: number,
  warning: string,
  suggestions: string[]
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  public isUsernameTaken(username: string): Observable<boolean> {
    return this.http.post<{ usernameTaken: boolean}>('http://localhost:3000/users/username-taken', { username })
            .pipe(map(result => result.usernameTaken));
  }

  public passwordValidation(password: string): Observable<PasswordStrength> {
    return this.http.post<PasswordStrength>('http://localhost:3000/users/password-strength', { password });
  }

  public isEmailTaken(email: string): Observable<boolean> {
    return this.http.post<{ emailTaken: boolean}>('http://localhost:3000/users/email-taken', { email })
            .pipe(map(result => result.emailTaken));
  }

  public signUp(signUpData: any): Observable<{ success: true, message: string }> {
    console.log(typeof signUpData);
    return this.http.post<{ success: true, message: string }>('http://localhost:3000/users/signup', signUpData);
  }
}
