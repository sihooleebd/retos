/* ==========================================================================
   RETOS UI, WINDOW PARTS
   Factories for the window shell and its furniture.

     import { Window, Statusbar, Grip, Alert, draggable } from "./windows.js";

     Window({ title: "Levels", utility: true })     framed window with titlebar
     Window({ title: "Deck", draggable: true })     movable by its titlebar
     Statusbar({ items: ["6 items", "4.9 GB free"] }) bar with dividers and grip
     Grip()                                          bare resize grip
     Alert({ tone: "caution", title: "Reel 037 is damaged" })
     draggable(win)                                  retrofit any window

   Title bar glyph buttons (.ps-winbtn) are a sub-part; pass control specs
   like { icon: "close", label: "Close" } to Window instead.
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* {icon, label} -> .ps-winbtn; a ready node passes through untouched */
function winbtn(spec) {
  if (spec && spec.nodeType) { return spec; }
  return el("button", { class: "ps-winbtn", "aria-label": spec.label }, icon(spec.icon));
}

/* every drag raises the window above the last one touched */
var zTop = 100;

/**
 * Make a window movable by its titlebar (or a handle of your choosing).
 * Moves with an integer-rounded transform so layout never reflows and the
 * 1px hairlines stay crisp. Titlebar buttons keep working; drags that
 * start on a control are ignored.
 * @example draggable(win)
 */
export function draggable(win, handle) {
  handle = handle || win.querySelector(".ps-window__titlebar") || win;
  handle.style.touchAction = "none";
  if (getComputedStyle(win).position === "static") { win.style.position = "relative"; }
  var base = { x: 0, y: 0 };
  var drag = null;

  handle.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || e.target.closest(".ps-winbtn, button, input, select, a")) { return; }
    handle.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY };
    win.style.zIndex = ++zTop;
    e.preventDefault();
  });
  handle.addEventListener("pointermove", function (e) {
    if (!drag) { return; }
    var x = Math.round(base.x + e.clientX - drag.x);
    var y = Math.round(base.y + e.clientY - drag.y);
    win.style.transform = "translate(" + x + "px," + y + "px)";
  });
  function end(e) {
    if (!drag) { return; }
    base.x = Math.round(base.x + e.clientX - drag.x);
    base.y = Math.round(base.y + e.clientY - drag.y);
    drag = null;
    if (handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) {
      handle.releasePointerCapture(e.pointerId);
    }
  }
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
  return win;
}

/**
 * Framed window: titlebar with glyph buttons, body, optional footer and statusbar.
 * draggable: true makes it movable by the titlebar.
 * @example Window({ title: "Levels", utility: true, children: "On air.", statusbar: Statusbar() })
 */
export function Window(opts) {
  opts = opts || {};
  var controls = opts.controls || [{ icon: "close", label: "Close" }];
  var win = el("div",
    Object.assign({
      class: cx("ps-window",
        opts.utility && "ps-window--utility",
        opts.floating && "ps-window--floating",
        opts.class),
      "data-state": opts.inactive ? "inactive" : null
    }, opts.attrs),
    el("header", { class: "ps-window__titlebar" },
      controls.map(winbtn),
      el("span", { class: "ps-window__title" },
        opts.title === undefined ? "Reel Deck" : opts.title)),
    el("div", { class: cx("ps-window__body", opts.flush && "ps-window__body--flush") },
      opts.children === undefined ? "Now spooling reel 042, side B." : opts.children),
    opts.footer != null && el("div", { class: "ps-window__footer" }, opts.footer),
    opts.statusbar || null);
  if (opts.draggable) { draggable(win); }
  return win;
}

/**
 * Window status bar; a divider drops between items, grip sits at the far right.
 * @example Statusbar({ items: ["6 items", "4.9 GB free"] })
 */
export function Statusbar(opts) {
  opts = opts || {};
  var items = opts.items || ["6 items", "4.9 GB free"];
  var kids = [];
  for (var i = 0; i < items.length; i++) {
    if (i > 0) { kids.push(el("div", { class: "ps-statusbar__divider" })); }
    kids.push(typeof items[i] === "string" ? el("span", null, items[i]) : items[i]);
  }
  if (opts.grip !== false) { kids.push(Grip()); }
  return el("div",
    Object.assign({ class: cx("ps-statusbar", opts.class) }, opts.attrs),
    kids);
}

/**
 * Resize grip for a window corner.
 * @example Grip()
 */
export function Grip(opts) {
  opts = opts || {};
  return el("div", Object.assign({ class: cx("ps-grip", opts.class) }, opts.attrs));
}

/**
 * Modal alert card; tone "caution" or "stop" tints the glyph, actions right-align.
 * @example Alert({ tone: "stop", title: "Reel 037 is unrecoverable", text: "The splice failed." })
 */
export function Alert(opts) {
  opts = opts || {};
  var tone = opts.tone === undefined ? "caution" : opts.tone;
  var glyph = opts.icon || (tone === "stop" ? "times-circle"
    : tone === "caution" ? "caution" : "info");
  var actions = opts.actions || [
    el("button", { class: "ps-btn ps-btn--plain" }, "Cancel"),
    el("button", { class: "ps-btn ps-btn--face ps-btn--default" }, "Digitise")
  ];
  return el("div",
    Object.assign({ class: cx("ps-alert", tone && "ps-alert--" + tone, opts.class) }, opts.attrs),
    el("div", { class: "ps-alert__row" },
      el("div", { class: "ps-alert__glyph" }, icon(glyph)),
      el("div", null,
        el("h2", { class: "ps-alert__title" },
          opts.title === undefined ? "Reel 037 is damaged" : opts.title),
        el("p", { class: "ps-alert__text" },
          opts.text === undefined ? "Playback will skip at 12:40. Digitise anyway?" : opts.text))),
    actions.length ? el("div", { class: "ps-alert__actions" }, actions) : null);
}
