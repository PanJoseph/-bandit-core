# Demos

### Normal Example

The base A/B test for bandit are just normal A/B tests and in order to run them you need to pass a normal configuration in your sample.

Your test needs a unique name, probability (a natural number from 0-100) & the `normal` type.

In this sample we have a test, "redText", that will be active 50% of the time.

When it is true the color of the text changes to red, otherwise it is blue.

<div v-bind:style="{backgroundColor: '#f8f8f8', color: window.normalColor, textAlign: 'center'}">
  <p>This text changes based on the test above</p>
  <p>Reload the page and there's a 50% chance the text color will change</p>
  <p>The current color is <b v-bind:style="{color: window.normalColor}">{{window.normalColor}}</b></p>
</div>

**Javascript**

```javascript
const { Chest } = require('Bandit');

const sample = [
  {
    name: 'redText',
    probability: 50,
    type: 'normal'
  }
];

const chest = Chest(sample).mixCoins();

window.normalColor = chest.redText.active ? 'red' : 'blue';
```

**HTML**

```html
<div v-bind:style="{backgroundColor: '#f8f8f8', color: window.normalColor, textAlign: 'center'}">
  <p>This text changes based on the test above</p>
  <p>Reload the page and there's a 50% chance the text color will change</p>
  <p>
    The current color is <b v-bind:style="{color: window.normalColor}">{{window.normalColor}}</b>
  </p>
</div>
```

**Note: This HTML is Vue**

### Multivariant example

Sometime you'll want to run a single test and pick from multiple options, that's where multivariant tests come into play. They allow you to set multiple variants of the outcome of your test and guarantee at most one is every true.

Your test needs a unique name, the `multivariant` type & an array of "variants". Each one of these variants should also have a unique name & a probability (a natural number from 0-100).

In this sample we have one test, "textColor", that has 4 variants, red, green, purple & green.

Whichever variant is selected will be the color of the text in our message below.

<div v-bind:style="{backgroundColor: '#f8f8f8', color: window.multiColor, textAlign: 'center'}">
  <p>This text changes based on the test above</p>
  <p>Reload the page and there's a 50% chance the text color will change</p>
  <p>
    The current color is <b v-bind:style="{color: window.multiColor}">{{window.multiColor}}</b>
  </p>
</div>

**Javascript**

```javascript
const { Chest } = require('Bandit');

const sample = [
  {
    name: 'textColor',
    type: 'multivariant',
    variants: [
      { name: 'red', probability: 25 },
      { name: 'blue', probability: 25 },
      { name: 'purple', probability: 25 },
      { name: 'green', probability: 25 }
    ]
  }
];

const chest = Chest(sample).mixCoins();

if (chest.red.active) window.multiColor = 'red';
if (chest.blue.active) window.multiColor = 'blue';
if (chest.purple.active) window.multiColor = 'purple';
if (chest.green.active) window.multiColor = 'green';
```

**HTML**

```html
<div v-bind:style="{backgroundColor: '#f8f8f8', color: window.multiColor, textAlign: 'center'}">
  <p>This text changes based on the test above</p>
  <p>Reload the page and there's a 75% chance it will change</p>
  <p>Current color is {{window.multiColor}}</p>
</div>
```

**Note: This HTML is Vue**

### Dependent Example

Sometimes you'll want to run two tests where the outcome of one of the tests is dependent on the other. In this case we provide a dependent test case for your usage.

Your test needs a unique name, the `dependent` type, a probability (a natural number from 0-100) & a `dependsOn` array. The `dependsOn` array represents all the test cases your test is dependent on and must have 4 properties:

- `name`: The name of the test the dependent test case is relient on
- `active`:
