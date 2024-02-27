import { JSXElement } from "./pulse.js";
export declare const renderChild: (target: Element, el: JSXElement) => void;
export declare const mount: (comp: JSXElement, root?: HTMLElement) => void;
export declare const jsxElementToElement: (jsxEl: JSXElement) => Element | Text;
export declare const insertAfter: (target: Element, el: JSXElement) => void;
