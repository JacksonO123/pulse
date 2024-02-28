import { mount, createSignal, onCleanup } from '@jacksonotto/pulse';

type ArrayItemProps = {
  num: number;
};

const ArrayItem = (props: ArrayItemProps) => {
  onCleanup(() => {
    console.log('item cleaned');
  });

  return <span>{props.num}</span>;
};

type ArrayCompProps = {
  length: number;
};

const ArrayComp = (props: ArrayCompProps) => {
  return (
    <div>
      {Array(props.length)
        .fill(0)
        .map((_, index) => (
          <>
            <ArrayItem num={index} />
            <br />
          </>
        ))}
    </div>
  );
};

const App = () => {
  const [num, setNum] = createSignal(2);

  const add = () => {
    setNum((prev) => prev + 1);
    console.log('-');
  };

  const remove = () => {
    setNum((prev) => Math.max(0, prev - 1));
    console.log('-');
  };

  return (
    <div>
      <div>
        <button onClick={add}>add</button>
        <button onClick={remove}>remove</button>
      </div>
      <hr />
      <ArrayComp length={num()} />
    </div>
  );
};

mount(<App />);
