import { trackScope, createEffect, onCleanup, currentContext, cleanupHandler } from '@jacksonotto/signals';
import { jsxElementToElement, renderChild, eventHandler, replaceElements, insertBefore, mountEvents } from './dom.js';
export { mount } from './dom.js';
export { derived as memo } from '@jacksonotto/signals';
const $$EVENTS = '_$DX_DELEGATE';
export const createComponent = (comp, props) => {
    let res;
    const cleanup = trackScope(() => {
        res = comp(props);
    });
    onCleanup(cleanup);
    return res;
};
export const template = (str, _, isSvg) => {
    const create = () => {
        const el = document.createElement('template');
        el.innerHTML = str;
        return isSvg ? el.content.firstChild.firstChild : el.content.firstChild;
    };
    const el = create();
    return () => el?.cloneNode(true);
};
export const insert = (parent, accessor, marker = null, 
// i have no idea what this does
initial) => {
    if (initial) {
        console.log('HAS INITIAL', { parent, accessor, marker, initial });
    }
    if (typeof accessor === 'function') {
        let prevEl = null;
        let context = null;
        let computed = false;
        const [prevCleanup, addCleanup] = cleanupHandler();
        createEffect(() => {
            if (!context) {
                context = currentContext() || null;
                if (!context)
                    return;
            }
            prevCleanup();
            let innerOwned = [];
            const cleanup = trackScope(() => {
                let value = accessor();
                if (!computed) {
                    const current = currentContext();
                    if (current)
                        innerOwned = current.getOwned();
                }
                if (value === false || value === null || value === undefined) {
                    if (prevEl !== null) {
                        const text = new Text();
                        prevEl.replaceWith(text);
                        prevEl = text;
                        return;
                    }
                    else {
                        value = '';
                    }
                }
                const el = jsxElementToElement(value);
                if (prevEl === null) {
                    if (marker !== null)
                        insertBefore(marker, el);
                    else
                        renderChild(parent, el);
                }
                else
                    replaceElements(prevEl, el, parent, marker);
                prevEl = el;
            }, false);
            if (!computed) {
                context.ownMany(innerOwned);
                computed = true;
            }
            addCleanup(cleanup);
        });
    }
    else {
        if (marker)
            insertBefore(marker, accessor);
        else
            renderChild(parent, accessor);
    }
};
export const onMount = (cb) => {
    mountEvents.push(cb);
};
export const style = (el, style) => {
    Object.entries(style).forEach(([key, value]) => {
        // @ts-ignore
        el.style[key] = value;
    });
};
export const className = (el, classStr) => {
    const classes = new Set(classStr.split(' '));
    el.classList.forEach((item) => {
        if (!classes.has(item))
            el.classList.remove(item);
    });
    classes.forEach((item) => {
        if (item.length > 0 && !el.classList.contains(item)) {
            el.classList.add(item);
        }
    });
};
export const delegateEvents = (events, doc = document) => {
    const e = doc[$$EVENTS] || (doc[$$EVENTS] = new Set());
    for (let i = 0; i < events.length; i++) {
        const name = events[i];
        if (!e.has(name)) {
            e.add(name);
            doc.addEventListener(name, eventHandler);
        }
    }
};
