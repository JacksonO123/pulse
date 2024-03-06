import { Link, createSignal, redirect } from '@jacksonotto/pulse';
import Arr from './Arr';

const App = () => {
  const [arr, setArr] = createSignal([0]);

  const add = () => {
    setArr((prev) => [...prev, prev[prev.length - 1] + 1]);
  };

  setTimeout(() => {
    redirect('/testing');
  }, 1000);

  return (
    <div class="root">
      <button onClick={add}>Add</button>
      <br />
      <Arr arr={arr()} />
      <input />
      <Link href="/testing">thing</Link>
    </div>
  );
};

export default App;
