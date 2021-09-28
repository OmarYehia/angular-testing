import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnChanges {
  @Input()
  public startCount: number = 0;
  
  @Output()
  public countChange = new EventEmitter<number>();

  public count: number = 0;

  public ngOnChanges(): void {
    this.count = this.startCount;
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
    this.countChange.emit(this.count);
  }
}
