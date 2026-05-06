import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluatePartial } from '../../src/utils/expressionEvaluator';

describe('expressionEvaluator', () => {
  describe('evaluatePartial', () => {
    it('computes a * b * c * d when all dimensions are present', () => {
      const result = evaluatePartial({
        length: 10,
        latitude: 5,
        height: 2,
        units: 3,
      });
      assert.equal(result, 300); // 10 * 5 * 2 * 3
    });

    it('treats missing length as 1', () => {
      const result = evaluatePartial({
        latitude: 5,
        height: 2,
        units: 3,
      });
      assert.equal(result, 30); // 1 * 5 * 2 * 3
    });

    it('treats missing latitude as 1', () => {
      const result = evaluatePartial({
        length: 10,
        height: 2,
        units: 3,
      });
      assert.equal(result, 60); // 10 * 1 * 2 * 3
    });

    it('treats missing height as 1', () => {
      const result = evaluatePartial({
        length: 10,
        latitude: 5,
        units: 3,
      });
      assert.equal(result, 150); // 10 * 5 * 1 * 3
    });

    it('treats missing units as 1', () => {
      const result = evaluatePartial({
        length: 10,
        latitude: 5,
        height: 2,
      });
      assert.equal(result, 100); // 10 * 5 * 2 * 1
    });

    it('adds constant p to the product', () => {
      const result = evaluatePartial(
        { length: 10, latitude: 5, height: 2, units: 3 },
        42,
      );
      assert.equal(result, 342); // 300 + 42
    });

    it('defaults constant p to 0', () => {
      const result = evaluatePartial({
        length: 10,
        latitude: 5,
        height: 2,
        units: 3,
      });
      assert.equal(result, 300); // 300 + 0
    });

    it('returns 0 when all dimensions are 0', () => {
      const result = evaluatePartial(
        { length: 0, latitude: 0, height: 0, units: 0 },
        0,
      );
      assert.equal(result, 0);
    });

    it('returns 1 when no dimensions are provided', () => {
      const result = evaluatePartial({});
      assert.equal(result, 1); // 1 * 1 * 1 * 1 + 0
    });

    it('handles NaN values as 1', () => {
      const result = evaluatePartial({
        length: NaN,
        latitude: 5,
        height: NaN,
        units: 3,
      });
      assert.equal(result, 15); // 1 * 5 * 1 * 3
    });
  });
});
