const sig = <T,>(val: T) => {
  let obj = {
    value: val
  };

  return (newVal?: T) => {
    if (newVal) obj.value = newVal;
    return obj.value;
  };
};

export type CompProps = {
  property: string;
  children: string;
};

const Comp = (props: CompProps) => {
  console.log(props);

  const test = sig(4);

  const change = (e: MouseEvent) => {
    console.log('CLICKING', e.currentTarget);
    test(test() + 1);
  };

  return (
    <div>
      <span>here</span>
      <button onClick={change}>test {test()}</button>
    </div>
  );
};

export default Comp;
