import { asyncABC } from './async';

test('getABC', async () => {
  expect(await asyncABC()).toEqual(['a', 'b', 'c']);
});
