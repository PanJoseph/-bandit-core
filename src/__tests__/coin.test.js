import {
  Coin,
  DependentCoin,
  MultivariantCoin,
  DependentMultivariantCoin,
  Variant,
  DependentVariant
} from '../coin';
import {
  NORMAL,
  MULTIVARIANT,
  DEPENDENT,
  DEPENDENT_MULTIVARIANT,
  VARIANT,
  DEPENDENT_VARIANT
} from '../coinTypes';

describe('Coin tests', () => {
  describe('Normal coin test', () => {
    let definition;
    let testCoin;

    beforeEach(() => {
      definition = {
        name: 'normal',
        probability: 10
      };

      testCoin = Coin(definition);
    });

    it('is defined correctly', () => {
      expect(testCoin.name).toEqual('normal');
      expect(testCoin.probability).toEqual(10);
      expect(testCoin.metadata).toEqual({});
      expect(testCoin.type).toEqual(NORMAL);
    });

    it('is not multivariant', () => {
      expect(testCoin.isMultivariant).toBeFalsy();
    });

    it('is not dependent', () => {
      expect(testCoin.isDependent).toBeFalsy();
    });

    it('does not have a frozen metadata property', () => {
      expect(Object.isFrozen(testCoin.metadata)).toBeFalsy();
    });

    it('returns a proper mapping', () => {
      expect(testCoin.createSamplingMapping()).toEqual([{ count: 10, value: 'normal' }]);
    });

    it('returns null for getDependent', () => {
      expect(testCoin.getDependent('fake')).toBeFalsy();
    });

    it('returns null for getVariant', () => {
      expect(testCoin.getVariant('fake')).toBeFalsy();
    });

    it('throws an error when a defintion without a name is passed', () => {
      expect(() => Coin({ probability: 10 })).toThrow();
    });

    it('throws an error when a defintion without a probability is passed', () => {
      expect(() => Coin({ name: 'test1' })).toThrow();
    });

    it('throws an error when a defintion with an invalid probability is passed', () => {
      expect(() => Coin({ name: 'test1', probability: 5000 })).toThrow();
    });
  });

  describe('Dependent coin test', () => {
    let definition;
    let testCoin;

    beforeEach(() => {
      definition = {
        dependsOn: [
          {
            active: true,
            behavior: true,
            name: 'name',
            probability: 10
          }
        ],
        name: 'dependent',
        probability: 10
      };

      testCoin = DependentCoin(definition);
    });

    it('is defined correctly', () => {
      expect(testCoin.dependsOn).toEqual([
        {
          active: true,
          behavior: true,
          name: 'name',
          probability: 10
        }
      ]);
      expect(testCoin.name).toEqual('dependent');
      expect(testCoin.probability).toEqual(10);
      expect(testCoin.metadata).toEqual({});
      expect(testCoin.type).toEqual(DEPENDENT);
    });

    it('is not multivariant', () => {
      expect(testCoin.isMultivariant).toBeFalsy();
    });

    it('is dependent', () => {
      expect(testCoin.isDependent).toBeTruthy();
    });

    it('does not have a frozen metadata property', () => {
      expect(Object.isFrozen(testCoin.metadata)).toBeFalsy();
    });

    it('defaults to an empty array for dependent list', () => {
      const noDependentTestCoin = DependentCoin({
        name: 'dependent',
        probability: 10
      });

      expect(noDependentTestCoin.dependsOn).toEqual([]);
    });

    it('returns a proper mapping', () => {
      expect(testCoin.createSamplingMapping()).toEqual([{ count: 10, value: 'dependent' }]);
    });

    it('returns the correct dependent for getDependent', () => {
      expect(testCoin.getDependent('name')).toEqual({
        active: true,
        behavior: true,
        name: 'name',
        probability: 10
      });
    });

    it('returns null when a dependent is not found with getDependent', () => {
      expect(testCoin.getDependent('fake')).toBeFalsy();
    });

    it('returns null for getVariant', () => {
      expect(testCoin.getVariant('fake')).toBeFalsy();
    });
  });

  describe('Multivariant coin test', () => {
    let definition;
    let testCoin;

    beforeEach(() => {
      definition = {
        name: 'multi',
        variants: [
          { name: 'variant1', probability: 10 },
          { name: 'variant2', probability: 20 },
          { name: 'variant3', probability: 30 }
        ]
      };

      testCoin = MultivariantCoin(definition);
    });

    it('is defined correctly', () => {
      expect(testCoin.name).toEqual('multi');
      expect(testCoin.metadata).toEqual({});
      expect(testCoin.type).toEqual(MULTIVARIANT);
      expect(testCoin.variants).toEqual([
        {
          metadata: {},
          name: 'variant1',
          probability: 10,
          type: VARIANT
        },
        {
          metadata: {},
          name: 'variant2',
          probability: 20,
          type: VARIANT
        },
        {
          metadata: {},
          name: 'variant3',
          probability: 30,
          type: VARIANT
        }
      ]);
    });

    it('is multivariant', () => {
      expect(testCoin.isMultivariant).toBeTruthy();
    });

    it('is not dependent', () => {
      expect(testCoin.isDependent).toBeFalsy();
    });

    it('does not have a frozen metadata property', () => {
      expect(Object.isFrozen(testCoin.metadata)).toBeFalsy();
    });

    it('can retrieve variants', () => {
      expect(testCoin.getVariant('variant1')).toEqual({
        metadata: {},
        name: 'variant1',
        probability: 10,
        type: VARIANT
      });

      expect(testCoin.getVariant('fake')).toBeFalsy();
    });

    it('returns a proper mapping', () => {
      expect(testCoin.createSamplingMapping()).toEqual([
        { count: 10, value: 'variant1' },
        { count: 20, value: 'variant2' },
        { count: 30, value: 'variant3' }
      ]);
    });

    it('returns null for getDependent', () => {
      expect(testCoin.getDependent('fake')).toBeFalsy();
    });
  });

  describe('DependentMultivariant coin test', () => {
    let definition;
    let testCoin;

    beforeEach(() => {
      definition = {
        name: 'depMulti',
        variants: [
          {
            dependsOn: [
              {
                active: true,
                behavior: true,
                name: 'name',
                probability: 10
              }
            ],
            name: 'variant1',
            probability: 10
          },
          { name: 'variant2', probability: 20 },
          { name: 'variant3', probability: 30 }
        ]
      };

      testCoin = DependentMultivariantCoin(definition);
    });

    it('is defined correctly', () => {
      expect(testCoin.name).toEqual('depMulti');
      expect(testCoin.metadata).toEqual({});
      expect(testCoin.type).toEqual(DEPENDENT_MULTIVARIANT);
      expect(testCoin.variants).toEqual([
        {
          dependsOn: [
            {
              active: true,
              behavior: true,
              name: 'name',
              probability: 10
            }
          ],
          metadata: {},
          name: 'variant1',
          probability: 10,
          type: DEPENDENT_VARIANT
        },
        {
          metadata: {},
          name: 'variant2',
          probability: 20,
          type: VARIANT
        },
        {
          metadata: {},
          name: 'variant3',
          probability: 30,
          type: VARIANT
        }
      ]);
    });

    it('is multivariant', () => {
      expect(testCoin.isMultivariant).toBeTruthy();
    });

    it('is dependent', () => {
      expect(testCoin.isDependent).toBeTruthy();
    });

    it('does not have a frozen metadata property', () => {
      expect(Object.isFrozen(testCoin.metadata)).toBeFalsy();
    });

    it('can retrieve variants', () => {
      expect(testCoin.getVariant('variant1')).toEqual({
        dependsOn: [
          {
            active: true,
            behavior: true,
            name: 'name',
            probability: 10
          }
        ],
        metadata: {},
        name: 'variant1',
        probability: 10,
        type: DEPENDENT_VARIANT
      });

      expect(testCoin.getVariant('fake')).toBeFalsy();
    });

    it('returns a proper mapping', () => {
      expect(testCoin.createSamplingMapping()).toEqual([
        { count: 10, value: 'variant1' },
        { count: 20, value: 'variant2' },
        { count: 30, value: 'variant3' }
      ]);
    });

    it('returns the correct dependent for getDependent', () => {
      expect(testCoin.getDependent('name')).toEqual({
        active: true,
        behavior: true,
        name: 'name',
        probability: 10
      });
    });

    it('returns null when a dependent is not found with getDependent', () => {
      expect(testCoin.getDependent('fake')).toBeFalsy();
    });
  });

  describe('Variant tests', () => {
    let definition;
    let testVariant;
    beforeEach(() => {
      definition = {
        name: 'variant',
        probability: 10
      };

      testVariant = Variant(definition);
    });

    it('is defined correctly', () => {
      expect(testVariant.name).toEqual('variant');
      expect(testVariant.probability).toEqual(10);
      expect(testVariant.metadata).toEqual({});
      expect(testVariant.type).toEqual(VARIANT);
    });

    it('throws an error when a defintion without a name is passed', () => {
      expect(() => Variant({ probability: 10 })).toThrow();
    });

    it('throws an error when a defintion without a probability is passed', () => {
      expect(() => Variant({ name: 'test1' })).toThrow();
    });

    it('throws an error when a defintion with an invalid probability is passed', () => {
      expect(() => Variant({ name: 'test1', probability: 5000 })).toThrow();
    });
  });

  describe('DependentVariant tests', () => {
    let definition;
    let testVariant;
    beforeEach(() => {
      definition = {
        name: 'variant',
        probability: 10
      };

      testVariant = DependentVariant(definition);
    });

    it('is defined correctly', () => {
      expect(testVariant.name).toEqual('variant');
      expect(testVariant.probability).toEqual(10);
      expect(testVariant.metadata).toEqual({});
      expect(testVariant.type).toEqual(DEPENDENT_VARIANT);
    });

    it('throws an error when a defintion without a name is passed', () => {
      expect(() => DependentVariant({ probability: 10 })).toThrow();
    });

    it('throws an error when a defintion without a probability is passed', () => {
      expect(() => DependentVariant({ name: 'test1' })).toThrow();
    });

    it('throws an error when a defintion with an invalid probability is passed', () => {
      expect(() => DependentVariant({ name: 'test1', probability: 5000 })).toThrow();
    });
  });
});
