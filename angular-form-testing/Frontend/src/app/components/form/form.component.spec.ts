import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

import { FormComponent } from './form.component';

const signupData = {
  username: "Fake Name",
  email: "fake@email.com",
  password: "fAke_pAssword@123",
  tos: true
};

const CREATION_MESSAGE = "User created successfully!";

const strongPassword = {
  score: 4,
  suggestions: [],
  warning: ""
};

const weakPassword = {
  score: 2,
  warning: "Password too weak",
  suggestions: ["Add few more words."],
}

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let userService: jasmine.SpyObj<UserService>;

  const setup = async(userServiceReturnValues?: jasmine.SpyObjMethodNames<UserService>) => {
    userService = jasmine.createSpyObj<UserService>(
      'UserService',
      {
        // Successful responses per default
        isUsernameTaken: of(false),
        isEmailTaken: of(false),
        passwordValidation: of(strongPassword),
        signUp: of({ success: true, message: CREATION_MESSAGE}),
        // Overwrite with given return values
        ...userServiceReturnValues,
      }
    );

    await TestBed.configureTestingModule({
      declarations: [ FormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [ { provide: UserService, useValue: userService } ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const fillForm = (): void => {
    setFieldValue(fixture, 'username', signupData.username);
    setFieldValue(fixture, 'email', signupData.email);
    setFieldValue(fixture, 'password', signupData.password);
    setCheckBox(fixture, 'tos', signupData.tos);
  }

  it('should create', async() => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('submits the form successfully', fakeAsync(async () => {
    await setup();
    fillForm();

    // Submit button should be disabled untill the result of async validators come back
    expect(findEl(fixture, 'register-button').properties.disabled).toBe(true);

    // Simulate wait for async validators
    tick(1000);
    fixture.detectChanges();

    expect(findEl(fixture, 'register-button').properties.disabled).toBe(false);

    findEl(fixture, 'form').triggerEventHandler('submit', null);
    // Simulate wait for notification (UIkit)
    tick(4000);
    fixture.detectChanges();

    expect(userService.isUsernameTaken).toHaveBeenCalledWith(signupData.username);
    expect(userService.isEmailTaken).toHaveBeenCalledWith(signupData.email);
    expect(userService.passwordValidation).toHaveBeenCalledWith(signupData.password);
    expect(userService.signUp).toHaveBeenCalledWith(signupData);
  }));

  it('does not submit an invalid form', fakeAsync(async () => {
    await setup();

    expect(findEl(fixture, 'register-button').properties.disabled).toBe(true);

    findEl(fixture, 'form').triggerEventHandler('submit', null);

    expect(userService.isUsernameTaken).not.toHaveBeenCalled();
    expect(userService.isEmailTaken).not.toHaveBeenCalled();
    expect(userService.passwordValidation).not.toHaveBeenCalled();
    expect(userService.signUp).not.toHaveBeenCalled();
  }));

  it('fails if username is taken', fakeAsync(async () => {
    await setup({ isUsernameTaken: of(true) });
    fillForm();

    tick(1000);
    fixture.detectChanges();

    expect(findEl(fixture, 'register-button').properties.disabled).toBe(true);

    findEl(fixture, 'form').triggerEventHandler('submit', null);

    expect(userService.isUsernameTaken).toHaveBeenCalledWith(signupData.username);
    expect(userService.isEmailTaken).toHaveBeenCalledWith(signupData.email);
    expect(userService.passwordValidation).toHaveBeenCalledWith(signupData.password);
    expect(userService.signUp).not.toHaveBeenCalled();
  }));

  it('fails if email is taken', fakeAsync(async () => {
    await setup({ isEmailTaken: of(true) });
    fillForm();

    tick(1000);
    fixture.detectChanges();

    expect(findEl(fixture, 'register-button').properties.disabled).toBe(true);

    findEl(fixture, 'form').triggerEventHandler('submit', null);

    expect(userService.isUsernameTaken).toHaveBeenCalledWith(signupData.username);
    expect(userService.isEmailTaken).toHaveBeenCalledWith(signupData.email);
    expect(userService.passwordValidation).toHaveBeenCalledWith(signupData.password);
    expect(userService.signUp).not.toHaveBeenCalled();
  }));

  it('fails if password is too weak', fakeAsync(async () => {
    await setup({ passwordValidation: of(weakPassword) });
    fillForm();

    tick(1000);
    fixture.detectChanges();

    expect(findEl(fixture, 'register-button').properties.disabled).toBe(true);

    findEl(fixture, 'form').triggerEventHandler('submit', null);

    expect(userService.isUsernameTaken).toHaveBeenCalledWith(signupData.username);
    expect(userService.isEmailTaken).toHaveBeenCalledWith(signupData.email);
    expect(userService.passwordValidation).toHaveBeenCalledWith(signupData.password);
    expect(userService.signUp).not.toHaveBeenCalled();
  }));

  // Helper functions
  function findEl<T>(fixture: ComponentFixture<T>, testId: string): DebugElement {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }


  function setFieldValue<T>(fixture: ComponentFixture<T>, testId: string, value: string): any {
    const { nativeElement } = findEl(fixture, testId);
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  }

  function setCheckBox<T>(fixture: ComponentFixture<T>, testId: string, checked: boolean): void {
    const { nativeElement } = findEl(fixture, testId);
    nativeElement.checked = checked;
    nativeElement.dispatchEvent(new Event('change'));
  }


  function expectText<T>(fixture: ComponentFixture<T>, testId: string, text: string): void {
    const debugElement = findEl(fixture, testId);
    const actualText = debugElement.nativeElement.textContent;
    expect(actualText).toBe(text);
  }


  function click<T>(fixture: ComponentFixture<T>, testId: string): void {
    const debugElement = findEl(fixture, testId);
    const event = createMockClickEvent(debugElement.nativeElement);
    debugElement.triggerEventHandler('click', event);
  }


  function createMockClickEvent(target: EventTarget): Partial<MouseEvent> {
    return {
      preventDefault(): void {},
      stopPropagation(): void {},
      stopImmediatePropagation(): void {},
      type: 'click',
      target,
      currentTarget: target,
      bubbles: true,
      cancelable: true,
      button: 0
    }
  }
});

