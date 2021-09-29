Testing a component depending on a service is similar to a component with children. We need to decide whether we want to make the test purily a **unit test** by injecting a **fake/mock** service, or to make it an **integration test** by injecting a **real** service.

# Integration Test
If we decide to do an **integration test** it will be easier in our case since `CounterService` doesn't have much logic or a lot of children to take care of, nor it has some side effects that needs to be suppresed like an HTTP call. In fact the test in this case will look a lot similar to our `CounterComponent`:
``` javascript
describe('ServiceCounterComponent: integration test', () => {
  let component: ServiceCounterComponent;
  let fixture: ComponentFixture<ServiceCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceCounterComponent],
			// Note that we injected a real instance of the service not a fake
      providers: [CounterService],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('increments the count', () => {
   // Assert that by clicking increment button the count change like the CountComponent
  });

  it('decrements the count', () => {
    // Assert that by clicking decrement button the count change like the CountComponent
  });

  it('resets the count', () => {
    // Assert that by adding an input then clicking reset button the count change like the CountComponent
  });
});
```

There's nothing new here compared to `CounterComponent` except this line:
``` javascript
providers: [CounterService]
```
Just like a normal module we simply inject the service, so when the component under test requests it Angular then can inject it.

This integration test is correct but not sufficient to determine if the component is really calling the service or not, because we are only changing values on this single component. To make this test more robust, we need to test two components that both talk to this service, changing values from one component and then reading the outputs in the other components.

***
***

# Faking Service Dependency
Now to tackle making a **unit test** for this component instead of an **integration test** we need to learn about faking dependencies.

There's a lot of ways to fake a service and it's really up to your personal preference. I'll explain the simplest one from my point of view that doesn't have many problems.

The dependency we need to fake, `CounterService`, is a simple class annotated with `@Injectable()`. This is the outer shape of `CounterService`:
``` javascript
class CounterService {
  public getCount(): Observable<number> { /* … */ }
  public increment(): void { /* … */ }
  public decrement(): void { /* … */ }
  public resetCount(newCount: number): void { /* … */ }
  private notify(): void { /* … */ }
}
```

Since services usually return some sort of an `Observable` or use and `Observable` to push new values, our fake service will be a fake object literal with some fake methods that does what the real service do.

First of all, let's create a `BehaviourSubject` to act as our `Observable` we get from the service:
``` javascript
describe('ServiceCounterComponent: unit test', () => {
  /* … */
  let fakeCount$: BehaviorSubject<number>;

  beforeEach(async () => {
    fakeCount$ = new BehaviorSubject(0);
    /* … */
  });

  /* … */
});
```

Now to create the fake service:
``` javascript
const newCount = 123;
/* … */
fakeCounterService: Pick<CounterService, keyof CounterService> = {
  getCount(): Observable<number> {
    return fakeCount$;
  },
  increment(): void {
    fakeCount$.next(1);
  },
  decrement(): void {
    fakeCount$.next(-1);
  },
  reset(): void {
    fakeCount$.next(Number(newCount));
  },
};
```

As you can see, it's a simple object literal that resembles our `CounterService`. And it uses the `BehaviorSubject` that we just created to pass new values.

Also, our `fakeCounterService` is of kind `Pick<CounterService, keyof CounterService>`. That is because we want TypeScript to make sure that our `fakeCounterService` is of type `CounterService`.

So why we didn't just declare it like this: `fakeCounterService: CounterService`?
Unfortunetly this doesn't work. Angular will complain that private methods and properties are missing, and we can't add private methods and properties to an object literal:
``` javascript
Type '{ getCount(): Observable<number>; increment(): void; decrement(): void; reset(): void; }' is missing the following properties from type 'CounterService': count, subject, notify
```
However, by using **Pick and keyof** in this syntax `Pick<ComponentName, keyof ComponentName>` we can create a derived type of `CounterComponent` using only the public methods.

Now, one final thing is missing from our test and that is to **spy** on the methods in our `fakeCounterService`. We will do it the same way we installed a **spy** before on a method that already exist using `spyOn`:
``` javascript
spyOn(fakeCounterService, 'getCount').and.callThrough();
spyOn(fakeCounterService, 'increment').and.callThrough();
spyOn(fakeCounterService, 'decrement').and.callThrough();
spyOn(fakeCounterService, 'resetCount').and.callThrough();
```
Remember to add `.and.callThrough()` so the underlying fake methods are called.

Our test suite will now look like this:
``` javascript
describe('ServiceCounterComponent: unit test', () => {
  const newCount = 456;

  let component: ServiceCounterComponent;
  let fixture: ComponentFixture<ServiceCounterComponent>;

  let fakeCount$: BehaviorSubject<number>;
  let fakeCounterService: Pick<CounterService, keyof CounterService>;

  beforeEach(async () => {
    fakeCount$ = new BehaviorSubject(0);

    fakeCounterService = {
      getCount(): Observable<number> {
        return fakeCount$;
      },
      increment(): void {
        fakeCount$.next(1);
      },
      decrement(): void {
        fakeCount$.next(-1);
      },
      reset(): void {
        fakeCount$.next(Number(newCount));
      },
    };
    spyOn(fakeCounterService, 'getCount').and.callThrough();
    spyOn(fakeCounterService, 'increment').and.callThrough();
    spyOn(fakeCounterService, 'decrement').and.callThrough();
    spyOn(fakeCounterService, 'resetCount').and.callThrough();

    await TestBed.configureTestingModule({
      declarations: [ServiceCounterComponent],
      providers: [
        { provide: CounterService, useValue: fakeCounterService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the start count', () => {
    /* ... Find the count element and check it shows the correct count ...*/
	  
    expect(fakeCounterService.getCount).toHaveBeenCalled();
  });

  it('increments the count', () => {
    /* ... Find increment button element and click on it ...*/
	  
    fixture.detectChanges();

    /* ... Find the count element and check it shows the correct count ...*/
	  
    expect(fakeCounterService.increment).toHaveBeenCalled();
  });

  it('decrements the count', () => {
    /* ... Find decrement button element and click on it ...*/
	  
    fixture.detectChanges();

    /* ... Find the count element and check it shows the correct count ...*/
	  
    expect(fakeCounterService.decrement).toHaveBeenCalled();
  });

  it('resets the count', () => {
    /* Find input field and add to it the newCount then click on reset button */
	  
    fixture.detectChanges();

    /* ... Find the count element and check it shows the correct count ...*/
    expect(fakeCounterService.reset).toHaveBeenCalledWith(newCount);
  });
});
```

Finally we need to highlight that we need to tell the test suite to use our `fakeCounterService` and we done that in this line:
``` javascript
providers: [
	{ provide: CounterService, useValue: fakeCounterService }
],
```

Here we simply tell Angular that if the component asked for an instance of `CounterServicer`, to provide an instance of `fakeCounterService` instead of it, That's how it will use our `fakeCounterService`.