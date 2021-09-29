2- Testing Individual Components

# TestBed
Many tasks needs are necessary to render a component. Normally the Angular compiler compiles the JavaScript Code, then an instance of the component is created, dependencies are resolved nad injected, inputs are set, and finally the template is rendered in DOM.
TestBed simply creates and configures the Angular environment so we don't do all the above steps manually.

<hr>
<hr>

# Configuring the Testing Module
TestBed comes with a testing module which is configured like any normal module in the application:
``` javascript
TestBed.configureTestingModule({
	imports: [/*...*/],
	declarations: [/*...*/],
	providers: [/*...*/]
}); 
```
Now we need to declare the necessary parts for the Module to work, for example if we are testing the `CounterComponent` we need to declare that we are using that component in our tests:
``` javascript
TestBed.configureTestingModule({
	declarations: [ CounterComponent ],
});
```
Finally one more step is needed for the component to be rendered, we need to instruct the Angular compiler to translate the files into JavaScript code using `compileComponents()` function.
``` javascript
TestBed.compileComponent();
```
Since `configureTestingModule()` function returns a TestBed again, we usually chain these two functions as follows:
``` javascript
await TestBed.configureTestingModule({
	declarations: [ CounterComponent ],
})
.compileComponents();
```
* Note that we put an `await` in front of the TestBed as `compileComponents()` returns a promise that we need to wait to be resolved.

<hr>
<hr>

# Rendering the Component
After configuring the TestBed in the previous step, we can now render the component under test using `createComponent`:
``` javascript
const fixture = TestBed.createComponent(CounterComponent);
```
The `createComponent` returns a `ComponentFixture` with useful testing method that will be tackled later.

`createComponent` renders the component into a `div` element in DOM but it's missing the dynamic HTML elements, for example `{{ count }}` if we are talking about the `CounterComponent`. This is mainly because the testing module has no automatic change detections. So everytime we make a change to any dynamic HTML value, we need to explicitly tell Angular to re-render this component so it can be tested properly using `detectChanges()` on the fixture.
``` javascript
fixture.detectChanges();
```

<hr>
<hr>

# The Configured Test
Up so far what we done in the testing component, this is usually what's generated when generating a new component:
``` javascript
describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    fixture.detectChanges();
  });

  it('…', () => {
    /* … */
  });
});
```
We make the fixture as a global variable (in suite context) so we can access it in any specification, we wi'll talk about the fixture next.

<hr>
<hr>

# ComponentFixture (component & debugElement)
`TestBed.createFixture(CounterComponent)` returns an instance of `Component Fixture`. Simply we can say that this `ComponentFixture` contains our **component (.ts file)** and our **template (.html file)**. We will talk about how we can access each.

## Component
To access the component (.ts file) we can simply destructure the fixture or directly access `componentInstance` property which is found in the fixture:
``` javascript
const component = fixture.componentInstance;
// Or
const { componentInstance } = fixture;
```
The component instance is mainly used to set inputs or subscribe to outputs, for example:
``` javascript
const component = fixture.componentFixture(CounterComponent);
// Set input
component.startCount = 10;
// Subscribe to output
component.countChange.subscribe((count) => {
	/* ... Do something ... */
});
```

<hr>

## debugElement
`debugElement` is the abstraction of the template file in DOM, it has many useful methods to navigate throught DOM elements to get properties, children, childNodes ... etc. 
``` javascript
const debugElement = fixture.debugElement;
// Or
const { debugElement } = fixture;
```
We can access the native HTML element through it, this native element is useful later if we decide to test what the user is seeing on the screen.
``` javascript
const { debugElement } = fixture;
const { nativeElement } = debugElement;
console.log(nativeElement.tagName);
console.log(nativeElement.textContent);
console.log(nativeElement.innerHTML);
```

<hr>
<hr>

# Example: First sepecification (increment count)
``` javascript
it('increments the count', () => {
	 // Arrange: Already done in beforeEach()
    // Act: Click on the increment button
   // Assert: Expect that the displayed count now reads “1”.
});
```

## Querying the DOM with test ids
Every DebugElement features the methods `query` and `queryAll` for finding descendant elements (children, grandchildren and so forth).
* `query` returns the first descendant that meets a certain condition.
* `queryAll` returns an array of all matching elements.
* Both methods expect a predicate (function jusding each element and returning true of false)
* Both methods return a `debugElement` so we can do anything on them again

### By.css('...')
This is a predicate function provided by Angular to query the DOM using **CSS selectors**
``` javascript
const { debugElement } = fixture;
// Find the first h1 element
const h1 = debugElement.query(By.css('h1'));
// Find all elements with the class .user
const userElements = debugElement.queryAll(By.css('.user'));
```
Finding an element using CSS class should not be done to avoid tight coupling between the test and the template, because we can change element type or the CSS classes on it any time.

This is why we need to agree on a certain identifier to be placed on the tested elements to solely identify them for the sake of the test and not used for anything else.

The convention is to use an attribute on the HTML element called `data-testid="..."` and use this attribute to find the component in our tests:
``` html
<button (click)="increment()" data-testid="increment-button">Increment</button>
```
``` javascript
const incrementButton = debugElement.query(By.css('[data-testid="increment-button"]'));
```

<hr>

## Triggering Events
`debugElement` has a useful method for firing events: `triggerEventHandler`. This method calls all event handlers for a given event type like `click`. As a second parameter, it expects a fake `event object` that is passed to the handlers:
``` javascript
incrementButton.triggerEventHandler('click', {
  /* … Event properties … */
});

/* If the method doesn't access the $event object i.e. increment() 
 * not increment($event), therefore we don't need to pass an event
 * object as a second parameter
*/
incrementButton.triggerEventHandler('click', null);
```

<hr>

## Expectations (Assertions)
In the previous phase -triggering an event- we completed the **Act Phase**. Now we need to assert that the count was increased from 0 to 1.

We need to find the element that displays the count and then check if its value change from 0 to 1.

``` html
<span data-testid="count">{{ count }}</span>
```

We gave the span `data-testid` attribute or whatever attribute we agree on so we can access it using the `debugElement`.
``` javascript
const countOutput = debugElement.query(By.css('[data-testid]=count'));
```

Unfortunately, `debugElement` doesn't have any method to directly read the text of the element, but as we know we can get the native HTML element from the debugElement using the `nativeElement` property:
``` javascript
expect(countOutput.nativeElement.textContent).toBe('1');
```

Now our testing file should be similar to this:
``` javascript
describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let debugElement: DebugElement;

  // Arrange
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  it('increments the count', () => {
    // Act
    const incrementButton = debugElement.query(
      By.css('[data-testid="increment-button"]')
    );
    incrementButton.triggerEventHandler('click', null);

    // Assert
    const countOutput = debugElement.query(
      By.css('[data-testid="count"]')
    );
    expect(countOutput.nativeElement.textContent).toBe('1');
  });
});
```

Note that this test will fail with the following output:
``` CounterComponent increments the count FAILED
  Error: Expected '0' to be '1'.
 ```
 
 So what did we do wrong? We missed an important step mentioned earlier, that in the testing environment Angular doesn't automatically detect dynamic changes to the HTML file. That's why we need to call `detectChanges()` on the fixture in order to re-render the HTML.
 
 The test suite now will work and will look as follows:
 ``` javascript
describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let debugElement: DebugElement;

  // Arrange
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  it('increments the count', () => {
    // Act
    const incrementButton = debugElement.query(
      By.css('[data-testid="increment-button"]')
    );
    incrementButton.triggerEventHandler('click', null);
    // Re-render the Component
    fixture.detectChanges();

    // Assert
    const countOutput = debugElement.query(
      By.css('[data-testid="count"]')
    );
    expect(countOutput.nativeElement.textContent).toBe('1');
  });
});
```

<hr>

## Testing helpers
Testing helpers are used to reduce reduntant code. It's usually some functions that contain common logic that is shared between all testing specifications.
[Under Construction]

<hr>

## Testing user inputs
Angular forms either **Template-Driven or Reactive Forms** cannot observe value changes directly, we can't simply change the `value` attribute of an input field and expect Angular to detect this change. Instead, Angular listens for an **input event** that the browsers fires when a value changes.

**DebugElements** has a useful method for this case which is `dispatchEvent()`, with this method we will fake an input event on that input field:
``` javascript
const resetInputNativeElement = debugElement.query(By.css('[data-testid="reset-input"]')).nativeElement;
resetInputNativeElement.value = '123';
resetInputNativeElement.dispatchEvent(new Event('input'));
```

<hr>

## Testing Component Inputs
We can simply test inputs to our component since we have an instance of that component:
``` javascript
const component = fixture.componentInstance;
component.startCount = 123;
```

It's good practice not to change the input value within a component, An input property should always reflect the data passed to it by the parent component.

That's why the `CounterComponent` has an individual property called `count` which is changed instead of the `startCount` input property during **onChange** cycle. `ngOnChanges` is called whenever a 'data-bound property' changes, including inputs.
``` javascript
public ngOnChanges(): void {
	this.count = this.startCount;
};
```

So to test our input to the component:
``` javascript
it('shows the start count', () => {
	component.startCount = 123;
	fixture.detectChanges(); // Remember to call to apply the changes to our HTML
	
	const countOutput = debugElement.query(By.css('[data-testid="count"]'));
	expect(countOutput.nativeElement.textContent).toBe('123');
});
```

This test looks okay at the first glance, however it will fail with the following error:
```Expected '0' to be '123'.```
So what went wrong this time? This time we need to call `ngOnChanges()` directly because in the testing environment Angular doesn't automatically call it after setting the input. The test now will look like this:
``` javascript
it('shows the start count', () => {
	component.startCount = 123;
	component.ngOnChanges();
	fixture.detectChanges(); // Remember to call to apply the changes to our HTML
	
	const countOutput = debugElement.query(By.css('[data-testid="count"]'));
	expect(countOutput.nativeElement.textContent).toBe('123');
});
```

<hr>

## Testing Components Outputs
Outputs are not a user-facing feature, but a vital part of the public Component API. Technically, Outputs are Component instance properties. A unit test must inspect the Outputs thoroughly to proof that the Component plays well with other Components.

The `CounterComponent` has an output named `countChange`. Whenever the count changes, the `countChange` Output emits the new value.

The specification will look something like this:
``` javascript
it('emits countChange events on increment', () => {
  // Arrange
  let actualCount: number | undefined; // The actual count is usually a number but if the countChange was never fired, then it will be undefined
  component.countChange.subscribe((count: number) => {
	  /*
	   * We choose not to put the expect() in here because if
	   * there was something wrong with the event, this expect
	   * would never be called, and the test will pass
	   */
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
```