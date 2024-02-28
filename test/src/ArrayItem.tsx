import { onCleanup } from '@jacksonotto/signals';

type ArrayItemProps = {
  num: number;
};

const ArrayItem = ({ num }: ArrayItemProps) => {
  console.log('running');

  onCleanup(() => {
    console.log('cleaned');
  });

  return (
    <>
      <br />
      <span>[item {num}]</span>
    </>
  );
};

export default ArrayItem;
