import { trackScope } from '@jacksonotto/signals';
import { JSX } from './jsx.js';
import { JSXElement } from './pulse.js';

export const renderChild = (parent: Element, target: JSXElement) => {
  const element = jsxElementToElement(target);
  if (Array.isArray(element)) {
    element.forEach((item) => parent.appendChild(item));
  } else {
    parent.appendChild(element);
  }
};

export const mount = (comp: JSXElement, root = document.body) => {
  trackScope(() => {
    renderChild(root, comp);
  });
};

export const jsxElementToElement = (jsxEl: JSXElement): Node | Node[] => {
  if (jsxEl instanceof Node) return jsxEl as Element;

  if (Array.isArray(jsxEl)) {
    return jsxEl.map((el) => jsxElementToElement(el)).flat();
  }

  return new Text(jsxEl + '');
};

export const insertAfter = (target: Element, el: JSXElement) => {
  const element = jsxElementToElement(el);

  if (Array.isArray(element)) {
    let prev: Node = target;
    element.forEach((item) => {
      (prev as Element).after(item);
      prev = item;
    });
  } else {
    target.after(element);
  }
};

export const insertBefore = (target: Element, el: JSXElement) => {
  const element = jsxElementToElement(el);

  if (Array.isArray(element)) {
    let prev: Node = target;
    element.reverse().forEach((item) => {
      (prev as Element).before(item);
      prev = item;
    });
  } else {
    target.before(element);
  }
};

export const replaceElements = (
  target: Node | Node[],
  el: Node | Node[],
  parent: Element,
  after: Node | null
) => {
  if (Array.isArray(target)) {
    if (Array.isArray(el)) {
      if (target.length === 0) {
        if (after) insertBefore(after as Element, el);
        else {
          console.log('here');
          renderChild(parent, el);
        }
        return;
      }

      while (target.length > el.length) {
        (target[target.length - 1] as Element).remove();
        target.pop();
      }

      let i = 0;
      for (; i < target.length; i++) {
        (target[i] as Element).replaceWith(el[i]);
      }

      while (i < el.length) {
        (el[i - 1] as Element).after(el[i]);
        i++;
      }
    } else {
      if (target.length === 0) {
        if (after) insertBefore(after as Element, el);
        else renderChild(parent, el);
        return;
      }

      while (target.length > 1) {
        (target[target.length - 1] as Element).remove();
        target.pop();
      }

      (target[0] as Element).replaceWith(el);
    }
  } else {
    if (Array.isArray(el)) {
      if (el.length === 0) {
        (target as Element).remove();
        return;
      }

      const first = el.shift()!;
      (target as Element).replaceWith(first);
      insertAfter(first as Element, el);
    } else {
      (target as Element).replaceWith(el);
    }
  }
};

export const eventHandler = (e: Event) => {
  const key = `$$${e.type}`;
  let node: Node | null = ((e.composedPath && e.composedPath()[0]) || e.target) as Node;

  if (e.target !== node) {
    Object.defineProperty(e, 'target', {
      configurable: true,
      value: node
    });
  }

  Object.defineProperty(e, 'currentTarget', {
    configurable: true,
    get() {
      return node || document;
    }
  });

  while (node) {
    const handler = node[key as keyof EventTarget];

    if (handler && !node.disabled) {
      const data = node[`${key}Data` as keyof Node];

      if (data !== undefined)
        (handler as JSX.BoundEventHandler<JSXElement, JSX.TEvent<JSXElement>>[0])(
          data,
          e as JSX.TEvent<JSXElement>
        );
      else {
        (handler as (e: JSX.TEvent<JSXElement>) => void)(e as JSX.TEvent<JSXElement>);
      }
    }
    node = node.parentNode;
  }
};
