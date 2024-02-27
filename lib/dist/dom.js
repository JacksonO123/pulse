import { trackScope } from "@jacksonotto/signals";
export const renderChild = (target, el) => {
    target.appendChild(jsxElementToElement(el));
};
export const mount = (comp, root = document.body) => {
    trackScope(() => {
        renderChild(root, comp);
    });
};
export const jsxElementToElement = (jsxEl) => {
    if (jsxEl instanceof Node)
        return jsxEl;
    else if (Array.isArray(jsxEl))
        return new Text(jsxEl.join(", "));
    return new Text(jsxEl + "");
};
export const insertAfter = (target, el) => {
    target.after(jsxElementToElement(el));
};
