import type { JSX } from "./jsx.js";
export { JSX };
declare global {
    interface Document {
        _$DX_DELEGATE?: Set<string>;
    }
    interface Node {
        disabled: boolean;
    }
}
export declare const mount: (comp: JSX.Element, root?: HTMLElement) => void;
export declare const createComponent: <T extends JSX.DOMAttributes<JSX.Element>>(comp: JSX.Component<T>, props: T) => JSX.Element;
export declare const template: (str: string, _: any, isSvg: boolean) => () => ChildNode | null;
export declare const insert: (..._args: any[]) => void;
export declare const delegateEvents: (events: string[], doc?: Document) => void;
