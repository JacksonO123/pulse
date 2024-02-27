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
const $$EVENTS = "_$DX_DELEGATE";
const renderChild = (target, el) => {
  if (el instanceof Node) {
    target.appendChild(el);
  } else if (Array.isArray(el)) {
    const text = new Text("[ " + el.join(", ") + " ]");
    renderChild(target, text);
  } else {
    renderChild(target, el + "");
  }
};
const mount = (comp2, root = document.body) => {
  renderChild(root, comp2);
};
const createComponent = (comp2, props) => {
  return comp2(props);
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
const insert = (..._args) => {
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
var _tmpl$ = /* @__PURE__ */ template(`<div><span>here</span><button>test `);
const sig = (val) => {
  let obj = {
    value: val
  };
  return (newVal) => {
    if (newVal)
      obj.value = newVal;
    return obj.value;
  };
};
const Comp = (props) => {
  console.log(props);
  const test = sig(4);
  const change = (e) => {
    console.log("CLICKING", e.currentTarget);
    test(test() + 1);
  };
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    _el$3.firstChild;
    _el$3.$$click = change;
    insert(_el$3, test, null);
    return _el$;
  })();
};
delegateEvents(["click"]);
const comp = createComponent(Comp, {
  property: "huh",
  children: "test"
});
mount(comp);
