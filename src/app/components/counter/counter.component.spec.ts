import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('increments count', () => {
    // Arrange
    const incrementButton = debugElement.query(By.css('[data-testid="increment-button"]'));
    
    // Act
    incrementButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe('1');
  });

  it('decrements count', () => {
    // Arrange
    const decrementButton = debugElement.query(By.css('[data-testid="decrement-button"]'));
    
    // Act
    decrementButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe('-1');
  });

  it('resets the count', () => {
    // Arrange
    const testingValue = '123';
    const resetButton = debugElement.query(By.css('[data-testid="reset-button"]'));
    const resetInputFieldNativeEl = debugElement.query(By.css('[data-testid="reset-input"]')).nativeElement;

    // Act
    resetInputFieldNativeEl.value = testingValue;
    resetInputFieldNativeEl.dispatchEvent(new Event('input'));
    resetButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe(testingValue);
  });

  it('does not reset the count if the value is not a number', () => {
    // Arrange
    const testingValue = 'Not a Number';
    const resetButton = debugElement.query(By.css('[data-testid="reset-button"]'));
    const resetInputFieldNativeEl = debugElement.query(By.css('[data-testid="reset-input"]')).nativeElement;

    // Act
    resetInputFieldNativeEl.value = testingValue;
    resetInputFieldNativeEl.dispatchEvent(new Event('input'));
    resetButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe(component.startCount.toString());
  });

  it('shows the start count', () => {
    const testingValue = 123;
    component.startCount = testingValue;
    component.ngOnChanges();
    fixture.detectChanges();

    const countOutput = debugElement.query(By.css('[data-testid="count"]'));
    expect(countOutput.nativeElement.textContent).toBe(testingValue.toString());
  });

  it('emits countChange events on increment', () => {
    // Arrange
    let actualCount: number | undefined;
    component.countChange.subscribe((count: number) => {
      actualCount = count;
    });
  
    // Act
    const incrementButton = debugElement.query(
       By.css('[data-testid="increment-button"]')
     );
     incrementButton.triggerEventHandler('click', null);
  
    // Assert
    expect(actualCount).toBe(1);
  });

  it('emits countChange events on decrement', () => {
    // Arrange
    let actualCount: number | undefined;
    component.countChange.subscribe((count: number) => {
      actualCount = count;
    });
  
    // Act
    const decrementButton = debugElement.query(
       By.css('[data-testid="decrement-button"]')
     );
     decrementButton.triggerEventHandler('click', null);
  
    // Assert
    expect(actualCount).toBe(-1);
  });

  it('emits countChange events on reset', () => {
    // Arrange
    let actualCount: number | undefined;
    const resetButton = debugElement.query(By.css('[data-testid="reset-button"]'));
    const resetInputFieldNativeEl = debugElement.query(By.css('[data-testid="reset-input"]')).nativeElement;
    component.countChange.subscribe((count: number) => {
      actualCount = count;
    });
  
    // Act
    resetInputFieldNativeEl.value = 123;
    resetInputFieldNativeEl.dispatchEvent(new Event('input'));
    resetButton.triggerEventHandler('click', null);
    fixture.detectChanges();
  
    // Assert
    expect(actualCount).toBe(123);
  });
});
