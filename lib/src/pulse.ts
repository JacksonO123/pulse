import {
  type Accessor,
  trackScope,
  createEffect,
  onCleanup,
  currentContext,
  State,
  Context
} from '@jacksonotto/signals';
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
  marker: Node | null,
  // i have no idea what this does
  initial: any
) => {
  if (initial) {
    console.log('HAS INITIAL', { parent, accessor, marker, initial });
  }

  if (typeof accessor === 'function') {
    let prevEl: Node | Node[] | null = null;
    let prevCleanup: (() => void) | null = null;
    let updateCleanup: ((newFn: () => void) => void) | undefined = undefined;
    let context: Context | null = null;
    let computed = false;

    createEffect(() => {
      if (!context) {
        const current = currentContext();
        if (!current) return;
        context = current;
      }

      if (prevCleanup) prevCleanup();
      let innerOwned: State<any>[] = [];

      const cleanup = trackScope(() => {
        const value = accessor();

        const current = currentContext();
        if (current && !computed) {
          innerOwned = current.getOwned();
        }

        if (value === false || value === null || value === undefined) {
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
          replaceElements(prevEl, el, parent, marker);
        }

        prevEl = el;
      }, false);

      if (!computed) {
        context.ownMany(innerOwned);
        computed = true;
      }

      prevCleanup = cleanup;

      if (updateCleanup) {
        updateCleanup(cleanup);
      } else {
        updateCleanup = onCleanup(cleanup);
      }
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
