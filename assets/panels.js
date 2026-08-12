/* ==========================================================================
   RETOS UI, PANELS AND BARS
   Structure pieces: content cards, toolbars, breadcrumbs, labelled rules,
   column grids and loading shims.

     import { Panel, Toolbar, Crumbs, Rule, Cols, Skeleton } from "./panels.js";

     Panel({ head: "Reel 041, side A", body: "Tape logged." })
     Toolbar({ children: [btn, btn, "|", btn, "gap", led] })
     Crumbs({ items: ["Archive", "1997", "Reel 041"] })
     Rule({ label: "Side B" })
     Cols({ cols: 3, children: panels })
     Skeleton({ width: "40%" })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* fold user attrs onto the base attr object */
function pass(base, extra) {
  return extra ? Object.assign(base, extra) : base;
}

/**
 * Content card with optional head and foot. Not a window: no title bar,
 * no drag, no close. Foot renders as a ps-row so actions line up.
 * @example Panel({ icon: "archive", head: "Reel 041, side A", body: "Tape logged and shelved." })
 */
export function Panel(o) {
  o = o || {};
  var head = o.head, body = o.body, foot = o.foot, ic = o.icon;
  if (head == null && body == null && foot == null) {
    head = "Reel 041, side A";
    body = "Tape logged and shelved. The head and foot are optional.";
    if (ic == null) { ic = "archive"; }
  }
  return el("div",
    pass({ class: cx("ps-panel", o.flush && "ps-panel--flush", o.sunk && "ps-panel--sunk", o.class) }, o.attrs),
    head != null && el("div", { class: "ps-panel__head" }, ic && icon(ic, 12), head),
    body != null && el("div", { class: "ps-panel__body" }, body),
    foot != null && el("div", { class: "ps-panel__foot ps-row" }, foot));
}

/* toolbar children tokens, kept as strings so callers need no imports */
function toolbarChild(kid) {
  if (kid === "|")   { return el("div", { class: "ps-toolbar__sep" }); }
  if (kid === "gap") { return el("div", { class: "ps-toolbar__gap" }); }
  return kid;
}

/**
 * Horizontal strip of controls. In children, the string "|" becomes a
 * separator and "gap" a flexible gap that pushes what follows to the end.
 * @example Toolbar({ children: [rewindBtn, playBtn, "|", recordBtn, "gap", led] })
 */
export function Toolbar(o) {
  o = o || {};
  var kids = o.children;
  if (kids == null) {
    kids = [
      el("button", { class: "ps-btn ps-btn--icon", "aria-label": "New" }, icon("plus")),
      el("button", { class: "ps-btn ps-btn--icon", "aria-label": "Open" }, icon("folder-open")),
      el("button", { class: "ps-btn ps-btn--icon", "aria-label": "Save" }, icon("floppy")),
      "|",
      el("button", { class: "ps-btn ps-btn--icon", "aria-label": "Record" }, icon("record")),
      "gap",
      el("span", { class: "ps-led", data: { state: "on" } }, "On air"),
    ];
  }
  if (!Array.isArray(kids)) { kids = [kids]; }
  var out = [];
  for (var i = 0; i < kids.length; i++) { out.push(toolbarChild(kids[i])); }
  return el("div", pass({ class: cx("ps-toolbar", o.class) }, o.attrs), out);
}

/**
 * Breadcrumb trail. Items are strings or { label, href, current };
 * the last item is the current page unless one says otherwise.
 * @example Crumbs({ items: [{ label: "Archive", href: "#" }, { label: "1997", href: "#" }, "Reel 041"] })
 */
export function Crumbs(o) {
  o = o || {};
  var items = o.items || ["Archive", "1997", "Reel 041"];
  var marked = false;
  for (var i = 0; i < items.length; i++) {
    if (items[i] && items[i].current) { marked = true; }
  }
  var lis = [];
  for (var j = 0; j < items.length; j++) {
    var it = typeof items[j] === "string" ? { label: items[j] } : items[j];
    if (j > 0) { lis.push(el("li", { class: "ps-crumbs__sep" }, icon("tri-r", 12))); }
    var current = marked ? !!it.current : j === items.length - 1;
    lis.push(current
      ? el("li", { "aria-current": "page" }, it.label)
      : el("li", null, it.href ? el("a", { href: it.href }, it.label) : it.label));
  }
  return el("ol", pass({ class: cx("ps-crumbs", o.class) }, o.attrs), lis);
}

/**
 * Horizontal rule with a label set into it. start pins the label
 * near the left edge instead of the middle.
 * @example Rule({ label: "Side B", start: true })
 */
export function Rule(o) {
  o = o || {};
  return el("div",
    pass({ class: cx("ps-rule", o.start && "ps-rule--start", o.class) }, o.attrs),
    o.label != null ? o.label : "Side B");
}

/**
 * Equal column grid. cols sets --ps-cols; the stylesheet defaults to 2.
 * @example Cols({ cols: 3, children: [Panel({ body: "One" }), Panel({ body: "Two" }), Panel({ body: "Three" })] })
 */
export function Cols(o) {
  o = o || {};
  var kids = o.children;
  if (kids == null) {
    kids = [Panel({ body: "Reel 040" }), Panel({ body: "Reel 041" })];
  }
  var node = el("div", pass({ class: cx("ps-cols", o.class) }, o.attrs), kids);
  if (o.cols) { node.style.setProperty("--ps-cols", o.cols); }
  return node;
}

/**
 * Loading shim, one line of it. block gives a taller slab; width narrows
 * the line so a stack of them reads like ragged text.
 * @example Skeleton({ width: "40%" })
 */
export function Skeleton(o) {
  o = o || {};
  var node = el("div",
    pass({ class: cx("ps-skeleton", o.block && "ps-skeleton--block", o.class) }, o.attrs));
  if (o.width) { node.style.width = o.width; }
  return node;
}
