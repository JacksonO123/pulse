var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value })
    : (obj[key] = value);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== 'symbol' ? key + '' : key, value);
  return value;
};
(function polyfill() {
  const relList = document.createElement('link').relList;
  if (relList && relList.supports && relList.supports('modulepreload')) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === 'LINK' && node.rel === 'modulepreload') processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === 'use-credentials') fetchOpts.credentials = 'include';
    else if (link.crossOrigin === 'anonymous') fetchOpts.credentials = 'omit';
    else fetchOpts.credentials = 'same-origin';
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Owner {
  constructor() {
    __publicField(this, 'contexts');
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
const owner = new Owner();
const currentContext = () => owner.currentContext();
const track = (state) => {
  const current = currentContext();
  if (!current) return;
  current.own(state);
};
class Context {
  constructor() {
    __publicField(this, 'owned');
    __publicField(this, 'disposeEvents');
    this.owned = [];
    this.disposeEvents = [];
  }
  own(state) {
    this.owned.push(state);
  }
  ownMany(states) {
    this.owned.push(...states);
  }
  dispose() {
    this.runDisposeEvents();
    this.owned = [];
  }
  runDisposeEvents() {
    this.disposeEvents.forEach((event) => event());
    this.disposeEvents = [];
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
class State {
  constructor(state) {
    __publicField(this, 'effects');
    __publicField(this, 'value');
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
const trackScope = (fn, registerCleanup = true) => {
  const current = new Context();
  owner.addContext(current);
  fn();
  owner.popContext();
  const outerContext = currentContext();
  if (outerContext && registerCleanup) {
    onCleanup(() => cleanup(current));
  }
  return () => cleanup(current);
};
const cleanup = (context) => {
  context.dispose();
};
const onCleanup = (fn) => {
  const context = currentContext();
  if (!context) return;
  return context.onDispose(fn);
};
const createSignal = (value) => {
  const current = new State(value);
  return [
    () => current.read(),
    (value2) => current.write(typeof value2 === 'function' ? value2(current._read()) : value2)
  ];
};
const createEffect = (fn) => {
  const cleanup2 = trackScope(() => {
    fn();
    const current = currentContext();
    if (!current) return;
    current.addEffect(fn);
    onCleanup(() => {
      current.removeEffect(fn);
    });
  });
  onCleanup(cleanup2);
};
const derived = (fn) => {
  const [value, setValue] = createSignal(null);
  let prevCleanup = null;
  let updateCleanup = void 0;
  const handleDerived = () => {
    if (prevCleanup) prevCleanup();
    const cleanup2 = trackScope(() => {
      setValue(fn());
      const current = currentContext();
      if (!current) return;
      current.addEffect(handleDerived);
      onCleanup(() => {
        current.removeEffect(handleDerived);
      });
    });
    prevCleanup = cleanup2;
    updateCleanup == null ? void 0 : updateCleanup(cleanup2);
  };
  handleDerived();
  updateCleanup = onCleanup(prevCleanup);
  return value;
};
const renderChild = (parent, target) => {
  const element = jsxElementToElement(target);
  if (Array.isArray(element)) {
    element.forEach((item) => parent.appendChild(item));
  } else {
    parent.appendChild(element);
  }
};
const mount = (comp, root = document.body) => {
  trackScope(() => {
    renderChild(root, comp);
  });
};
const jsxElementToElement = (jsxEl) => {
  if (jsxEl instanceof Node) return jsxEl;
  if (Array.isArray(jsxEl)) {
    return jsxEl.map((el) => jsxElementToElement(el)).flat();
  }
  return new Text(jsxEl + '');
};
const insertAfter = (target, el) => {
  const element = jsxElementToElement(el);
  if (Array.isArray(element)) {
    let prev = target;
    element.forEach((item) => {
      prev.after(item);
      prev = item;
    });
  } else {
    target.after(element);
  }
};
const insertBefore = (target, el) => {
  const element = jsxElementToElement(el);
  if (Array.isArray(element)) {
    let prev = target;
    element.reverse().forEach((item) => {
      prev.before(item);
      prev = item;
    });
  } else {
    target.before(element);
  }
};
const replaceElements = (target, el, parent, after) => {
  if (Array.isArray(target)) {
    if (Array.isArray(el)) {
      if (target.length === 0) {
        if (after) insertBefore(after, el);
        else {
          console.log('here');
          renderChild(parent, el);
        }
        return;
      }
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
    } else {
      if (target.length === 0) {
        if (after) insertBefore(after, el);
        else renderChild(parent, el);
        return;
      }
      while (target.length > 1) {
        target[target.length - 1].remove();
        target.pop();
      }
      target[0].replaceWith(el);
    }
  } else {
    if (Array.isArray(el)) {
      if (el.length === 0) {
        target.remove();
        return;
      }
      const first = el.shift();
      target.replaceWith(first);
      insertAfter(first, el);
    } else {
      target.replaceWith(el);
    }
  }
};
const eventHandler = (e) => {
  const key = `$$${e.type}`;
  let node = (e.composedPath && e.composedPath()[0]) || e.target;
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
      if (data !== void 0) handler(data, e);
      else {
        handler(e);
      }
    }
    node = node.parentNode;
  }
};
const $$EVENTS = '_$DX_DELEGATE';
const createComponent = (comp, props) => {
  let res;
  const cleanup2 = trackScope(() => {
    res = comp(props);
  });
  onCleanup(cleanup2);
  return res;
};
const template = (str, _, isSvg) => {
  const create = () => {
    const el2 = document.createElement('template');
    el2.innerHTML = str;
    return isSvg ? el2.content.firstChild.firstChild : el2.content.firstChild;
  };
  const el = create();
  return () => (el == null ? void 0 : el.cloneNode(true));
};
const insert = (parent, accessor, marker, initial) => {
  if (initial) {
    console.log('HAS INITIAL', { parent, accessor, marker, initial });
  }
  if (typeof accessor === 'function') {
    let prevEl = null;
    let prevCleanup = null;
    let updateCleanup = void 0;
    let context = null;
    let computed = false;
    createEffect(() => {
      if (!context) {
        const current = currentContext();
        if (!current) return;
        context = current;
      }
      if (prevCleanup) prevCleanup();
      let innerOwned = [];
      const cleanup2 = trackScope(() => {
        const value = accessor();
        const current = currentContext();
        if (current && !computed) {
          innerOwned = current.getOwned();
        }
        if (value === false || value === null || value === void 0) {
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
          } else {
            renderChild(parent, el);
          }
        } else {
          replaceElements(prevEl, el, parent, marker);
        }
        prevEl = el;
      }, false);
      if (!computed) {
        context.ownMany(innerOwned);
        computed = true;
      }
      prevCleanup = cleanup2;
      if (updateCleanup) {
        updateCleanup(cleanup2);
      } else {
        updateCleanup = onCleanup(cleanup2);
      }
    });
  } else {
    renderChild(parent, accessor);
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
var _tmpl$$4 = /* @__PURE__ */ template(`<span>in another component`);
const Another = () => {
  return _tmpl$$4();
};
var _tmpl$$3 = /* @__PURE__ */ template(`<span>has `);
const ArrayItem = ({ num }) => {
  console.log('running');
  onCleanup(() => {
    console.log('cleaned');
  });
  return (() => {
    var _el$ = _tmpl$$3();
    _el$.firstChild;
    insert(_el$, num, null);
    return _el$;
  })();
};
var _tmpl$$2 = /* @__PURE__ */ template(
  `<div><button>Add</button><button>Remove</button><span>what about now`
);
const ArrayTest = () => {
  const [arr, setArr] = createSignal([1, 2, 3, 4]);
  const add = () => {
    setArr((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  };
  const remove = () => {
    setArr((prev) => {
      prev.pop();
      return [...prev];
    });
  };
  return (() => {
    var _el$ = _tmpl$$2(),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.nextSibling,
      _el$4 = _el$3.nextSibling;
    _el$2.$$click = add;
    _el$3.$$click = remove;
    insert(
      _el$,
      () =>
        arr().map((item) =>
          createComponent(ArrayItem, {
            num: item
          })
        ),
      _el$4
    );
    return _el$;
  })();
};
delegateEvents(['click']);
var _tmpl$$1 = /* @__PURE__ */ template(`<div><span>here</span><button>test </button><button>click me`);
const Comp = (_) => {
  const [test, setTest] = createSignal(0);
  const [bool, setBool] = createSignal(false);
  const change = () => {
    console.log('clicked');
    setTest((prev) => prev + 1);
  };
  const another = () => {
    setBool((prev) => !prev);
  };
  return (() => {
    var _el$ = _tmpl$$1(),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.nextSibling;
    _el$3.firstChild;
    var _el$5 = _el$3.nextSibling;
    _el$3.$$click = change;
    insert(_el$3, test, null);
    insert(
      _el$,
      (() => {
        var _c$ = derived(() => !!(bool() && test() === 0));
        return () => (_c$() ? createComponent(Another, {}) : 'epic');
      })(),
      _el$5
    );
    _el$5.$$click = another;
    insert(_el$, createComponent(ArrayTest, {}), null);
    return _el$;
  })();
};
delegateEvents(['click']);
var _tmpl$ = /* @__PURE__ */ template(`<div>`);
const App = () => {
  return (() => {
    var _el$ = _tmpl$();
    insert(
      _el$,
      createComponent(Comp, {
        property: 'what',
        children: 'sdlkfjsdl'
      })
    );
    return _el$;
  })();
};
mount(createComponent(App, {}));
