import { mount } from '@jacksonotto/pulse';
import Component from './Comp';

const App = () => {
  return (
    <div>
      <Component property="what">sdlkfjsdl</Component>
    </div>
  );
};

mount(<App />);
