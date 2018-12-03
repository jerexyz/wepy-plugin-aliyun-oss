// foo.spec.ts
import { mocked } from 'ts-jest/utils';
import { foo } from './foo';
jest.mock('./foo');

// here the whole foo var is mocked deeply
const mockedFoo = mocked(foo, true);

test('deep', () => {
  // there will be no TS error here, and you'll have completion in modern IDEs
  mockedFoo.a.b.c.hello('me');
  // same here
  expect(mockedFoo.a.b.c.hello.mock.calls).toHaveLength(1);
});

test('direct', () => {
  foo.name();
  // here only foo.name is mocked (or its methods if it's an object)
  expect(mocked(foo.name).mock.calls).toHaveLength(1);
});
