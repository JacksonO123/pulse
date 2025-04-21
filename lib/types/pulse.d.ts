import { type Accessor, Setter } from '@jacksonotto/signals';
import type { JSX } from './jsx.js';
export type JSXElement = JSX.Element;
export { JSX };
export { mount } from './dom.js';
declare global {
    interface Document {
        _$DX_DELEGATE?: Set<string>;
    }
    interface Node {
        disabled: boolean;
    }
}
export declare const createComponent: <T extends JSX.DOMAttributes<JSXElement>>(comp: JSX.Component<T>, props: T) => JSX.Element;
export declare const template: (str: string, _: any, isSvg: boolean) => () => Node | undefined;
export declare const insert: (parent: Element, accessor: Accessor<JSXElement> | Node, marker: (Node | null) | undefined, initial: any) => void;
export declare const onMount: (cb: () => void) => void;
export declare const style: (el: Element, style: JSX.CSSProperties) => void;
export declare const className: (el: Element, classStr: string) => void;
export declare const delegateEvents: (events: string[], doc?: Document) => void;
export declare const use: (elFn: Setter<Node>, ref: Node) => void;
type SplitPropsReturn<T extends Record<string, any>, K extends readonly (keyof T)[]> = readonly [
    Pick<T, K[number]>,
    Omit<T, K[number]>
];
export declare const splitProps: <T extends Record<string, any>, K extends readonly (keyof T)[]>(props: T, split: K) => SplitPropsReturn<T, K>;
export declare const mergeProps: <T extends Record<string, any>, K extends Record<string, any>>(newProps: T, props: K) => T & K;
export declare const addEventListener: (el: Element, eventType: string, fn: EventListenerOrEventListenerObject, delegate: boolean) => void;
export declare const spread: (el: Element, props: JSX.DOMAttributes<Element>, _isSVG?: boolean, skipChildren?: boolean) => {
    children?: JSXElement | JSXElement[];
};
export declare const assign: (el: Element, props: any, prevProps: any, skipRef?: boolean) => void;
