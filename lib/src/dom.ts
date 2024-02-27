import { trackScope } from "@jacksonotto/signals";
import { JSXElement } from "./pulse.js";

export const renderChild = (target: Element, el: JSXElement) => {
  target.appendChild(jsxElementToElement(el));
};

export const mount = (comp: JSXElement, root = document.body) => {
  trackScope(() => {
    renderChild(root, comp);
  });
};

export const jsxElementToElement = (jsxEl: JSXElement): Element | Text => {
  if (jsxEl instanceof Node) return jsxEl as Element;
  else if (Array.isArray(jsxEl)) return new Text(jsxEl.join(", "));

  return new Text(jsxEl + "");
};

export const insertAfter = (target: Element, el: JSXElement) => {
  target.after(jsxElementToElement(el));
};
