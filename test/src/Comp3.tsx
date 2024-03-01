import { createSignal } from '@jacksonotto/pulse';

const Comp3 = () => {
  const [number, setNumber] = createSignal(0);

  const add = () => {
    setNumber((prev) => prev + 1);
  };

  return (
    <div>
      <button onClick={add}>Add</button>

      {number()}
    </div>
  );
};

export default Comp3;
