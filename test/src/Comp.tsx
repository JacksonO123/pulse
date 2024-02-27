import { createSignal } from '@jacksonotto/signals';

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
      <button onClick={change}>
        test {test()}
        {bool()}
      </button>
      <button onClick={another}>click me</button>
    </div>
  );
};

export default Comp;
