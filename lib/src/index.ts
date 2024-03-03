export * from './pulse.js';
export * from './builtins.js';
export * from '@jacksonotto/signals';

import { createEffect as signalEffect } from '@jacksonotto/signals';

const createEffectJsx = (fn: (noobj: {}) => void) => {
  const cb = () => fn({});

  signalEffect(cb);
};

export { createEffectJsx as effect };
