import { JSX, JSXElement } from "@jacksonotto/pulse";
import "./Pulse.css";

type PulseProps = {
  children: JSXElement;
  outerStyle: JSX.CSSProperties;
  innerStyle: JSX.CSSProperties;
};

const Pulse = (props: PulseProps) => {
  return (
    <div class="outer" style={props.outerStyle}>
      <div class="inner" style={props.innerStyle}>
        {props.children}
      </div>
    </div>
  );
};

export default Pulse;
