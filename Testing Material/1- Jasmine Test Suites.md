1- Jasmine Test Suites

# Creating a test suite
Jasmine tests consists of one or more suites. A test suite is declared with a `describe` block:
``` javascript
describe('Suite description', () => {
	/* ... */
});
```
`describe` is a function that takes two arguments:
1. Human-readable string, usually the name of the function or class under test.
2. Function containing suite specifications.

* `describe` blocks can be nested within each other to divide them into logical sections, each `describe` block can host its own setup or teardown logic.

<hr>
<hr>

# Specifications
Each test suite consists of one or more specifications, each spec is declared with an `it` block:
``` javascript
describe('Suite description', () => {
	it('Spec description', () => {
		/* ... */
	});
	/* ... more specs ... */
});
```

<hr>
<hr>

# Structure of a test
Irrespective of the testing framework, the testing code should consists of three phases: **Arrange, Act and Assert.**

1. **Arrange** is the preparation and setup phase. Where we instantiate the class for example, set up dependencies or create spies and fakes.
2. **Act** is when we interact with the code under test. If we call a method or interact with HTML element.
3. **Assert** is where the code behaviour is checked and verified.

<hr>
<hr>

# Expectations
Expecations is normally where we verify if the code do what is does it intend or not, for example if `expectedValue !== actualValue` then we should call this test a failure. This can be done manually of course but Jasmine allows us to create expectations in easier and more concise manner: The `expect` function together with a Matcher.
``` javascript
const expectedValue = 5;
const actualValue = add(2, 3);
expect(actualValue).toBe(expectedValue);
```
When we pass the actual value to `expect` function, it returns an expectation object with methods for checking the actual value *as toBe* 
*  ***toBe*** is the simplest Matcher, internally it used strict equality operator `===`.
	*  Note: ***toBe*** Matcher will usually fail if the two object are not **identical**:
	*  ``` javascript
		// Fails, the two objects are not identical
		expect({ name: 'Linda' }).toBe({ name: 'Linda' });

		// Passes, the two objects are not identical but deeply equal
		expect({ name: 'Linda' }).toEqual({ name: 'Linda' });```	

<hr>
<hr>

# Efficient test suites
To avoid repeating the **Arrange** phase for example in every test where we know that all tests will share certain defined properties, Jasmine provides four functions that are helpful for this situation: `beforeEach, afterEach, beforeAll, afterAll` where the name describes when each one of these functions will run.