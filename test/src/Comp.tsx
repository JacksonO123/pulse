import { createSignal } from '@jacksonotto/signals';
import Another from './Another';
import ArrayTest from './ArrayTest';

export type CompProps = {
  property: string;
  children: string;
};

const Comp = (_: CompProps) => {
  const [test, setTest] = createSignal(0);
  const [bool, setBool] = createSignal(false);

  const change = (e: MouseEvent) => {
    console.log('CLICKING', e.currentTarget);
    setTest((prev) => prev + 1);
  };

  const another = () => {
    setBool((prev) => !prev);
  };

  return (
    <div>
      <span>here</span>
      <button onClick={change}>test {test()}</button>
      {bool() && test() === 0 ? <Another /> : 'epic'}
      <button onClick={another}>click me</button>
      <ArrayTest />
    </div>
  );
};

export default Comp;
