import { createSignal } from '@jacksonotto/signals';
import ArrayItem from './ArrayItem';

const ArrayTest = () => {
  const [arr, setArr] = createSignal([1, 2, 3, 4]);

  const add = () => {
    setArr((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  };

  const remove = () => {
    setArr((prev) => {
      prev.pop();
      return [...prev];
    });
  };

  return (
    <div>
      <button onClick={add}>Add</button>
      <button onClick={remove}>Remove</button>

      {arr().map((item) => (
        <ArrayItem num={item} />
      ))}

      <br />
      <span>what about now</span>
    </div>
  );
};

export default ArrayTest;
