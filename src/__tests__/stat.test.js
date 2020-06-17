import { createSample } from '../stat';

describe('The statistics helper functions', () => {
  describe('createSample tests', () => {
    it('creates samples correctly', () => {
      const values = [
        { count: 10, value: 'first' },
        { count: 90, value: 'second' }
      ];

      const sample = createSample(values, 100);

      expect(sample.length).toEqual(100);
      expect(sample.filter(x => x === 'first').length).toEqual(10);
      expect(sample.filter(x => x === 'second').length).toEqual(90);
    });

    it('fills missing values in with false', () => {
      const values = [
        { count: 10, value: 'first' },
        { count: 10, value: 'second' }
      ];

      const sample = createSample(values, 100);

      expect(sample.length).toEqual(100);
      expect(sample.filter(x => x === 'first').length).toEqual(10);
      expect(sample.filter(x => x === 'second').length).toEqual(10);
      expect(sample.filter(x => x === false).length).toEqual(80);
    });

    it('fills only up to the max size passed', () => {
      const values = [
        { count: 100, value: 'first' },
        { count: 100, value: 'second' }
      ];

      const sample = createSample(values, 100);

      expect(sample.length).toEqual(100);
    });
  });
});
