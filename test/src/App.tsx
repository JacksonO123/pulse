import { TEvent, createEffect, createSignal } from '@jacksonotto/pulse';

const App = () => {
  const [value, setValue] = createSignal('');

  const update = (e: TEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setValue(value);
  };

  const double = () => {
    setValue((prev) => prev + prev);
  };

  createEffect(() => {
    console.log(value());
  });

  return (
    <div class="root">
      <button onClick={double}>Double</button>
      <input
        value={value()}
        onInput={update}
      />
    </div>
  );
};

export default App;
