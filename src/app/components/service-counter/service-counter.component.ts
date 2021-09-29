import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CounterService } from 'src/app/services/counter.service';

@Component({
  selector: 'app-service-counter',
  templateUrl: './service-counter.component.html',
  styleUrls: ['./service-counter.component.scss']
})
export class ServiceCounterComponent {
  public count$: Observable<number>;
  
  constructor(private counterService: CounterService) {
    this.count$ = counterService.getCount();
  }

  public increment(): void {
    this.counterService.increment();
  }

  public decrement(): void {
    this.counterService.decrement();
  }

  public resetCount(newCount: number): void {
    if (!Number.isNaN(newCount)) {
      this.counterService.resetCount(newCount);
    }
  }
}
