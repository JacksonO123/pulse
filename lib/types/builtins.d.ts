import { JSXElement } from './index.js';
import { Accessor } from '@jacksonotto/signals';
type ForProps<T> = {
    each: T[];
    children: (item: Accessor<T>, index: number) => JSXElement;
};
export declare const For: <T extends import("./jsx.js").JSX.Element>(props: ForProps<T>) => (Node | Node[])[] | Text;
export {};
