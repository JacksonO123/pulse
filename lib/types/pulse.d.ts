import { type Accessor } from '@jacksonotto/signals';
import type { JSX } from './jsx.js';
export type JSXElement = JSX.Element;
export { JSX };
export { mount } from './dom.js';
export { derived as memo, createEffect as effect } from '@jacksonotto/signals';
declare global {
    interface Document {
        _$DX_DELEGATE?: Set<string>;
    }
    interface Node {
        disabled: boolean;
    }
}
export declare const createComponent: <T extends JSX.DOMAttributes<JSX.Element>>(comp: JSX.Component<T>, props: T) => JSX.Element;
export declare const template: (str: string, _: any, isSvg: boolean) => () => Node | undefined;
export declare const insert: (parent: Element, accessor: Accessor<JSXElement> | Node, marker: Node | null | undefined, initial: any) => void;
export declare const delegateEvents: (events: string[], doc?: Document) => void;
