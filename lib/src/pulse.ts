import type { JSX } from "./jsx.js";
export { JSX };

const $$EVENTS = "_$DX_DELEGATE";

declare global {
  interface Document {
    _$DX_DELEGATE?: Set<string>;
  }

  interface Node {
    disabled: boolean;
  }
}

const renderChild = (target: HTMLElement | SVGElement, el: JSX.Element) => {
  if (el instanceof Node) {
    target.appendChild(el);
  } else if (Array.isArray(el)) {
    const text = new Text("[ " + el.join(", ") + " ]");
    renderChild(target, text);
  } else {
    renderChild(target, el + "");
  }
};

export const mount = (comp: JSX.Element, root = document.body) => {
  renderChild(root, comp);
};

export const createComponent = <T extends JSX.DOMAttributes<JSX.Element>>(
  comp: JSX.Component<T>,
  props: T,
) => {
  return comp(props);
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

export const insert = (..._args: any[]) => {
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
            JSX.Element,
            JSX.TEvent<JSX.Element>
          >[0]
        )(data, e as JSX.TEvent<JSX.Element>);
      else {
        (handler as (e: JSX.TEvent<JSX.Element>) => void)(
          e as JSX.TEvent<JSX.Element>,
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
