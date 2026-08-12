/* ==========================================================================
   RETOS UI, FORM LAYOUT
   Fieldsets, labelled rows, list boxes and the split-button combo.

     import { Fieldset, FormRow, Listbox, Combo } from "./forms.js";

     Fieldset({ legend: "Reel details", children: [FormRow()] })
     FormRow({ label: "Title", id: "title", value: "Harbour Lights, 4AM" })
     Listbox({ label: "Reels", options: ["Wet Concrete", "Pager Blues"] })
     Combo({ label: "Export", items: ["Export as WAV", "-", "Export sleeve notes"] })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* merge caller attrs over the computed ones; last write wins */
function pour(base, extra) {
  for (var k in extra) { base[k] = extra[k]; }
  return base;
}

/**
 * Bordered group of form rows with an uppercase legend.
 * @example Fieldset({ legend: "Reel details", children: [FormRow(), FormRow({ inline: true })] })
 */
export function Fieldset(opts) {
  opts = opts || {};
  var legend = opts.legend === undefined ? "Reel details" : opts.legend;
  return el("fieldset",
    pour({ class: cx("ps-fieldset", opts.class) }, opts.attrs),
    legend && el("legend", legend),
    opts.children === undefined ? FormRow() : opts.children);
}

/**
 * Label over (or beside, with inline) a field, plus a help or error line.
 * `error` doubles the hairline on the built-in field; pass `control` to
 * swap in any field markup (a select, a search box) instead.
 * @example FormRow({ label: "Catalogue number", value: "BH-1", error: "Must be three digits, like BH-001." })
 */
export function FormRow(opts) {
  opts = opts || {};
  var invalid = opts.invalid || !!opts.error;
  var control = opts.control || el("div",
    { class: cx("ps-field", invalid && "ps-field--invalid") },
    el("input", {
      class: "ps-input",
      id: opts.id,
      value: opts.value === undefined ? "Harbour Lights, 4AM" : opts.value
    }));
  return el("div",
    pour({ class: cx("ps-formrow", opts.inline && "ps-formrow--inline", opts.class) }, opts.attrs),
    el("label", {
      class: "ps-formrow__label",
      for: opts.id,
      "data-required": !!opts.required
    }, opts.label === undefined ? "Title" : opts.label),
    control,
    opts.help && el("span", { class: "ps-help" }, opts.help),
    opts.error && el("span", { class: "ps-error" }, icon("caution", 12), " " + opts.error));
}

/**
 * Classic list box. Options are strings or { label, icon, selected }.
 * Click moves aria-selected to one option and fires a bubbling "change".
 * @example Listbox({ label: "Reels", options: [{ label: "Harbour Lights, 4AM", selected: true }, "Wet Concrete"] })
 */
export function Listbox(opts) {
  opts = opts || {};
  var options = opts.options || [
    { label: "Harbour Lights, 4AM", selected: true },
    "Wet Concrete", "Low Tide Transmission",
    "Kerosene Summer", "Pager Blues", "Airport Loop"
  ];
  var root = el("div",
    pour({
      class: cx("ps-listbox", opts.class),
      role: "listbox",
      "aria-label": opts.label || "Reels"
    }, opts.attrs),
    options.map(function (o) {
      if (typeof o === "string") { o = { label: o }; }
      return el("button",
        { class: "ps-listbox__opt", role: "option", "aria-selected": String(!!o.selected) },
        icon(o.icon || "disc", 12), " " + o.label);
    }));
  // single select; the css only paints aria-selected="true"
  root.addEventListener("click", function (e) {
    var opt = e.target.closest(".ps-listbox__opt");
    if (!opt) { return; }
    var all = root.querySelectorAll(".ps-listbox__opt");
    for (var i = 0; i < all.length; i++) {
      all[i].setAttribute("aria-selected", String(all[i] === opt));
    }
    root.dispatchEvent(new CustomEvent("change", {
      bubbles: true, detail: { value: opt.textContent.trim() }
    }));
  });
  return root;
}

/**
 * Split button: a main action plus a .ps-btn--caret that opens a .ps-menu.
 * Items are strings, "-" for a separator. The caret toggles the menu;
 * picking an item closes it and fires a bubbling "change".
 * @example Combo({ label: "Export", items: ["Export as WAV", "Export as MP3", "-", "Export sleeve notes"] })
 */
export function Combo(opts) {
  opts = opts || {};
  var items = opts.items || ["Export as WAV", "Export as MP3", "-", "Export sleeve notes"];
  var caret = el("button", {
    class: "ps-btn ps-btn--face ps-btn--caret",
    "aria-expanded": "false",
    "aria-label": opts.caretLabel || "More export options"
  }, icon("tri-d", 12));
  var menu = el("div", { class: "ps-menu ps-combo__menu", hidden: true },
    items.map(function (it) {
      return it === "-"
        ? el("div", { class: "ps-menu__sep" })
        : el("button", { class: "ps-menu__item" }, it);
    }));
  var root = el("div",
    pour({ class: cx("ps-combo", opts.class) }, opts.attrs),
    el("div", { class: "ps-btngroup" },
      el("button", { class: "ps-btn ps-btn--face", onclick: opts.onclick }, opts.label || "Export"),
      caret),
    menu);
  // no outside-click close on purpose: no global listeners in assets/
  caret.addEventListener("click", function () {
    var open = caret.getAttribute("aria-expanded") === "true";
    caret.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });
  menu.addEventListener("click", function (e) {
    var item = e.target.closest(".ps-menu__item");
    if (!item) { return; }
    caret.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    root.dispatchEvent(new CustomEvent("change", {
      bubbles: true, detail: { value: item.textContent }
    }));
  });
  return root;
}
