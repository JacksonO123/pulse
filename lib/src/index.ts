export * from './pulse.js';
export * from './builtins.js';
export * from '@jacksonotto/signals';

import { createEffect as signalEffect } from '@jacksonotto/signals';
import { JSX } from './jsx.js';

export type TEvent<T, E extends Event = Event> = JSX.TEvent<T, E>;

const createEffectJsx = (fn: (_: {}) => void) => {
  const cb = () => fn({});

  signalEffect(cb);
};

export { createEffectJsx as effect };
