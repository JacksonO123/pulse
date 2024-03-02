export * from './pulse.js';
export * from './builtins.js';
export { createSignal } from '@jacksonotto/signals';
import { createEffect as signalEffect } from '@jacksonotto/signals';
const createEffect = (fn) => {
    const cb = () => fn({});
    signalEffect(cb);
};
export { createEffect as effect };
