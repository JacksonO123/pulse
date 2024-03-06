export * from './pulse.js';
export * from './builtins.js';
export * from '@jacksonotto/signals';
import { JSX } from './jsx.js';
export type TEvent<T, E extends Event = Event> = JSX.TEvent<T, E>;
declare const createEffectJsx: (fn: (_: {}) => void) => void;
export { createEffectJsx as effect };
