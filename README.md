# -bandit-core

Core library for the Bandit.js

Bandit.js is a dead simple, lightweight A/B testing library. Bandit's goal is to make A/B testing more accessible for Javascript application writers.

There are currently 3 different kinds of testing types Bandit supports, normal, multivariate & dependent A/B tests.

Bandit is primarily configuaration driven, A/B tests are all derived from a JSON configuration you provide when instanciating Bandit.

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

## Test types & Demos

#### Normal Example

The base A/B test for bandit are just normal A/B tests and in order to run them you need to pass a normal configuration in your sample.

Your test needs a unique name, probability (a natural number from 0-100) & the `normal` type.

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
const textColor = chest.redText.active ? 'red' : 'blue';
```

## API

## Math & Theory
