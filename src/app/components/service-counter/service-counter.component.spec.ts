import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { CounterService } from 'src/app/services/counter.service';

import { ServiceCounterComponent } from './service-counter.component';

describe('ServiceCounterComponent', () => {
  const newCount = '456';
  let debugElement: DebugElement;

  let component: ServiceCounterComponent;
  let fixture: ComponentFixture<ServiceCounterComponent>;

  let fakeCount$: BehaviorSubject<number>;
  let fakeCounterService: Pick<CounterService, keyof CounterService>;

  beforeEach(async () => {
    fakeCount$ = new BehaviorSubject(0);

    fakeCounterService = {
      getCount(): Observable<number> { return fakeCount$ },
      increment(): void { fakeCount$.next(1) },
      decrement(): void { fakeCount$.next(-1) },
      resetCount(): void { fakeCount$.next(Number(newCount)) },
    }

    // Install spies on the fakeCounterService
    spyOn(fakeCounterService, 'getCount').and.callThrough();
    spyOn(fakeCounterService, 'increment').and.callThrough();
    spyOn(fakeCounterService, 'decrement').and.callThrough();
    spyOn(fakeCounterService, 'resetCount').and.callThrough();

    await TestBed.configureTestingModule({
      declarations: [ ServiceCounterComponent ],
      providers: [
        { provide: CounterService, useValue: fakeCounterService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCounterComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the start count', () => {
    const countOutput = debugElement.query(By.css('[data-testid="count"]'));

    expect(countOutput.nativeElement.textContent).toBe('0');
    expect(fakeCounterService.getCount).toHaveBeenCalled();
  });

  it('increments the count', () => {
    const incrementButton = debugElement.query(By.css('[data-testid="increment-button"]'));
    
    incrementButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe('1');
    expect(fakeCounterService.increment).toHaveBeenCalled();
  });

  it('decrements the count', () => {
    const decrementButton = debugElement.query(By.css('[data-testid="decrement-button"]'));
    
    decrementButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe('-1');
    expect(fakeCounterService.decrement).toHaveBeenCalled();
  });

  it('resets the count', () => {
    // Arrange
    const resetButton = debugElement.query(By.css('[data-testid="reset-button"]'));
    const resetInputFieldNativeEl = debugElement.query(By.css('[data-testid="reset-input"]')).nativeElement;

    // Act
    resetInputFieldNativeEl.value = newCount;
    resetInputFieldNativeEl.dispatchEvent(new Event('input'));
    resetButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe(newCount);
    expect(fakeCounterService.resetCount).toHaveBeenCalledWith(Number(newCount));
  });
});
