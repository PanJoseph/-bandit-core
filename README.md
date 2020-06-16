# -bandit-core

Core library for the Bandit.js

Bandit.js is a simple, lightweight A/B testing library. Bandit's goal is to make A/B testing more accessible for application developers.

There are currently 3 different kinds of testing types Bandit supports, normal, multivariate & dependent A/B tests.

Bandit is primarily configuaration driven, A/B tests are all derived from a JSON/Javascript configuration you provide when instanciating Bandit.

## Installation

`npm i @banditjs/bandit-core`

## Coin types & Demos

### Normal coins

Normal coins represent your standard A/B tests. They involve a control and a single experiment and are the most straightforward to configure in a Bandit configuration.

Your coin needs a unique name, probability (a natural number from 0-100) & the `normal` type.

**Example**

```javascript
import { Chest } from '@bandit/bandit-core';

const definitions = [
  {
    name: 'redText',
    probability: 50,
    type: 'normal'
  }
];

const sample = Chest(definitions).mixCoins();
const textColor = sample.redText.active ? 'red' : 'blue';
```

In this example above we have a normal coin named `redText` that would be active 50% of the time. When it is active our textColor would be set to red otherwise it would be set to blue.

### Multivariant coins

A Multivariant coin represents a multi-experiment A/B test, which is an A/B test where you have multiple related experiments running against one another and potentially a control. Another name we like to use for these tests are A-to-Z tests.

**Example**

```javascript
import { Chest } from '@bandit/bandit-core';

const defintiions = [
  {
    name: 'textColor',
    type: 'multivariant',
    variants: [
      { name: 'red', probability: 10 },
      { name: 'blue', probability: 10 },
      { name: 'purple', probability: 10 },
      { name: 'green', probability: 10 }
    ]
  }
];

const sample = Chest(defintiions).mixCoins();

// If any of the variants end up active take the name which is the text color to use otherwise default to white
let activeVariant = sample.textColor.variants.filter(variant => variant.active);
let textColor = activeVariant.length > 0 ? activeVariant[0].name : 'white';
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

const defintiions = [
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

const sample = Chest(definitions).mixCoins();
const background = sample.whiteBackground.active ? 'white' : 'black';
const textColor = sample.yellowText.active ? 'yellow' : 'red'
```

In this example we have two coins, `whiteBackground` which is a normal coin active 50% of the time & `yellowText` which is a dependent coin which is active 100% of the time(sort of) and is dependent on the `whiteBackground` coin

Now everyone knows yellow text on a white background is unreadable so the `yellowText` dependent coin is configured to have inactive(false) behavior when the `whiteBackground` coin is active (true)

When the `whiteBackground` coin is active the background color is `white` and the `yellowText` coin is inactive so the textColor is it's default color `red`. Otherwise when the `whiteBackground` coin is inactive the `yellowText` coin is guarnteed to be active so the background is it's default color `black` and the text color is `yellow`.

#### Math

With that said to know the true probability of the `yellowText` coin we need to take that constraint into account:

The `whiteBackground` coin would be `50/100 or .5` and `yellowText` would be `100/100 or 1`

Now to find the true probability of `yellowText` we need to multiply it's value by the value of `whiteBackground`

So `1 * .5` or `.5` is the true probability of `yellowText`

Keep this fact in mind when building your dependent tests out as you need to do a little math to ensure your samplingf is being done correctly.

#### Circular Dependencies

Bandit does not handle circular dependencies in dependent coins, upon initalizing a chest Bandit will check the definition provided and throw an error if any circular dependencies are found.

## Currency converters

A currency converter is a function that is applied to every coin in a chest after it has been mixed and sampled from. They allow you to apply last minute logic to a sample before it is returned back to you

These converters are applied via a call to `Chest.mixCoins(...currencyConverters)` where currencyConverters is an array of functions to apply in order from last to first applied. These functions must take in a

### Demo

You want to tag some extra metadata on your tests in order to run some analytics on the distribution of what tests were active across browsers.

```javascript
import { Chest } from '@bandit/bandit-core';

const browserName = // Some calculation of what browser currently in use
const browserTrackingConverter = coin => coin.metadata.browser = browserName

const defintiions = [
   {
    name: 'lucky',
    probability: 50,
    type: 'normal'
  },
  {
    name: 'textColor',
    type: 'multivariant',
    variants: [
      { name: 'red', probability: 25 },
      { name: 'blue', probability: 25 }
    ]
  }
];

const sample = Chest(defintiions, [browserTrackingConverter]).mixCoins();

// Sample could look similar to
[
  {
    active: false,
     metadata: {
      browser: 'Microsoft Edge'
    },
    name: 'lucky',
    probablility: 50,
    type: 'NORMAL'
  },
  {
    metadata: {
      browser: 'Microsoft Edge'
    },
    name: 'textColor',
    type: 'MULTIVARIANT',
    variants: [
      {
    active: false,
    name: 'red',
    probability: 25,
    type: 'VARIANT'
  },
  {
    active: true,
    name: 'blue',
    probability: 25,
    type: 'VARIANT'
  }
    ]

  }
]
```

### isActive converter

By default the first converted always applied is the `isActive` converter, it applies a boolean `active` property to all coins & variants in the sample depending on whether or not they were flipped active when mixing the coins in the chest. This includes flipping dependent coins active and inactive depending on the results of their dependents.
