import { type Accessor, trackScope, createEffect } from '@jacksonotto/signals';
import type { JSX } from './jsx.js';
import { jsxElementToElement, renderChild, eventHandler, replaceElements, insertBefore } from './dom.js';

export type JSXElement = JSX.Element;
export { JSX };
export { mount } from './dom.js';
export { derived as memo } from '@jacksonotto/signals';

const $$EVENTS = '_$DX_DELEGATE';

declare global {
  interface Document {
    _$DX_DELEGATE?: Set<string>;
  }

  interface Node {
    disabled: boolean;
  }
}

export const createComponent = <T extends JSX.DOMAttributes<JSXElement>>(
  comp: JSX.Component<T>,
  props: T
) => {
  let res: JSXElement;

  trackScope(() => {
    res = comp(props);
  });

  return res;
};

export const template = (str: string, _: any, isSvg: boolean) => {
  const create = () => {
    const el = document.createElement('template');
    el.innerHTML = str;

    return isSvg ? el.content.firstChild!.firstChild : el.content.firstChild;
  };

  const el = create();

  return () => el?.cloneNode(true);
};

export const insert = (
  parent: Element,
  accessor: Accessor<JSXElement> | Node,
  marker: Node | null,
  // i have no idea what this means
  initial: any
) => {
  // the equivelant of this function in solidjs is like 100 lines of the most dense js you have ever seen
  // i have no idea what it does and this is so much shorter i don't get it hope this works :)

  if (initial) {
    console.log('HAS INITIAL', { parent, accessor, marker, initial });
  }

  if (typeof accessor === 'function') {
    let prevEl: Node | Node[] | null = null;

    createEffect(() => {
      const value = accessor();
      if (value === false) {
        if (prevEl !== null) {
          (prevEl as Element).remove();
          prevEl = null;
        }
        return;
      }

      const el = jsxElementToElement(value);

      if (prevEl === null) {
        if (marker !== null) {
          insertBefore(marker as Element, el);
        } else {
          renderChild(parent, el);
        }
      } else {
        replaceElements(prevEl, el, marker);
      }

      prevEl = el;
    });
  } else {
    renderChild(parent, accessor);
  }
};

export const delegateEvents = (events: string[], doc = document) => {
  const e = doc[$$EVENTS] || (doc[$$EVENTS] = new Set());
  for (let i = 0; i < events.length; i++) {
    const name = events[i];
    if (!e.has(name)) {
      e.add(name);
      doc.addEventListener(name, eventHandler);
    }
  }
};
