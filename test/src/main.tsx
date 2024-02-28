import { mount } from '@jacksonotto/pulse';
import { createSignal } from '@jacksonotto/signals';

export type CompProps = {
  num: number;
};

const Comp = (props: CompProps) => {
  return (
    <div>
      <span>{props.num}</span>
    </div>
  );
};

const App = () => {
  const [num, setNum] = createSignal(2);

  const change = () => {
    setNum((prev) => prev + 1);
  };

  return (
    <div>
      <button onClick={change}>update</button>
      <Comp num={num()} />
    </div>
  );
};

mount(<App />);
