import applyCurrencyConverter from '../applyCurrencyConverter';

const applyA = coin => ({ ...coin, first: true });
const applyB = coin => ({ ...coin, second: false });
const applyC = coin => (coin.value ? { ...coin, value: coin.value * 3 } : coin);
const applyD = coin => ({ ...coin, first: 'appliedLast' });

let coins;

describe('applyCurrencyConverter tests', () => {
  beforeEach(() => {
    coins = [{ name: 'coin1', value: 10 }, { name: 'coin2' }, { name: 'coin3', value: 30 }];
  });

  it('returns the coins if no converters are passed', () => {
    expect(applyCurrencyConverter(coins)).toEqual([
      { name: 'coin1', value: 10 },
      { name: 'coin2' },
      { name: 'coin3', value: 30 }
    ]);
  });

  it('returns the coins if an empty array of converters are passed', () => {
    expect(applyCurrencyConverter(coins, ...[])).toEqual([
      { name: 'coin1', value: 10 },
      { name: 'coin2' },
      { name: 'coin3', value: 30 }
    ]);
  });

  it('applies one function passed to a set of coins and returns the result', () => {
    expect(applyCurrencyConverter(coins, applyA)).toEqual([
      { name: 'coin1', first: true, value: 10 },
      { name: 'coin2', first: true },
      { name: 'coin3', first: true, value: 30 }
    ]);
  });

  it('applies multiple functions ', () => {
    expect(applyCurrencyConverter(coins, applyA, applyB, applyC)).toEqual([
      { name: 'coin1', first: true, second: false, value: 30 },
      { name: 'coin2', first: true, second: false },
      { name: 'coin3', first: true, second: false, value: 90 }
    ]);
  });

  it('applies functions in backwards order of converters passed', () => {
    expect(applyCurrencyConverter(coins, applyD, applyB, applyC, applyA)).toEqual([
      { name: 'coin1', first: 'appliedLast', second: false, value: 30 },
      { name: 'coin2', first: 'appliedLast', second: false },
      { name: 'coin3', first: 'appliedLast', second: false, value: 90 }
    ]);
  });
});
