/* ==========================================================================
   RETOS UI, DOM HELPERS
   The little hyperscript everything in assets/ is built with.

     import { el, cx, icon, frag } from "./dom.js";

     el("button", { class: "ps-btn ps-btn--accent", onclick: go }, "Record")
     el("div", { class: "ps-knob", data: { min: 0, max: 11, value: 7 } })
     icon("play")            <svg class="ps-icon"><use href="#i-play"/></svg>
     icon("cassette", 48)    sizes are 12, 24, 48, 72 only, see README

   Rules of the house:
     - No top-level DOM access in any assets/ module. Build on call, not on
       import, so the files load cleanly outside a browser.
     - Factories return a plain element. The stylesheet is the component;
       these helpers only reproduce its markup.
   ========================================================================== */

const SVG_NS = "http://www.w3.org/2000/svg";

/* Join class parts, skipping empties: cx("ps-btn", primary && "ps-btn--accent") */
export function cx() {
  var out = [];
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i]) { out.push(arguments[i]); }
  }
  return out.join(" ");
}

function append(node, child) {
  if (child === null || child === undefined || child === false) { return; }
  if (Array.isArray(child)) {
    for (var i = 0; i < child.length; i++) { append(node, child[i]); }
    return;
  }
  if (typeof child === "string" || typeof child === "number") {
    node.appendChild(document.createTextNode(String(child)));
    return;
  }
  node.appendChild(child);
}

function assign(node, attrs) {
  for (var key in attrs) {
    var v = attrs[key];
    if (v === null || v === undefined || v === false) { continue; }
    if (key === "class") {
      node.setAttribute("class", v);
    } else if (key === "style" && typeof v === "object") {
      for (var p in v) { node.style.setProperty(p, v[p]); }
    } else if (key === "data" && typeof v === "object") {
      for (var d in v) { node.setAttribute("data-" + d, v[d]); }
    } else if (key === "html") {
      node.innerHTML = v;
    } else if (key.slice(0, 2) === "on" && typeof v === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), v);
    } else if (v === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, v);
    }
  }
}

/* el(tag, attrs?, ...children) — attrs is optional, children flatten,
   null/false children vanish. */
export function el(tag) {
  var attrs = arguments[1];
  var from = 2;
  if (attrs === undefined || attrs === null) {
    attrs = {};
  } else if (typeof attrs !== "object" || Array.isArray(attrs) || attrs.nodeType) {
    attrs = {};
    from = 1;
  }
  var node = document.createElement(tag);
  assign(node, attrs);
  for (var i = from; i < arguments.length; i++) { append(node, arguments[i]); }
  return node;
}

/* icon(name, size?, extraClass?) — the sprite is injected by ps-icons.js.
   Sizes other than 12, 24, 48, 72 blur the art; 24 is the default. */
export function icon(name, size, extraClass) {
  var svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", cx("ps-icon", size && size !== 24 && "ps-icon--" + size, extraClass));
  svg.setAttribute("aria-hidden", "true");
  var use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", "#i-" + name);
  svg.appendChild(use);
  return svg;
}

/* frag(...children) — a DocumentFragment, for returning siblings. */
export function frag() {
  var f = document.createDocumentFragment();
  for (var i = 0; i < arguments.length; i++) { append(f, arguments[i]); }
  return f;
}
