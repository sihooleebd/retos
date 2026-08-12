/* ==========================================================================
   RETOS UI, MENUS AND TABS
   Factories for the popup menu, tab strip, pager, and tool palette.

     import { Menu, Tabs, Pager, Palette } from "./menus.js";

     Menu({ items: [{ label: "Show levels", checked: true }, "-"] })
     Tabs({ tabs: ["Info", "Notes"], selected: 0 })
     Pager({ pages: 3, current: 1 })
     Palette({ tools: ["pencil", "stop", "disc", "trash"] })

   All four flip their own state attributes on click (aria-checked,
   aria-selected, aria-current, aria-pressed) and dispatch a bubbling
   CustomEvent("change", { detail }). Everything else is up to the caller.
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* what Menu() renders when called bare */
var MENU_ITEMS = [
  { label: "Show levels", checked: true },
  { label: "Show waveform", key: "2" },
  "-",
  { label: "Sort by", submenu: true },
  { label: "Rebuild index", disabled: true }
];

/* one menu row. every item carries the tick svg; aria-checked hides it. */
function menuItem(it) {
  if (it === "-" || it.sep) { return el("div", { class: "ps-menu__sep" }); }
  var sub = it.submenu ? icon("tri-r", 12) : null;
  if (sub) { sub.setAttribute("style", "margin-left:auto"); }
  var btn = el("button", {
    class: "ps-menu__item",
    "aria-disabled": it.disabled ? "true" : null,
    "aria-checked": it.checked ? "true" : "false",
    onclick: it.onclick
  },
    icon("check", 12, "ps-menu__tick"),
    " " + it.label,
    it.key ? el("span", { class: "ps-menu__key" }, icon("cmd", 12), it.key) : null,
    sub
  );
  btn.addEventListener("click", function () {
    if (it.disabled || it.submenu) { return; }
    var on = btn.getAttribute("aria-checked") !== "true";
    btn.setAttribute("aria-checked", on ? "true" : "false");
    btn.dispatchEvent(new CustomEvent("change", {
      bubbles: true, detail: { label: it.label, checked: on }
    }));
  });
  return btn;
}

/**
 * Popup menu of checkable items. Items are { label, checked, disabled,
 * key, submenu, onclick } or "-" for a separator; key renders as a
 * cmd-glyph shortcut, submenu adds the flyout arrow.
 * @example Menu({ items: [{ label: "Show levels", checked: true }, "-", { label: "Eject reel" }] })
 */
export function Menu(opts) {
  opts = opts || {};
  var items = opts.items || MENU_ITEMS;
  var root = el("div", Object.assign({ class: cx("ps-menu", opts.class) }, opts.attrs));
  items.forEach(function (it) { root.appendChild(menuItem(it)); });
  return root;
}

/**
 * Tab strip. Clicking a tab moves aria-selected and fires change;
 * side: true stacks them vertically for a left rail.
 * @example Tabs({ tabs: ["Info", "Notes", "Air log"], selected: 0 })
 */
export function Tabs(opts) {
  opts = opts || {};
  var tabs = opts.tabs || ["Info", "Notes"];
  var sel = opts.selected == null ? 0 : opts.selected;
  var root = el("div", Object.assign({
    class: cx("ps-tabs", opts.side && "ps-tabs--side", opts.class)
  }, opts.attrs));
  tabs.forEach(function (label, i) {
    var tab = el("button", { class: "ps-tab", "aria-selected": i === sel ? "true" : null }, label);
    tab.addEventListener("click", function () {
      var on = root.querySelector('[aria-selected="true"]');
      if (on === tab) { return; }
      if (on) { on.removeAttribute("aria-selected"); }
      tab.setAttribute("aria-selected", "true");
      tab.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { index: i, tab: label } }));
    });
    root.appendChild(tab);
  });
  return root;
}

/**
 * Page switcher: previous / numbered pages / next. Clicks move
 * aria-current="page" and fire change with the 1-based page number.
 * @example Pager({ pages: 3, current: 1 })
 */
export function Pager(opts) {
  opts = opts || {};
  var pages = opts.pages == null ? 3 : opts.pages;
  var current = opts.current == null ? 1 : opts.current;
  var root = el("div", Object.assign({ class: cx("ps-pager", opts.class) }, opts.attrs));
  var nums = [];
  function page() { return nums.indexOf(root.querySelector('[aria-current="page"]')) + 1; }
  function go(n) {
    if (n < 1 || n > pages || n === page()) { return; }
    var on = root.querySelector('[aria-current="page"]');
    if (on) { on.removeAttribute("aria-current"); }
    nums[n - 1].setAttribute("aria-current", "page");
    root.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { page: n } }));
  }
  function num(n) {
    return el("button", {
      "aria-current": n === current ? "page" : null,
      onclick: function () { go(n); }
    }, String(n));
  }
  root.appendChild(el("button", {
    "aria-label": "Previous", onclick: function () { go(page() - 1); }
  }, icon("tri-l", 12)));
  for (var n = 1; n <= pages; n++) { nums.push(root.appendChild(num(n))); }
  root.appendChild(el("button", {
    "aria-label": "Next", onclick: function () { go(page() + 1); }
  }, icon("tri-r", 12)));
  return root;
}

/**
 * Two-column tool palette. Tools are icon names; one is pressed at a
 * time, clicks move aria-pressed and fire change.
 * @example Palette({ tools: ["pencil", "stop", "disc", "trash"], pressed: 0 })
 */
export function Palette(opts) {
  opts = opts || {};
  var tools = opts.tools || ["pencil", "stop", "disc", "trash"];
  var pressed = opts.pressed == null ? 0 : opts.pressed;
  var root = el("div", Object.assign({ class: cx("ps-palette", opts.class) }, opts.attrs));
  tools.forEach(function (name, i) {
    var btn = el("button", {
      class: "ps-palette__tool",
      "aria-pressed": i === pressed ? "true" : null
    }, icon(name));
    btn.addEventListener("click", function () {
      var on = root.querySelector('[aria-pressed="true"]');
      if (on === btn) { return; }
      if (on) { on.removeAttribute("aria-pressed"); }
      btn.setAttribute("aria-pressed", "true");
      btn.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { index: i, tool: name } }));
    });
    root.appendChild(btn);
  });
  return root;
}
