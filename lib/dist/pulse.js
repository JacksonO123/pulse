const $$EVENTS = "_$DX_DELEGATE";
const renderChild = (target, el) => {
    if (el instanceof Node) {
        target.appendChild(el);
    }
    else if (Array.isArray(el)) {
        const text = new Text("[ " + el.join(", ") + " ]");
        renderChild(target, text);
    }
    else {
        renderChild(target, el + "");
    }
};
export const mount = (comp, root = document.body) => {
    renderChild(root, comp);
};
export const createComponent = (comp, props) => {
    return comp(props);
};
export const template = (str, _, isSvg) => {
    const create = () => {
        const el = document.createElement("template");
        el.innerHTML = str;
        return isSvg ? el.content.firstChild.firstChild : el.content.firstChild;
    };
    const el = create();
    return () => el;
};
export const insert = (..._args) => {
    document.body.appendChild(document.createElement("div"));
};
const eventHandler = (e) => {
    const key = `$$${e.type}`;
    let node = ((e.composedPath && e.composedPath()[0]) ||
        e.target);
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
