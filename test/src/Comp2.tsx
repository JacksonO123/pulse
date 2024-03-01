import { For, JSXElement, createSignal, onCleanup } from '@jacksonotto/pulse';

type ArrayItemProps = {
  children: JSXElement;
};

const ArrayItem = (props: ArrayItemProps) => {
  const [rendered, setRendered] = createSignal(false);

  const timeout = setTimeout(() => {
    setRendered(true);
  }, 800);

  onCleanup(() => clearTimeout(timeout));

  return (
    <span>
      {rendered() && '('}
      {props.children}
      {rendered() && ')'}
    </span>
  );
};

const Comp2 = () => {
  const [arr, setArr] = createSignal([0]);

  const add = () => {
    setArr((prev) => {
      let newArr = prev.map((item) => item + 1);

      newArr = [...newArr, newArr.length > 0 ? newArr[newArr.length - 1] + 1 : 0];

      return newArr;
    });
  };

  const remove = () => {
    setArr((prev) => (prev.pop(), [...prev]));
  };

  return (
    <div>
      <div>
        <button onClick={add}>Add</button>
        <button onClick={remove}>Remove</button>
      </div>
      <For each={arr()}>
        {(item) => (
          <>
            <ArrayItem>{item()}</ArrayItem>
            <br />
          </>
        )}
      </For>
    </div>
  );
};

export default Comp2;
