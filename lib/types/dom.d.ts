import { JSXElement } from './pulse.js';
export declare const renderChild: (parent: Element, target: JSXElement) => void;
export declare const mount: (comp: JSXElement, root?: HTMLElement) => void;
export declare const jsxElementToElement: (jsxEl: JSXElement) => Node | Node[];
export declare const insertAfter: (target: Element, el: JSXElement) => void;
export declare const insertBefore: (target: Element, el: JSXElement) => void;
export declare const replaceElements: (target: Node | Node[], el: Node | Node[], parent: Element, after: Node | null) => void;
export declare const eventHandler: (e: Event) => void;
