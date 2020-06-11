import Chest from '../chest';
import { circularSample, fixedSample } from '../samples/samples';
import { NORMAL, DEPENDENT, VARIANT, DEPENDENT_VARIANT } from '../coinTypes';

describe('Chest tests', () => {
  describe('Init tests', () => {
    it('defines a chest correctly and sets the coins correctly', () => {
      const chest = Chest(fixedSample);

      expect(chest.coins.length).toEqual(7);
    });

    it('throws an error when test sample is not valid', () => {
      const badSample = [
        {
          metadata: {
            persist: false
          },
          name: 'normal1',
          probability: 100,
          type: 'invalid'
        }
      ];
      expect(() => Chest(badSample)).toThrow(
        new Error(
          `The type on the test with the following test definition ${badSample[0]} is invalid`
        )
      );
    });

    it('throws an error when a circular dependency is found', () => {
      expect(() => Chest(circularSample)).toThrow(
        new Error(
          'The depends1 test has a dependency or is dependent on a test with a circular dependency in its configuration.'
        )
      );
    });
  });

  describe('createNodeGraph tests', () => {
    it('sets up node graph correctly', () => {
      const chest = Chest(fixedSample);
      const nodes = {
        normal2: [],
        v4: ['depends2'],
        v5: [],
        v6: [],
        depends: ['depends2'],
        depends2: ['normal2'],
        depends3: ['depends']
      };

      expect(chest.createNodeGraph().nodes).toEqual(nodes);
    });
  });

  describe('getCoin tests', () => {
    it('gets a coin from the chest', () => {
      const chest = Chest(fixedSample);

      const normalCoin = chest.getCoin('normal1');
      const multiCoin = chest.getCoin('v1');
      const dependentCoin = chest.getCoin('depends');
      const dependentMultiCoin = chest.getCoin('v4');
      const fakeCoin = chest.getCoin('fake');

      expect(normalCoin.name).toEqual('normal1');
      expect(normalCoin.probability).toEqual(100);
      expect(normalCoin.type).toEqual(NORMAL);

      expect(multiCoin.name).toEqual('v1');
      expect(multiCoin.probability).toEqual(100);
      expect(multiCoin.type).toEqual(VARIANT);

      expect(dependentCoin.name).toEqual('depends');
      expect(dependentCoin.probability).toEqual(100);
      expect(dependentCoin.type).toEqual(DEPENDENT);

      expect(dependentMultiCoin.name).toEqual('v4');
      expect(dependentMultiCoin.probability).toEqual(100);
      expect(dependentMultiCoin.type).toEqual(DEPENDENT_VARIANT);

      expect(fakeCoin).toBeNull();
    });
  });

  describe('flipCoins tests', () => {
    // sample used in these tests is fixed to avoid the true random behavior
    it('flips the coins and returns a "random" sample', () => {
      const chest = Chest(fixedSample);

      expect(chest.flipCoins()).toEqual([
        'normal1',
        false,
        'v1',
        'depends',
        'depends2',
        'depends3',
        'v4'
      ]);
    });
  });

  describe('mixCoins tests', () => {
    // sample used in these tests is fixed to avoid the true random behavior
    it('mixes the coins and returns a "random" sample', () => {
      const chest = Chest(fixedSample);
      const mixed = chest.mixCoins();

      const isActive = Object.values(mixed).map(coin => coin.active);

      expect(isActive).toEqual([
        true,
        false,
        true,
        false,
        false,
        true,
        false,
        false,
        true,
        false,
        false
      ]);
    });
  });
});
