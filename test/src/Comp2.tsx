import { createSignal } from '@jacksonotto/pulse';

const Comp2 = () => {
  const [value, _] = createSignal(true);

  return <div>{value() ? [1, 2, 3, 4] : [1, 2]}</div>;
};

export default Comp2;
