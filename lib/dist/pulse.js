import { trackScope, createEffect, onCleanup, currentContext, cleanupHandler } from '@jacksonotto/signals';
import { jsxElementToElement, renderChild, eventHandler, replaceElements, insertBefore, mountEvents } from './dom.js';
export { mount } from './dom.js';
const $$EVENTS = '_$DX_DELEGATE';
const DelegatedEvents = new Set([
    'beforeinput',
    'click',
    'dblclick',
    'contextmenu',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keyup',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'pointerdown',
    'pointermove',
    'pointerout',
    'pointerover',
    'pointerup',
    'touchend',
    'touchmove',
    'touchstart'
]);
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
export const use = (elFn, ref) => {
    elFn(ref);
};
export const splitProps = (props, split) => {
    const splitKeys = new Set(split);
    const newProps = {};
    const splitProps = {};
    const keys = Object.getOwnPropertyNames(props);
    for (let i = 0; i < keys.length; i++) {
        const desc = Object.getOwnPropertyDescriptor(props, keys[i]);
        const defaultDesc = !desc?.get && !desc?.set && desc?.enumerable && desc?.writable && desc?.configurable;
        if (splitKeys.has(keys[i])) {
            if (defaultDesc) {
                // @ts-ignore
                splitProps[keys[i]] = desc.value;
            }
            else {
                Object.defineProperty(splitProps, keys[i], desc);
            }
        }
        else {
            if (defaultDesc) {
                // @ts-ignore
                newProps[keys[i]] = desc.value;
            }
            else {
                Object.defineProperty(newProps, keys[i], desc);
            }
        }
    }
    return [splitProps, newProps];
};
const applyProps = (outObj, obj) => {
    const keys = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < keys.length; i++) {
        const desc = Object.getOwnPropertyDescriptor(obj, keys[i]);
        if (!desc)
            continue;
        Object.defineProperty(outObj, keys[i], desc);
    }
    return outObj;
};
export const mergeProps = (newProps, props) => {
    const res = {};
    applyProps(res, newProps);
    applyProps(res, props);
    return res;
};
export const addEventListener = (el, eventType, fn, delegate) => {
    if (delegate) {
        if (Array.isArray(fn)) {
            // @ts-ignore
            el[`$$${eventType}`] = fn[0];
            // @ts-ignore
            el[`$$${eventType}Data`] = fn[1];
            // @ts-ignore
        }
        else {
            // @ts-ignore
            el[`$$${eventType}`] = fn;
        }
    }
    else if (Array.isArray(fn)) {
        const handler = fn[0];
        const listener = (e) => handler(el, fn[1], e);
        fn[0] = listener;
        el.addEventListener(eventType, listener);
    }
    else {
        el.addEventListener(eventType, fn);
    }
};
export const spread = (el, props, _isSVG = false, skipChildren = false) => {
    const prevProps = {
        children: undefined
    };
    if (!skipChildren && props.children) {
        createEffect(() => {
            el.textContent = '';
            renderChild(el, props.children);
            prevProps.children = props.children;
        });
    }
    createEffect(() => typeof props.ref === 'function' && props.ref(el));
    createEffect(() => assign(el, props, prevProps, true));
    return prevProps;
};
export const assign = (el, props, prevProps, skipRef = false) => {
    for (const prop in prevProps) {
        if (!(prop in prevProps)) {
            assignProp(el, prop, null, prevProps[prop]);
            delete prevProps[prop];
        }
    }
    for (const prop in props) {
        const value = props[prop];
        prevProps[prop] = assignProp(el, prop, value, prevProps[prop], skipRef);
    }
};
const assignProp = (el, prop, value, prev, skipRef = false) => {
    if (value === null) {
        el.removeAttribute(prop);
        return null;
    }
    if (prop === 'style')
        return style(el, value);
    if (prop === 'classList')
        return className(el, value);
    if (value === prev)
        return prev;
    if (prop === 'ref')
        if (!skipRef)
            return value(el);
    if (prop.slice(0, 2) === 'on') {
        const name = prop.slice(2).toLowerCase();
        const delegate = DelegatedEvents.has(name);
        if (!delegate && prev) {
            const listener = Array.isArray(prev) ? prev[0] : prev;
            el.removeEventListener(name, listener);
        }
        if (delegate || value) {
            addEventListener(el, name, value, delegate);
            delegate && delegateEvents([name]);
        }
        return;
    }
    if (prop === 'value') {
        // @ts-ignore
        el.value = value;
        return value;
    }
    el.setAttribute(prop, value);
    return value;
};
