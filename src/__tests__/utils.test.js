import { deepFreeze, flattenDeep } from '../utils';

describe('utilities file tests', () => {
  describe('deepFreeze method tests', () => {
    it('freezes the top level object', () => {
      const objectToBeFrozen = {
        a: 1,
        b: 'string',
        c: [1, true, {}, [], 'string'],
        d: {
          a: 1,
          b: 'string',
          c: [1, true, {}, [], 'string']
        }
      };

      const frozen = deepFreeze(objectToBeFrozen);

      expect(Object.isFrozen(frozen)).toBeTruthy();
    });

    it('freezes nested objects & arrays', () => {
      const objectToBeFrozen = {
        a: 1,
        b: 'string',
        c: [1, true, {}, [], 'string'],
        d: {
          a: 1,
          b: 'string',
          c: [1, true, {}, [], 'string']
        }
      };

      const frozen = deepFreeze(objectToBeFrozen);

      expect(Object.isFrozen(frozen.c)).toBeTruthy();
      expect(Object.isFrozen(frozen.d)).toBeTruthy();
    });

    it('does not freeze properties that are excluded', () => {
      const objectToBeFrozen = {
        a: 1,
        b: 'string',
        c: [1, true, {}, [], 'string'],
        d: {
          a: 1,
          b: 'string',
          c: [1, true, {}, [], 'string']
        },
        e: [],
        f: {}
      };

      const frozen = deepFreeze(objectToBeFrozen, ['c', 'd']);

      expect(Object.isFrozen(frozen.c)).toBeFalsy();
      expect(Object.isFrozen(frozen.d)).toBeFalsy();
      expect(Object.isFrozen(frozen.e)).toBeTruthy();
      expect(Object.isFrozen(frozen.f)).toBeTruthy();
    });

    it('ignores frozen objects', () => {
      const objectToBeFrozen = {
        a: 1,
        b: 'string',
        c: [1, true, {}, [], 'string'],
        d: {
          a: 1,
          b: 'string',
          c: [1, true, {}, [], 'string']
        }
      };

      const frozen = Object.freeze(objectToBeFrozen);
      const freezeAgain = deepFreeze(frozen);

      expect(Object.isFrozen(freezeAgain)).toBeTruthy();
      expect(frozen).toBe(freezeAgain);
    });
  });

  describe('flattenDeep tests', () => {
    it('does nothing to an empty array', () => {
      expect(flattenDeep([])).toEqual([]);
    });

    it('does nothing to a flat array', () => {
      expect(flattenDeep([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('flattens one level deep', () => {
      expect(flattenDeep([1, 2, [1, 2], 3, 4, 5])).toEqual([1, 2, 1, 2, 3, 4, 5]);
    });

    it('flattens multiple levels deep', () => {
      expect(flattenDeep([1, 2, [1, 2, [3, [4], 5]], 3, 4, 5])).toEqual([
        1,
        2,
        1,
        2,
        3,
        4,
        5,
        3,
        4,
        5
      ]);
    });
  });
});
