import { trackScope, createEffect, onCleanup, currentContext } from '@jacksonotto/signals';
import { jsxElementToElement, renderChild, eventHandler, replaceElements, insertBefore } from './dom.js';
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
        let prevCleanup = null;
        let updateCleanup = undefined;
        let context = null;
        let computed = false;
        createEffect(() => {
            if (!context) {
                const current = currentContext();
                if (!current)
                    return;
                context = current;
            }
            if (prevCleanup)
                prevCleanup();
            let innerOwned = [];
            const cleanup = trackScope(() => {
                const value = accessor();
                const current = currentContext();
                if (current && !computed) {
                    innerOwned = current.getOwned();
                }
                if (value === false || value === null || value === undefined) {
                    if (prevEl !== null) {
                        prevEl.remove();
                        prevEl = null;
                    }
                    return;
                }
                const el = jsxElementToElement(value);
                if (prevEl === null) {
                    if (marker !== null) {
                        insertBefore(marker, el);
                    }
                    else {
                        renderChild(parent, el);
                    }
                }
                else {
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
            }
            else {
                updateCleanup = onCleanup(cleanup);
            }
        });
    }
    else {
        if (marker) {
            insertBefore(marker, accessor);
        }
        else {
            renderChild(parent, accessor);
        }
    }
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
