import {
  type Accessor,
  trackScope,
  createEffect,
  onCleanup,
  currentContext,
  State,
  Context,
  cleanupHandler
} from '@jacksonotto/signals';
import type { JSX } from './jsx.js';
import { jsxElementToElement, renderChild, eventHandler, replaceElements, insertBefore } from './dom.js';

export type JSXElement = JSX.Element;
export { JSX };
export { mount } from './dom.js';
export { derived as memo, createEffect as effect } from '@jacksonotto/signals';

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

  const cleanup = trackScope(() => {
    res = comp(props);
  });

  onCleanup(cleanup);

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
  marker: Node | null = null,
  // i have no idea what this does
  initial: any
) => {
  if (initial) {
    console.log('HAS INITIAL', { parent, accessor, marker, initial });
  }

  if (typeof accessor === 'function') {
    let prevEl: Node | Node[] | null = null;
    const [prevCleanup, addCleanup] = cleanupHandler();
    let context: Context | null = null;
    let computed = false;

    createEffect(() => {
      if (!context) {
        const current = currentContext();
        if (!current) return;
        context = current;
      }

      prevCleanup();
      let innerOwned: State<any>[] = [];

      const cleanup = trackScope(() => {
        let value = accessor();

        if (!computed) {
          const current = currentContext();
          if (current) innerOwned = current.getOwned();
        }

        if (value === false || value === null || value === undefined) {
          if (prevEl !== null) {
            const text = new Text();
            (prevEl as Element).replaceWith(text);
            prevEl = text;
            return;
          } else {
            value = '';
          }
        }

        const el = jsxElementToElement(value);

        if (prevEl === null) {
          if (marker !== null) {
            insertBefore(marker as Element, el);
          } else {
            renderChild(parent, el);
          }
        } else {
          replaceElements(prevEl, el, parent, marker);
        }

        prevEl = el;
      }, false);

      if (!computed) {
        context.ownMany(innerOwned);
        computed = true;
      }

      addCleanup(cleanup);
    });
  } else {
    if (marker) {
      insertBefore(marker as Element, accessor);
    } else {
      renderChild(parent, accessor);
    }
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
