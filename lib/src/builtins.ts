import { insertAfter, jsxElementToElement, removeElementOrArr, renderChild } from './dom.js';
import { JSXElement, createEffect } from './index.js';
import {
  Accessor,
  Setter,
  cleanupHandler,
  createSignal,
  getSignalInternals,
  trackScope
} from '@jacksonotto/signals';

type ForProps<T> = {
  each: T[];
  children: (item: Accessor<T>, index: number) => JSXElement;
};

export const For = <T extends JSXElement>(props: ForProps<T>) => {
  const info: [Accessor<T>, Setter<T>, Node | Node[]][] = [];

  let parent: Node | null = null;
  let beforeEl: Node | null = null;
  let hookEl = new Text();

  const [prevCleanup, addCleanup] = cleanupHandler();

  createEffect(() => {
    prevCleanup();

    const arr = props.each;

    if (!beforeEl && !parent) {
      let hookInstance: Node;

      if (info.length === 0) {
        hookInstance = hookEl;
      } else {
        const el = info[0][2];
        hookInstance = Array.isArray(el) ? el.flat()[0] : el;
      }

      const hookBefore = hookInstance.previousSibling;
      if (hookBefore) beforeEl = hookBefore;
      parent = hookInstance.parentNode;
    }

    const cleanup = trackScope(() => {
      for (let i = 0; i < Math.min(info.length, arr.length); i++) {
        if (info[i][0]() !== arr[i]) info[i][1](arr[i]);
      }
    });

    addCleanup(cleanup);

    while (info.length < arr.length) {
      const index = info.length;
      const item = arr[index];

      const [value, setValue] = createSignal(item);
      const jsxEl = props.children(value, index);
      const el = jsxElementToElement(jsxEl);

      info.push([value, setValue, el]);

      if (!parent && !beforeEl) continue;

      if (info.length - 1 === 0) {
        if (beforeEl) {
          insertAfter(beforeEl as Element, el);
        } else {
          renderChild(parent as Element, el);
        }
      } else {
        let beforeItem = info[index - 1][2];
        beforeItem = Array.isArray(beforeItem) ? beforeItem[beforeItem.length - 1] : beforeItem;
        insertAfter(beforeItem as Element, el);
      }
    }

    while (info.length > arr.length) {
      const indexInfo = info.pop()!;
      const internals = getSignalInternals(indexInfo[0]);

      internals.dispose();

      removeElementOrArr(indexInfo[2]);
    }
  });

  if (info.length === 0) return hookEl;
  return info.map((item) => item[2]);
};
