# -bandit-core

Core library for the Bandit.js

Bandit.js is a simple, lightweight A/B testing library. Bandit's goal is to make A/B testing more accessible for application developers.

There are currently 3 different kinds of testing types Bandit supports, normal, multivariate & dependent A/B tests.

Bandit is primarily configuaration driven, A/B tests are all derived from a JSON/Javascript configuration you provide when instanciating Bandit.

## Table of Contents

- Installation & usage
- Testing types
- Demos
- API
- Maths & Theory

## Installation & usage

#### Install via npm:

`npm i @banditjs/bandit-core`

#### Install via yarn:

`yarn install @banditjs/bandit-core`

## Coin types & Demos

### Normal coins

Normal coins represent your standard A/B tests. They involve a control and a single experiment and are the most straightforward to configure in a Bandit configuration.

Your coin needs a unique name, probability (a natural number from 0-100) & the `normal` type.

**Example**

```javascript
import { Chest } from '@bandit/bandit-core';

const sample = [
  {
    name: 'redText',
    probability: 50,
    type: 'normal'
  }
];

const chest = Chest(sample).mixCoins();
const textColor = chest.redText.active ? 'red' : 'blue';
```

In this example above we have a normal coin named `redText` that would be active 50% of the time. When it is active our textColor would be set to red otherwise it would be set to blue.

### Multivariant coins

A Multivariant coin represents a multi-experiment A/B test, which is an A/B test where you have multiple related experiments running against one another and potentially a control. Another name we like to use for these tests are A-to-Z tests.

**Example**

```javascript
import { Chest } from '@bandit/bandit-core';

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
let textColor = 'white';

if (chest.red.active) {
  textColor = 'red';
} else if (chest.blue.active) {
  textColor = 'red';
} else if (chest.purple.active) {
  textColor = 'purple';
} else if (chest.green.active) {
  textColor = 'green';
}
```

In this example we have a multivariant coin named `textColor`, it has 4 different variants, red, blue, purple & green, and all of them have a 25% chance of being active.

Bandit currently does the probability for multivariant tests out of 100. If your probabilities add up to more than 100 you will not see expected behaviors in your tests. If your probabilities add up to less than 100 the remaining difference represents the probability none of your tests are active.

### Dependent coin

A dependent coin represents an A/B test that can be active or not depending on the behavior of another test. This coin is meant to give the ability to test behavior similar to this:

    - You have three tests, A, B & C
    - A should never be active if B is active
    - B should always be active when C is not active

**Example**

```javascript
import { Chest } from '@bandit/bandit-core';

const sample = [
	{
		name: 'whiteBackground',
		probability: 50
		type: 'normal'
	},
	{
		dependsOn: [
      {
        active: true,
        behavior: false,
        name: 'whiteBackground'
      }
    ],
		name: 'yellowText',
		probability: 100,
		type: 'dependent',

	}
]

const chest = Chest(sample).mixCoins();
const background = chest.whiteBackground.active ? 'white' : 'black';
const textColor = chest.yellowText.active ? 'yellow' : 'red'
```

In this example we have two coins, `whiteBackground` which is a normal coin active 50% of the time & `yellowText` which is a dependent coin which is active 100% of the time(sort of) and is dependent on the `whiteBackground` coin

Now everyone knows yellow text on a white background is unreadable so the `yellowText` dependent coin is configured to have inactive(false) behavior when the `whiteBackground` coin is active (true)

When the `whiteBackground` coin is active the background color is `white` and the `yellowText` coin is inactive so the textColor is it's default color `red`. Otherwise when the `whiteBackground` coin is inactive the `yellowText` coin is guarnteed to be active so the background is it's default color `black` and the text color is `yellow`.

**Math:**

With that said to know the true probability of the `yellowText` coin we need to take that constraint into account:

The `whiteBackground` coin would be `50/100 or .5` and `yellowText` would be `100/100 or 1`

Now to find the true probability of `yellowText` we need to multiply it's value by the value of `whiteBackground`

So `1 * .5` or `.5` is the true probability of `yellowText`

Keep this fact in mind when building your dependent tests out as you need to do a little math to ensure your samplingf is being done correctly.
