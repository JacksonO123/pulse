import { type Accessor, trackScope, createEffect } from "@jacksonotto/signals";
import type { JSX } from "./jsx.js";
import { jsxElementToElement, renderChild } from "./dom.js";

export type JSXElement = JSX.Element;
export { JSX };
export { mount } from "./dom.js";

const $$EVENTS = "_$DX_DELEGATE";

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
  props: T,
) => {
  let res: JSXElement;

  trackScope(() => {
    res = comp(props);
  });

  return res;
};

export const template = (str: string, _: any, isSvg: boolean) => {
  const create = () => {
    const el = document.createElement("template");
    el.innerHTML = str;

    return isSvg ? el.content.firstChild!.firstChild : el.content.firstChild;
  };

  const el = create();

  return () => el;
};

export const insert = (
  parent: Element,
  accessor: Accessor<JSXElement> | Node,
  // i have no idea what these mean
  marker: any,
  initial: any,
) => {
  // the equivelant of this function in solidjs is like 100 lines of the most dense js you have ever seen
  // i have no idea what it does and this is so much shorter i don't get it hope this works :)

  if (marker) {
    console.log("HAS MARKER", marker);
  }
  if (initial) {
    console.log("HAS INITIAL", initial);
  }

  if (typeof accessor === "function") {
    let prevEl: Element | Text | null;

    createEffect(() => {
      const el = jsxElementToElement(accessor());

      if (prevEl === null || prevEl === undefined) {
        renderChild(parent, el);
      } else {
        prevEl.replaceWith(el);
      }
      prevEl = el;
    });
  } else {
    renderChild(parent, accessor);
  }

  document.body.appendChild(document.createElement("div"));
};

const eventHandler = (e: Event) => {
  const key = `$$${e.type}`;
  let node: Node | null = ((e.composedPath && e.composedPath()[0]) ||
    e.target) as Node;

  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node,
    });
  }

  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    },
  });

  while (node) {
    const handler = node[key as keyof EventTarget];

    if (handler && !node.disabled) {
      const data = node[`${key}Data` as keyof Node];

      if (data !== undefined)
        (
          handler as JSX.BoundEventHandler<
            JSXElement,
            JSX.TEvent<JSXElement>
          >[0]
        )(data, e as JSX.TEvent<JSXElement>);
      else {
        (handler as (e: JSX.TEvent<JSXElement>) => void)(
          e as JSX.TEvent<JSXElement>,
        );
      }
    }
    node = node.parentNode;
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
