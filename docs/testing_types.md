---
id: testingtypes
title: Types of Coins
sidebar_label: Types of Coins
---

## Coin types

Bandit currently support three(and one secret) coin types, normal coins, multivariant coins & dependent coins. This guide will only talk about each type of test & how each is configured. If you want to see these tests in action head over to our [demos](demos.md)

### Normal coins

Normal coins represent your standard A/B tests. They involve a control and a single experiment and are the most straightforward to configure in a Bandit configuration.

_Example Configuration:_

```json
{
  "name": "redText",
  "probability": 50,
  "type": "normal"
}
```

In this example above we have a normal coin named `redText` that would be active 50% of the time.

### Multivariant coins

A Multivariant coin represents a multi-experiment A/B test, what I mean by that an A/B test except instead of a single experiment and control, you have multiple related experiments running against one another and potentially a control. Another name we like to use for these tests are A-to-Z tests.

_Example Configuration:_

```json
{
  "name": "textColor",
  "type": "multivariant",
  "variants": [
    { "name": "red", "probability": 25 },
    { "name": "blue", "probability": 25 },
    { "name": "purple", "probability": 25 },
    { "name": "green", "probability": 25 }
  ]
}
```

In this example we have a multivariant coin named `textColor`, it has 4 different variants, red, blue, purple & green, and all of them have a 25% chance of being active.

Notice that all these probabilities add up to 100, this is very intentional, Bandit currently does the probability for multivariant tests out of 100. If your probabilities add up to more than 100 you will not see expected behaviors in your tests. If your probabilities add up to less than 100 the remaining difference represents the probability none of your tests are active.

_Note:_ These tests are not to be confused with the similarly named multivariate tests which are hypothesis tests that test more than a single variable at once and find the most optimal combination. For information on how you can do multivariate testing with Bandit checkout the [Common testing patterns](common-testing-patterns.md) documentation.

### Dependent coin

A dependent coin represents an A/B test that can be active or not depending on the behavior of another test. This coin is meant to give the ability to test behavior similar to this:

    - You have three tests, A, B & C
    - A should never be active if B is active
    - B should always be active when C is not active

_Example Configuration:_

```json
[
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
		name 'yellowText',
		probability: 100,
		type: 'dependent',

	}
]
```

In this example we have two coins, `whiteBackground` which is a normal coin active 50% of the time & `yellowText` which is a dependent coin which is active 100% of the time(not really) and depends on `whiteBackground`

Now everyone knows yellow text on a white background is unreadable so the `yellowText` dependent coin is configured to have inactive(false) behavior when the `whiteBackground` coin is active(true)

With that said to know the true probability of the `yellowText` coin we need to take into account the above and below facts and then do some maths:

    - Whether a test is active or not is actually measured from 0 to 1
    - To determine that we take the probability of a test and divide it by 100

So `whiteBackground` would be `50/100 or .5` and `yellowText` would be `100/100 or 1`

Now to find the true probability of `yellowText` we need to multiple it's value by the value of `whiteBackground`

So `1 * .5` or `.5` is the true probability of `yellowText`

Keep this fact in mind when building your dependent tests out as the final analytics for your tests could surprise you otherwise.

### Secret testing type
