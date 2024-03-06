import { getParent, insertAfter, jsxElementToElement, removeElementOrArr, renderChild, replaceElements } from './dom.js';
import { cleanupHandler, createSignal, getSignalInternals, trackScope, createEffect } from '@jacksonotto/signals';
export const For = (props) => {
    const info = [];
    let parent = null;
    let beforeEl = null;
    let hookEl = new Text();
    const [prevCleanup, addCleanup] = cleanupHandler();
    createEffect(() => {
        prevCleanup();
        const arr = props.each;
        if (!beforeEl && !parent) {
            let hookInstance;
            if (info.length === 0) {
                hookInstance = hookEl;
            }
            else {
                const el = info[0][2];
                hookInstance = Array.isArray(el) ? el.flat()[0] : el;
            }
            const hookBefore = hookInstance.previousSibling;
            if (hookBefore)
                beforeEl = hookBefore;
            parent = hookInstance.parentNode;
        }
        const cleanup = trackScope(() => {
            for (let i = 0; i < Math.min(info.length, arr.length); i++) {
                if (info[i][0]() !== arr[i])
                    info[i][1](arr[i]);
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
            if (!parent && !beforeEl)
                continue;
            if (info.length - 1 === 0) {
                if (beforeEl) {
                    insertAfter(beforeEl, el);
                }
                else {
                    renderChild(parent, el);
                }
            }
            else {
                let beforeItem = info[index - 1][2];
                beforeItem = Array.isArray(beforeItem) ? beforeItem[beforeItem.length - 1] : beforeItem;
                insertAfter(beforeItem, el);
            }
        }
        while (info.length > arr.length) {
            const indexInfo = info.pop();
            const internals = getSignalInternals(indexInfo[0]);
            internals.dispose();
            removeElementOrArr(indexInfo[2]);
        }
    });
    if (info.length === 0)
        return hookEl;
    return info.map((item) => item[2]);
};
const page404 = () => {
    const el = document.createElement('div');
    el.textContent = '404 page not found';
    return el;
};
const [currentPath, setCurrentPath] = createSignal('/');
export const PulseRouter = (props) => {
    const pathname = location.pathname;
    let prevEl = null;
    setCurrentPath(pathname);
    window.addEventListener('popstate', (e) => {
        const newPath = e.currentTarget.location.pathname;
        setCurrentPath(newPath);
    });
    const [prevCleanup, setCleanup] = cleanupHandler();
    createEffect(() => {
        prevCleanup();
        for (let i = 0; i < props.routes.length; i++) {
            if (props.routes[i].path === currentPath()) {
                const cleanup = trackScope(() => {
                    const newEl = jsxElementToElement(props.routes[i].element());
                    if (prevEl !== null) {
                        const parent = getParent(prevEl);
                        if (parent === null)
                            return;
                        replaceElements(prevEl, newEl, parent, null);
                    }
                    prevEl = newEl;
                });
                setCleanup(cleanup);
                break;
            }
        }
    });
    if (prevEl)
        return prevEl;
    return page404();
};
export const redirect = (to) => {
    setCurrentPath(to);
    window.history.pushState({}, '', to);
};
export const Link = (props) => {
    const link = document.createElement('a');
    Object.entries(props).map(([key, value]) => link.setAttribute(key, value));
    if (props.children !== undefined)
        renderChild(link, props.children);
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (props.href)
            setCurrentPath(props.href);
    });
    return link;
};
