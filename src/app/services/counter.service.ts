import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private count: number = 0;
  private subject: BehaviorSubject<number>;

  constructor() { 
    this.subject = new BehaviorSubject(this.count);
  }

  public getCount(): Observable<number> {
    return this.subject.asObservable();
  }

  public increment(): void {
    this.count++;
    this.notify();
  }

  public decrement(): void {
    this.count--;
    this.notify();
  }

  public resetCount(input: number): void {
    if (!Number.isNaN(input)) {
      this.count = input;
      this.notify();
    }
  }

  private notify(): void {
    this.subject.next(this.count);
  }
}
