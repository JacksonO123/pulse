var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let Owner$1 = class Owner {
  constructor() {
    __publicField(this, "contexts");
    this.contexts = [];
  }
  currentContext() {
    return this.contexts[this.contexts.length - 1];
  }
  addContext(context) {
    this.contexts.push(context);
  }
  popContext() {
    return this.contexts.pop();
  }
  getContext() {
    return this.contexts;
  }
};
const owner$1 = new Owner$1();
const currentContext$1 = () => owner$1.currentContext();
class Context {
  constructor() {
    __publicField(this, "owned");
    __publicField(this, "disposeEvents");
    this.owned = [];
    this.disposeEvents = [];
  }
  own(state) {
    this.owned.push(state);
  }
  dispose() {
    this.disposeEvents.forEach((event) => event());
    this.disposeEvents = [];
    this.owned = [];
  }
  onDispose(fn) {
    this.disposeEvents.push(fn);
    const index = this.disposeEvents.length - 1;
    return (newFn) => {
      if (this.disposeEvents.length > index) {
        this.disposeEvents[index] = newFn;
      }
    };
  }
  addEffect(fn) {
    this.owned.forEach((signal) => signal.addEffect(fn));
  }
  removeEffect(fn) {
    this.owned.forEach((signal) => signal.removeEffect(fn));
  }
  getOwned() {
    return this.owned;
  }
}
const trackScope = (fn) => {
  const current = new Context();
  owner$1.addContext(current);
  fn();
  owner$1.popContext();
  const outerContext = currentContext$1();
  if (outerContext) {
    onCleanup(() => cleanup(current));
  }
  return () => cleanup(current);
};
const cleanup = (context) => {
  context.dispose();
};
const onCleanup = (fn) => {
  const context = currentContext$1();
  if (!context)
    return;
  return context.onDispose(fn);
};
const createEffect = (fn) => {
  const cleanup2 = trackScope(() => {
    fn();
    const current = currentContext$1();
    if (!current)
      return;
    current.addEffect(fn);
    onCleanup(() => {
      current.removeEffect(fn);
    });
  });
  onCleanup(cleanup2);
};
const renderChild = (target, el) => {
  target.appendChild(jsxElementToElement(el));
};
const mount = (comp, root = document.body) => {
  trackScope(() => {
    renderChild(root, comp);
  });
};
const jsxElementToElement = (jsxEl) => {
  if (jsxEl instanceof Node)
    return jsxEl;
  else if (Array.isArray(jsxEl))
    return new Text(jsxEl.join(", "));
  return new Text(jsxEl + "");
};
const $$EVENTS = "_$DX_DELEGATE";
const createComponent = (comp, props) => {
  let res;
  trackScope(() => {
    res = comp(props);
  });
  return res;
};
const template = (str, _, isSvg) => {
  const create = () => {
    const el2 = document.createElement("template");
    el2.innerHTML = str;
    return isSvg ? el2.content.firstChild.firstChild : el2.content.firstChild;
  };
  const el = create();
  return () => el;
};
const insert = (parent, accessor, marker, initial) => {
  console.log({ parent, accessor, marker, initial });
  if (typeof accessor === "function") {
    let prevEl;
    createEffect(() => {
      const el = jsxElementToElement(accessor());
      if (prevEl === null || prevEl === void 0) {
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
const eventHandler = (e) => {
  const key = `$$${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    }
  });
  while (node) {
    const handler = node[key];
    if (handler && !node.disabled) {
      const data = node[`${key}Data`];
      if (data !== void 0)
        handler(data, e);
      else {
        handler(e);
      }
    }
    node = node.parentNode;
  }
};
const delegateEvents = (events, doc = document) => {
  const e = doc[$$EVENTS] || (doc[$$EVENTS] = /* @__PURE__ */ new Set());
  for (let i = 0; i < events.length; i++) {
    const name = events[i];
    if (!e.has(name)) {
      e.add(name);
      doc.addEventListener(name, eventHandler);
    }
  }
};
class Owner2 {
  constructor() {
    __publicField(this, "contexts");
    this.contexts = [];
  }
  currentContext() {
    return this.contexts[this.contexts.length - 1];
  }
  addContext(context) {
    this.contexts.push(context);
  }
  popContext() {
    return this.contexts.pop();
  }
  getContext() {
    return this.contexts;
  }
}
const owner = new Owner2();
const currentContext = () => owner.currentContext();
const track = (state) => {
  const current = currentContext();
  if (!current)
    return;
  current.own(state);
};
class State {
  constructor(state) {
    __publicField(this, "effects");
    __publicField(this, "value");
    this.value = state;
    this.effects = [];
  }
  _read() {
    return this.value;
  }
  read() {
    track(this);
    return this._read();
  }
  _write(newValue) {
    this.value = newValue;
  }
  write(newValue) {
    this._write(newValue);
    this.effects.forEach((effect) => effect());
  }
  dispose() {
    this.effects = [];
  }
  addEffect(fn) {
    this.effects.push(fn);
  }
  removeEffect(fn) {
    this.effects = this.effects.filter((effect) => effect !== fn);
  }
}
const createSignal = (value) => {
  const current = new State(value);
  return [
    () => current.read(),
    (value2) => current.write(typeof value2 === "function" ? value2(current._read()) : value2)
  ];
};
var _tmpl$$1 = /* @__PURE__ */ template(`<div><span>here</span><button>test `);
const Comp = (_1) => {
  const [test, setTest] = createSignal(0);
  const [bool, _] = createSignal(false);
  const change = (e) => {
    console.log("CLICKING", e.currentTarget);
    setTest((prev) => prev + 1);
  };
  return (() => {
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    _el$3.firstChild;
    _el$3.$$click = change;
    insert(_el$3, test, null);
    insert(_el$3, bool, null);
    return _el$;
  })();
};
delegateEvents(["click"]);
var _tmpl$ = /* @__PURE__ */ template(`<div>`);
const App = () => {
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(Comp, {
      property: "what",
      children: "sdlkfjsdl"
    }));
    return _el$;
  })();
};
mount(createComponent(App, {}));
