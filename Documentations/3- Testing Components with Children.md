3- Testing Components with Children

There are two fundamental ways for testing components with children:

1.  **Unit testing** using **Shallow Rendering** where the child components are never rendered.
2.  **Integration Testing** using **Deep Rendering** where the child components are rendered.

# Shallow vs. deep rendering

In **Counter Example** application, the `AppComponent` contains some child components as `CounterComponent` for example.

A **unit test** for `CounterComponent` doesn't render these children, the host elements *i.e. app-counter* for example are rendered, but they remain empty. The `AppComponent` doesn't care about the inner working of its children, it only cares if the wiring is done properly and inputs/outputs are passed correctly from/to it.

An **integration test** for `AppComponent` render its children, these host elements as the `CounterComponent` are filled with the outputs and details of their respective components

* * *

* * *

# Unit testing a component with children

Remember that writing a unit test for a component with children means that we're not going to render the child components. We are only going to test whether the host elements are present or not and inputs/outputs on them are working.

The test will be similar to the `CounterComponent` that we tested in the previous chapter, but will need some adjustments later on:

```javascript
describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
```

This test do nothing, it acts as a **smoke test** which comes if you generate any component. It's only purpose to see if there's something wrong with the testing setup or not.

Starting from Angular 9, this test will pass but will generate some errors, prior to Angular 9, the test will fail because of the same errors:

```
'app-counter' is not a known element:
1. If 'app-counter' is an Angular component, then verify that it is part of this module.
2. If 'app-counter' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.

Can't bind to 'startCount' since it isn't a known property of 'app-counter'.
```

These errors mean that Angular doesn't understand the custom elements as `<app-counter>` or any child elements because we have not declared those Components that match these selectors. As we can see, the error points to **two** possible solutions:
1. Delcare child components in the testing module. **This turns the test into an integration test.**
2. Tell Angular to ignore these errors. **This turns the test into a unit test.**

Since we are writing a unit test now, we are choosing the second option. It states that we need to add `CUSTOM_ELEMENTS_SCHEMA` to the `schemas` property of the `@ngModule` directive. However since the elements in question are not Web Components, they are components in our application we will use another schema that allows any property on any element: `NO_ERRORS_SCHEMA`
``` javascript
await TestBed.configureTestingModule({
  declarations: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();
```

By doing this, the smoke test passes without the earlier errors.

Another specification we can write is a spec to check if the child component tag got placed in the DOM or not. Remember we are only checking for the tag here and not render the child element because we are still doing a unit test.
``` javascript
it('renders an independent counter', () => {
  const { debugElement } = fixture;
  const counter = debugElement.query(By.css('app-counter'));
  expect(counter).toBeTruthy();
});
```

The next spec we are doing is to check if the input is passed correctly or not to the child. In a unit test with shallow rendering, `properties` property found on `DebugElement` contains the Inputs of a child Component. First, we find app-counter to obtain the corresponding `DebugElement`. Then we check the Input value, `properties.startCount`.
``` javascript
const { debugElement } = fixture;
const counter = debugElement.query(By.css('app-counter'));
expect(counter.properties.startCount).toBe(5);
```

Finally we will test if the component recieves an output correctly or not from the child component. This is what's in the template and .ts file:
``` typescript
// Template
<app-counter
  [startCount]="5"
  (countChange)="handleCountChange($event)"
></app-counter>

// AppComponent 
export class AppComponent {
  public handleCountChange(count: number): void {
    console.log('countChange event from CounterComponent', count);
  }
}
```
The `handleCountChange` is simply a normal event that use the `(event)=handler($event)` syntax that is commonly used across Angular applications. And for the sake making the application simple it only logs the output it recieves from the child in the console.

To write a test to check this behavior we need to do two things:
1. **Act:** Find the child component and emit a value using its `countChange`.
2. **Assert:** Check that `console.log` has been called.

In this example, we can simulate the output using `triggerEventHandler` method:
``` javascript
const { debugElement } = fixture;
const counter = debugElement.query(By.css('app-counter'));
counter.triggerEventHandler('countChange', 5);
```
 
Remember that `triggerEventHandler` takes two parameters, the first is the event we are triggering and the second is an object resembling the event. Since it is a custom event and `countChange` output has a type of `EventEmitter<number>`, we can simply use the testing number '5' for testing purpose.
 
So now how do we check if console has been called or not? Let's talk about **spies** first.

## Spies
In its simplest form, a spy is a function that records its calls. For each call, it records the function parameters. Using this record, we later assert that the spy has been called with particular input values.

For example, we declare in a spec: “Expect that the spy has been called two times with the values **foo** and **boo**, respectively.”

We have two ways of creating a spy:
1. Creating a standalone spy `jasmine.createSpy`. Which simply can replace any function we are trying to test. This approach will be discussed later on.
2. Spying on existing methods using `spyOn`.
``` javascript
spyOn(Object, 'method_name');
// Example
spyOn(console, 'log');
```

We can specify the expected return value from a spy using chained methods on the spy:
``` javascript
spyOn(console, 'log').and.returnValue(expectedValue);
```
This will be used in later examples that we call other API or methods and we don't want to make an actual API call, but we don't need to specify a return value for a simple method like `log`.

So back to our example, the spec will look something like this now:
``` javascript
it('listens for count changes', () => {
	// Arrange
  spyOn(console, 'log');
  const { debugElement } = fixture;
	const counter = debugElement.query(By.css('app-counter'));
  const count = 5;
	
	// Act
  counter.triggerEventHandler('countChange', count);
	
	// Assert
  expect(console.log).toHaveBeenCalledWith(
    'countChange event from CounterComponent',
    count,
  );
});
```

<hr>
<hr>

# Faking Child Components
There is a middle ground between a naive unit test and an integration test. Instead of working with empty custom elements, we can render fake child Components. 
``` javascript
@Component({
  selector: 'app-counter',
  template: '',
})
class FakeCounterComponent implements Partial<CounterComponent> {
  @Input()
  public startCount = 0;

  @Output()
  public countChange = new EventEmitter<number>();
}
```

In this approach we tell Angular that the `<app-counter>` element is a `FakerCounterComponent` which is a partial `CounterComponent`. This approach is okay but have some problems:
1. Time consuming. Imagine that your parent component has a lot of children and each child has its properties.
2. Not robust enough, this approach will just replace `<app-counter>` selector with the `FakeCounterComponent` instead of `CounterComponent`. We might later on in the application change the name of that selector in `CounterComponent` to be `<app-individual-counter>` for example.

There's another approach. A very powerful library called [`ng-mocks`](https://github.com/ike18t/ng-mocks). Among other things, ng-mocks helps creating fake Components to substitute children. The MockComponent function expects the original Component and returns a fake that resembles the original.

Instead of creating a `FakeCounterComponent`, we call `MockComponent(CounterComponent)` and add the fake to the testing Module.
``` javascript
import { MockComponent } from 'ng-mocks';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [HomeComponent, MockComponent(CounterComponent)],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
});
```

Our full testing code will look something like this now:
``` javascript
describe('AppComponent with ng-mocks', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let counter: CounterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, MockComponent(CounterComponent)],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const counterEl = fixture.debugElement.query(
      By.directive(CounterComponent)
    );
    counter = counterEl.componentInstance;
  });

  it('renders an independent counter', () => {
    expect(counter).toBeTruthy();
  });

  it('passes a start count', () => {
    expect(counter.startCount).toBe(5);
  });

  it('listens for count changes', () => {
    spyOn(console, 'log');
    const count = 5;
    counter.countChange.emit(count);
    expect(console.log).toHaveBeenCalledWith(
      'countChange event from CounterComponent',
      count,
    );
  });
});
```

`ng-mocks` is a very powerful library. That comes with a lot of options in even configuring tests to make them faster. Worth checking.