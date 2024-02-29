import { createSignal } from '@jacksonotto/pulse';

const Comp2 = () => {
  const [test, _] = createSignal('word');

  return <div>{test().length > 0 ? test() : 'no test'}</div>;
};

export default Comp2;
