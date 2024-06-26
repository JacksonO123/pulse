import {
  type Accessor,
  trackScope,
  createEffect,
  onCleanup,
  currentContext,
  State,
  Context,
  cleanupHandler,
  Setter
} from '@jacksonotto/signals';
import type { JSX } from './jsx.js';
import {
  jsxElementToElement,
  renderChild,
  eventHandler,
  replaceElements,
  insertBefore,
  mountEvents
} from './dom.js';

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
  marker: Node | null = null,
  // i have no idea what this does
  initial: any
) => {
  if (initial) {
    console.log('HAS INITIAL', { parent, accessor, marker, initial });
  }

  if (typeof accessor === 'function') {
    let prevEl: Node | Node[] | null = null;
    let context: Context | null = null;
    let computed = false;

    const [prevCleanup, addCleanup] = cleanupHandler();

    createEffect(() => {
      if (!context) {
        context = currentContext() || null;
        if (!context) return;
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
          if (marker !== null) insertBefore(marker as Element, el);
          else renderChild(parent, el);
        } else replaceElements(prevEl, el, parent, marker);

        prevEl = el;
      }, false);

      if (!computed) {
        context.ownMany(innerOwned);
        computed = true;
      }

      addCleanup(cleanup);
    });
  } else {
    if (marker) insertBefore(marker as Element, accessor);
    else renderChild(parent, accessor);
  }
};

export const onMount = (cb: () => void) => {
  mountEvents.push(cb);
};

export const style = (el: HTMLElement, style: JSX.CSSProperties) => {
  Object.entries(style).forEach(([key, value]) => {
    // @ts-ignore
    el.style[key] = value;
  });
};

export const className = (el: Element, classStr: string) => {
  const classes = new Set(classStr.split(' '));

  el.classList.forEach((item) => {
    if (!classes.has(item)) el.classList.remove(item);
  });

  classes.forEach((item) => {
    if (item.length > 0 && !el.classList.contains(item)) {
      el.classList.add(item);
    }
  });
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

export const use = (elFn: Setter<Node>, ref: Node) => {
  elFn(ref);
};
