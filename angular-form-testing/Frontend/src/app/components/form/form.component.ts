import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import UIkit from 'uikit';

const ASYNC_VALIDATION_DELAY = 1000;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  usernameAsyncValidator: boolean = false;
  passwordAsyncValidator: boolean = false;
  emailAsyncValidator: boolean = false;
  isFormsubmitted: boolean = false;
  isRegisterSuccessful: boolean = false;

  profileForm = new FormGroup({
    username: new FormControl(null, Validators.required, (control) => this.validateUsername(control.value)),
    email:    new FormControl(null, [Validators.required, Validators.email], (control) => this.validateEmail(control.value)),
    password: new FormControl(null, [Validators.required, Validators.minLength(3)], (control) => this.validatePasswordStrength(control.value)),
    tos:      new FormControl(null, Validators.requiredTrue),
  });                                                                                                       

  constructor(private userService: UserService) {}

  public signUp(): void {
    if (!this.profileForm.valid) return;
    
    this.isFormsubmitted = true;

    this.userService.signUp(this.profileForm.value).subscribe(data => {
      UIkit.notification({
        message: `<span uk-icon='icon: check'></span> <span class='uk-text-small'>${data.message}</span>`,
        status: 'success',
        pos: 'top-right',
        timeout: 3000                                                                     
      });
    },
    error => {
      UIkit.notification({
        message: `<span uk-icon='icon: cross'></span> <span class='uk-text-small'>${error.message}</span>`,
        status: 'danger',
        pos: 'top-right',
        timeout: 3000                                                                     
      });
    });

    return;
  };

  private validateUsername(username: string): Observable<ValidationErrors> {
    this.usernameAsyncValidator = true;
    
    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.userService.isUsernameTaken(username)),
      map((usernameTaken) => {
        this.usernameAsyncValidator = false;
        return (usernameTaken ? { usernameTaken: true } : {})
      }),
    );
  };

  private validateEmail(email: string): Observable<ValidationErrors> {
    this.emailAsyncValidator = true;

    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.userService.isEmailTaken(email)),
      map((emailTaken) => {
        this.emailAsyncValidator = false;
        return (emailTaken ? { emailTaken: true } : {})
      }),
    );
  };

  private validatePasswordStrength(password: string): Observable<ValidationErrors> {
    this.passwordAsyncValidator = true;

    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.userService.passwordValidation(password)),
      map((passwordStrength) => {
        this.passwordAsyncValidator = false;
        const strengthResult = Object.values(passwordStrength);
        return (strengthResult[0] < 3 
                ? { passwordStrength: {
                    score: strengthResult[0],
                    suggestions: strengthResult[2].join(' ')
                  }} 
                : {})})
    )
  }
}
