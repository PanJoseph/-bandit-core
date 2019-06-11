import { Coin, DependentCoin, MultivariantCoin, DependentMultivariantCoin } from '../coin';
import {
  NORMAL,
  MULTIVARIANT,
  DEPENDENT,
  DEPENDENT_MULTIVARIANT,
  VARIANT,
  DEPENDENT_VARIANT
} from '../coinTypes';

describe('Coin tests', () => {
  describe('Basic coin test', () => {
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
      expect(testCoin.isMultivariant()).toBeFalsy();
    });

    it('is not dependent', () => {
      expect(testCoin.isDependent()).toBeFalsy();
    });

    it('does not have a frozen metadata property', () => {
      expect(Object.isFrozen(testCoin.metadata)).toBeFalsy();
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
      expect(testCoin.isMultivariant()).toBeFalsy();
    });

    it('is dependent', () => {
      expect(testCoin.isDependent()).toBeTruthy();
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
  });

  describe('Multivariant coin test', () => {
    let definition;
    let testCoin;

    beforeEach(() => {
      definition = {
        variants: [
          { name: 'variant1', probability: 10 },
          { name: 'variant2', probability: 20 },
          { name: 'variant3', probability: 30 }
        ]
      };

      testCoin = MultivariantCoin(definition);
    });

    it('is defined correctly', () => {
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
      expect(testCoin.isMultivariant()).toBeTruthy();
    });

    it('is not dependent', () => {
      expect(testCoin.isDependent()).toBeFalsy();
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
  });

  describe('DependentMultivariant coin test', () => {
    let definition;
    let testCoin;

    beforeEach(() => {
      definition = {
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
      expect(testCoin.isMultivariant()).toBeTruthy();
    });

    it('is dependent', () => {
      expect(testCoin.isDependent()).toBeTruthy();
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
  });
});
