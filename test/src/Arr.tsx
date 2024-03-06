import { JSXElement } from '@jacksonotto/pulse';

type ArrProps<T> = {
  arr: T[];
};

const Arr = <T extends JSXElement>(props: ArrProps<T>) => {
  return (
    <div>
      {props.arr.map((item) => (
        <>
          <div>{item}</div>
          <span>here {item}</span>
        </>
      ))}
    </div>
  );
};

export default Arr;
