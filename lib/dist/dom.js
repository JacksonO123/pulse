import { trackScope } from '@jacksonotto/signals';
export let mountEvents = [];
export const renderChild = (parent, target) => {
    const element = jsxElementToElement(target);
    if (Array.isArray(element)) {
        element.forEach((item) => parent.appendChild(item));
    }
    else {
        parent.appendChild(element);
    }
};
export const mount = (comp, root = document.body) => {
    trackScope(() => {
        renderChild(root, comp);
        mountEvents.forEach((event) => event());
        mountEvents = [];
    });
};
export const jsxElementToElement = (jsxEl) => {
    if (jsxEl instanceof Node)
        return jsxEl;
    if (Array.isArray(jsxEl)) {
        return jsxEl.map((el) => jsxElementToElement(el)).flat();
    }
    return new Text(jsxEl + '');
};
export const insertAfter = (target, el) => {
    const element = jsxElementToElement(el);
    if (Array.isArray(element)) {
        target.after(...element);
    }
    else {
        target.after(element);
    }
};
export const insertBefore = (target, el) => {
    const element = jsxElementToElement(el);
    if (Array.isArray(element)) {
        target.before(...element.reverse());
    }
    else {
        target.before(element);
    }
};
export const replaceElements = (target, el, parent, after) => {
    if (Array.isArray(target)) {
        if (target.length === 0) {
            if (after)
                insertBefore(after, el);
            else
                renderChild(parent, el);
            return;
        }
        if (Array.isArray(el)) {
            while (target.length > el.length) {
                target[target.length - 1].remove();
                target.pop();
            }
            let i = 0;
            for (; i < target.length; i++) {
                target[i].replaceWith(el[i]);
            }
            while (i < el.length) {
                el[i - 1].after(el[i]);
                i++;
            }
        }
        else {
            while (target.length > 1) {
                target[target.length - 1].remove();
                target.pop();
            }
            target[0].replaceWith(el);
        }
    }
    else {
        if (Array.isArray(el)) {
            if (el.length === 0) {
                target.remove();
                return;
            }
            const first = el.shift();
            target.replaceWith(first);
            insertAfter(first, el);
        }
        else {
            target.replaceWith(el);
        }
    }
};
export const removeElementOrArr = (el) => {
    if (Array.isArray(el))
        el.forEach((item) => removeElementOrArr(item));
    else
        el.remove();
};
export const eventHandler = (e) => {
    const key = `$$${e.type}`;
    let node = ((e.composedPath && e.composedPath()[0]) || e.target);
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
        const handler = node[key];
        if (handler && !node.disabled) {
            const data = node[`${key}Data`];
            if (data !== undefined)
                handler(data, e);
            else {
                handler(e);
            }
        }
        node = node.parentNode;
    }
};
