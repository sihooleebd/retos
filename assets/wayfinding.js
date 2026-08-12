/* ==========================================================================
   RETOS UI, NAV, STEPS, FOLDS
   Wayfinding: the sidebar nav, disclosure folds, wizard steps, side tabs.

     import { Nav, Disclosure, Steps, SideTabs } from "./wayfinding.js";

     Nav({ items: [{ title: "Library" }, { label: "All reels", icon: "disc" }] })
     Disclosure({ summary: "Tape condition", body: "Baked before transfer." })
     Steps({ steps: ["Inspect", "Bake", "Transfer", "Master"], current: 2 })
     SideTabs({ tabs: ["General", "Audio", "Network"], selected: 0 })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* fold caller attrs over the defaults; last write wins */
function merge(base, extra) {
  for (var k in extra) { base[k] = extra[k]; }
  return base;
}

var NAV_ITEMS = [
  { title: "Library" },
  { label: "All reels", icon: "disc", count: 96, current: true },
  { label: "Favourites", icon: "heart", count: 12 },
  { label: "Recent", icon: "clock" },
  { title: "Admin" },
  { label: "Hosts", icon: "users" },
  { label: "Settings", icon: "gear" }
];

/**
 * Sidebar nav. Items are { title } for a section heading or
 * { label, icon, count, current, attrs } for a row; current marks
 * the aria-current="page" item.
 * @example Nav({ items: [{ title: "Library" }, { label: "All reels", icon: "disc", count: 96, current: true }] })
 */
export function Nav(opts) {
  opts = opts || {};
  var items = opts.items || NAV_ITEMS;
  return el("nav", merge({ class: cx("ps-nav", opts.class) }, opts.attrs),
    items.map(function (it) {
      if (it.title !== undefined) {
        return el("div", { class: "ps-nav__title" }, it.title);
      }
      return el("button",
        merge({
          class: "ps-nav__item",
          "aria-current": it.current ? "page" : null
        }, it.attrs),
        it.icon && icon(it.icon, 12),
        it.label,
        it.count !== undefined && el("span", { class: "ps-nav__count" }, it.count)
      );
    })
  );
}

/**
 * Collapsible fold on native <details>; the [open] attribute turns the
 * twist, so no wiring is needed. Stack several to share hairlines.
 * @example Disclosure({ summary: "Tape condition", body: "Light shedding on the first two minutes.", open: true })
 */
export function Disclosure(opts) {
  opts = opts || {};
  var summary = opts.summary || "Tape condition";
  var body = opts.body ||
    "Light shedding on the first two minutes. Baked at 54C for eight hours before transfer.";
  return el("details",
    merge({ class: cx("ps-disclosure", opts.class), open: !!opts.open }, opts.attrs),
    el("summary", { class: "ps-disclosure__head" },
      el("span", { class: "ps-disclosure__twist" }, icon("tri-r", 12)),
      summary
    ),
    el("div", { class: "ps-disclosure__body" }, body)
  );
}

/**
 * Wizard steps. Steps before current render done with a check,
 * the current one carries aria-current="step", the rest wait.
 * @example Steps({ steps: ["Inspect", "Bake", "Transfer", "Master"], current: 2 })
 */
export function Steps(opts) {
  opts = opts || {};
  var steps = opts.steps || ["Inspect", "Bake", "Transfer", "Master"];
  var current = opts.current === undefined ? 2 : opts.current;
  return el("div", merge({ class: cx("ps-steps", opts.class) }, opts.attrs),
    steps.map(function (label, i) {
      var done = i < current;
      return el("div", {
        class: "ps-steps__step",
        "data-state": done ? "done" : null,
        "aria-current": i === current ? "step" : null
      },
        el("span", { class: "ps-steps__n" }, done ? icon("check", 12) : i + 1),
        label
      );
    })
  );
}

/**
 * Vertical tab strip (.ps-tabs--side). Clicking a tab moves
 * aria-selected and fires a bubbling "change" with { index, label }.
 * @example SideTabs({ tabs: ["General", "Audio", "Network"], selected: 0 })
 */
export function SideTabs(opts) {
  opts = opts || {};
  var tabs = opts.tabs || ["General", "Audio", "Network"];
  var selected = opts.selected || 0;
  var root = el("div",
    merge({ class: cx("ps-tabs", "ps-tabs--side", opts.class) }, opts.attrs),
    tabs.map(function (label, i) {
      return el("button", {
        class: "ps-tab",
        "aria-selected": i === selected ? "true" : "false",
        onclick: function (e) {
          var btns = root.querySelectorAll(".ps-tab");
          for (var j = 0; j < btns.length; j++) {
            btns[j].setAttribute("aria-selected",
              btns[j] === e.currentTarget ? "true" : "false");
          }
          root.dispatchEvent(new CustomEvent("change",
            { bubbles: true, detail: { index: i, label: label } }));
        }
      }, label);
    })
  );
  return root;
}
