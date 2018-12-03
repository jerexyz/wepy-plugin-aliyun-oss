// tslint:disable:no-expression-statement no-object-mutation
import { sha256, sha256Native } from './hash';

test('sha256', () => {
  const expectedValue =
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
  const actualValue = sha256('test');
  const actualValue2 = sha256Native('test');
  expect(actualValue).toEqual(expectedValue);
  expect(actualValue2).toEqual(expectedValue);
});
