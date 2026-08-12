/* ==========================================================================
   RETOS UI, INPUTS
   Factories for the catalogue's Inputs section.

     import { Field, Search, Stepper, Switch, Check, Dropzone, Textarea }
       from "./inputs.js";

     Field({ placeholder: "Reel name", value: "Harbour Lights" })
     Search({ placeholder: "Search the archive" })
     Stepper({ value: 128, min: 40, max: 220, label: "BPM" })
     Switch({ checked: true, label: "On air" })
     Check({ label: "Loop", checked: true })
     Dropzone({ label: "Drop a reel here, or choose a file" })
     Textarea({ placeholder: "Liner notes" })

   Switch, Stepper and Dropzone carry minimal wiring: their look is driven
   by aria-checked / value / data-over, so each flips its own attribute and
   fires a bubbling CustomEvent("change", { detail }).
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/**
 * Bordered text field: .ps-field shell around a .ps-input.
 * Pass children to replace the default input (icon + slider, say).
 * @example Field({ placeholder: "Reel name", value: "Harbour Lights" })
 */
export function Field(o) {
  o = o || {};
  var body = o.children || el("input", Object.assign({
    class: "ps-input",
    type: o.type,
    id: o.id,
    placeholder: o.placeholder === undefined ? "Reel name" : o.placeholder,
    value: o.value
  }, o.inputAttrs));
  return el("div", Object.assign({
    class: cx("ps-field", o.invalid && "ps-field--invalid", o.class)
  }, o.attrs), body);
}

/**
 * Rounded search box with the small search glyph.
 * @example Search({ placeholder: "Search the archive" })
 */
export function Search(o) {
  o = o || {};
  return el("div", Object.assign({ class: cx("ps-search", o.class) }, o.attrs),
    icon("search", 12),
    el("input", Object.assign({
      id: o.id,
      placeholder: o.placeholder === undefined ? "Search the archive" : o.placeholder,
      value: o.value
    }, o.inputAttrs)));
}

/**
 * Numeric stepper with up/down arrows. Arrows nudge by step, clamp to
 * min/max, and fire "change" with { value }.
 * @example Stepper({ value: 128, min: 40, max: 220, label: "BPM" })
 */
export function Stepper(o) {
  o = o || {};
  var min = o.min === undefined ? 40 : o.min;
  var max = o.max === undefined ? 220 : o.max;
  var step = o.step === undefined ? 1 : o.step;
  var input = el("input", Object.assign({
    value: o.value === undefined ? 128 : o.value,
    id: o.id,
    "aria-label": o.label === undefined ? "BPM" : o.label
  }, o.inputAttrs));
  var arrows = el("div", { class: "ps-stepper__arrows" },
    el("button", { data: { step: 1 }, "aria-label": "Up" }, icon("tri-u", 12)),
    el("button", { data: { step: -1 }, "aria-label": "Down" }, icon("tri-d", 12)));
  var root = el("div", Object.assign({ class: cx("ps-stepper", o.class) }, o.attrs),
    input, arrows);
  arrows.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) { return; }
    var v = Number(input.value) + Number(b.getAttribute("data-step")) * step;
    v = Math.max(min, Math.min(max, v));
    input.value = v;
    root.dispatchEvent(new CustomEvent("change", { detail: { value: v }, bubbles: true }));
  });
  return root;
}

/**
 * Toggle switch. Click flips aria-checked (the CSS reads it) and fires
 * "change" with { checked }.
 * @example Switch({ checked: true, label: "On air" })
 */
export function Switch(o) {
  o = o || {};
  var root = el("button", Object.assign({
    class: cx("ps-switch", o.class),
    id: o.id,
    role: "switch",
    "aria-checked": String(!!o.checked),
    "aria-label": o.label === undefined ? "On air" : o.label
  }, o.attrs), el("span", { class: "ps-switch__knob" }));
  root.addEventListener("click", function () {
    var on = root.getAttribute("aria-checked") !== "true";
    root.setAttribute("aria-checked", String(on));
    root.dispatchEvent(new CustomEvent("change", { detail: { checked: on }, bubbles: true }));
  });
  return root;
}

/**
 * Checkbox or radio in a .ps-check label. type: "checkbox" | "radio".
 * @example Check({ label: "Loop", checked: true })
 */
export function Check(o) {
  o = o || {};
  return el("label", Object.assign({ class: cx("ps-check", o.class) }, o.attrs),
    el("input", Object.assign({
      type: o.type || "checkbox",
      name: o.name,
      id: o.id,
      checked: !!o.checked,
      disabled: !!o.disabled
    }, o.inputAttrs)),
    " " + (o.label === undefined ? "Loop" : o.label));
}

/**
 * Dashed drop target. Drag-over sets data-over (the CSS highlight);
 * drop fires "change" with { files }.
 * @example Dropzone({ label: "Drop a reel here, or choose a file" })
 */
export function Dropzone(o) {
  o = o || {};
  var root = el("div", Object.assign({ class: cx("ps-dropzone", o.class), id: o.id }, o.attrs),
    icon(o.icon || "floppy", 48),
    " " + (o.label === undefined ? "Drop a reel here, or choose a file" : o.label));
  ["dragenter", "dragover"].forEach(function (ev) {
    root.addEventListener(ev, function (e) { e.preventDefault(); root.setAttribute("data-over", "true"); });
  });
  root.addEventListener("dragleave", function () { root.setAttribute("data-over", "false"); });
  root.addEventListener("drop", function (e) {
    e.preventDefault();
    root.setAttribute("data-over", "false");
    root.dispatchEvent(new CustomEvent("change", {
      detail: { files: e.dataTransfer ? e.dataTransfer.files : null }, bubbles: true
    }));
  });
  return root;
}

/**
 * Multiline text box.
 * @example Textarea({ placeholder: "Liner notes", value: "Recorded in one pass, tape room B, 03:40." })
 */
export function Textarea(o) {
  o = o || {};
  return el("textarea", Object.assign({
    class: cx("ps-textarea", o.invalid && "ps-textarea--invalid", o.class),
    id: o.id,
    rows: o.rows,
    placeholder: o.placeholder === undefined ? "Liner notes" : o.placeholder
  }, o.attrs), o.value);
}
