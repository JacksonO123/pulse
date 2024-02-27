import { createSignal } from '@jacksonotto/signals';

const ArrayTest = () => {
  const [arr, setArr] = createSignal([1, 2, 3, 4]);
  // const [arr, setArr] = createSignal([]);

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
      <span>---</span>
      {arr().map((item) => {
        return <span>{item}</span>;
      })}
      <span>---</span>
      {arr().length === 0 && 'array empty'}
    </div>
  );
};

export default ArrayTest;
