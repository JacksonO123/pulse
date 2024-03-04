import "./App.css";
import Pulse from "./Pulse";

const App = () => {
  return (
    <div class="container">
      <Pulse
        outerStyle={{ width: "100%", height: "100%" }}
        innerStyle={{
          padding: "35px",
          "padding-left": "55px",
          "padding-right": "55px",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: "30px",
        }}
      >
        <div class="title">
          <img src="/pulse.jpg" alt="Pulse Logo" width="30" height="30" />
          <h1>Pulse</h1>
        </div>
        <p>
          A lightweight performance oriented web framework built on{" "}
          <a href="https://github.com/JacksonO123/signals" target="_blank">
            Signals
          </a>
        </p>
        <section class="links">
          <a href="https://github.com/JacksonO123/pulse" target="_blank">
            View on Github
          </a>
          <a
            href="https://www.npmjs.com/package/@jacksonotto/pulse"
            target="_blank"
          >
            View on Npm
          </a>
        </section>
      </Pulse>
    </div>
  );
};

export default App;
