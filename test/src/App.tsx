import { Accessor, For, createEffect, createSignal } from '@jacksonotto/pulse';

const ArrayItem = () => {
  const [value, setValue] = createSignal(3);

  setTimeout(() => {
    setValue(4);
  }, 500);

  return <span>{Array(value()).fill('a')}</span>;
};

type ArrayCompProp = {
  length: number;
};

const ArrayComp = (props: ArrayCompProp) => {
  const arr: Accessor<number[]> = () =>
    Array(props.length)
      .fill(0)
      .map((_, index) => index);

  createEffect(() => {
    console.log(arr());
  });

  return (
    <div>
      <For each={arr()}>
        {() => (
          <>
            <ArrayItem />
            <br />
          </>
        )}
      </For>
      {/* {Array(props.length) */}
      {/*   .fill(0) */}
      {/*   .map(() => ( */}
      {/*     <div> */}
      {/*       <ArrayItem /> */}
      {/*     </div> */}
      {/*   ))} */}
    </div>
  );
};

const App = () => {
  const [len, setLen] = createSignal(2);

  const add = () => {
    setLen((prev) => prev + 1);
    console.log('-');
  };

  const remove = () => {
    setLen((prev) => Math.max(prev - 1, 0));
    console.log('-');
  };

  return (
    <div>
      <div>
        <button onClick={add}>Add</button>
        <button onClick={remove}>Remove</button>
      </div>
      <ArrayComp length={len()} />
    </div>
  );
};

export default App;
