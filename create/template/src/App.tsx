import { createSignal } from "@jacksonotto/pulse";
import "./App.css";
import Pulse from "./Pulse";

const App = () => {
  const [count, setCount] = createSignal(0);

  const add = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <div class="container">
      <Pulse
        outerStyle={{ width: "100%", height: "100%" }}
        innerStyle={{
          padding: "20px",
          "padding-top": "35px",
          "padding-bottom": "35px",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: "14px",
        }}
      >
        <div class="title">
          <img src="/pulse.jpg" alt="Pulse Logo" width="30" height="30" />
          <h1>Pulse</h1>
        </div>
        <button onClick={add}>Count {count()}</button>
      </Pulse>
    </div>
  );
};

export default App;
