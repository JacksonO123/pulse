import { JSX, JSXElement } from './index.js';
import { Accessor } from '@jacksonotto/signals';
type ForProps<T> = {
    each: T[];
    children: (item: Accessor<T>, index: number) => JSXElement;
};
export declare const For: <T extends JSX.Element>(props: ForProps<T>) => Text | (Node | Node[])[];
export type Route = {
    path: string;
    element: () => JSXElement;
};
type RouterProps = {
    routes: Route[];
};
export declare const PulseRouter: (props: RouterProps) => HTMLDivElement;
export declare const redirect: (to: string) => void;
export declare const Link: (props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) => HTMLAnchorElement;
export {};
