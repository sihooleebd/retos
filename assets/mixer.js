/* ==========================================================================
   RETOS UI, MIXER PARTS
   Factories for the console: knobs, faders, palette chips, VU meter.

     import { Knob, KnobGroup, Fader, Swatches, VuMeter } from "./mixer.js";

     Knob({ min: -12, max: 12, step: 1, value: 2, unit: "dB", label: "Tone" })
     KnobGroup({ label: "Gain", value: 24 })
     Fader({ value: 70, label: "Left" })
     Swatches({ selected: 5 })
     VuMeter({ levels: [40, 68, 84, 52] })

   Knobs are markup only here; ps-knob.js claims every .ps-knob once it is
   in the document, and keeps the .ps-knob-group__value readout current.
   ========================================================================== */

import { el, cx } from "./dom.js";

/* the classic 16, same palette the catalogue ships */
var CLASSIC_16 = [
  "#000000", "#3d3d3d", "#7a7a7a", "#b8b8b8", "#ffffff", "#2f5f8f", "#6fa8dc", "#c2ddf1",
  "#8fb87a", "#d9c069", "#d8a24a", "#c96f6f", "#b58bc4", "#7f5539", "#f0b27a", "#e8f0d9"
];

/**
 * Bare rotary knob. Inert until ps-knob.js claims it in the document.
 * @example Knob({ min: -12, max: 12, step: 1, value: 2, unit: "dB", label: "Tone" })
 */
export function Knob(opts) {
  var o = opts || {};
  // data-step and data-unit only when authored; ps-knob.js has its own defaults
  var data = {
    min: o.min !== undefined ? o.min : 0,
    max: o.max !== undefined ? o.max : 100
  };
  if (o.step !== undefined) { data.step = o.step; }
  data.value = o.value !== undefined ? o.value : 24;
  if (o.unit) { data.unit = o.unit; }
  data.label = o.label !== undefined ? o.label : "Gain";
  return el("div", Object.assign({
    class: cx("ps-knob", o.ticks !== false && "ps-knob--ticks", o.class),
    data: data
  }, o.attrs));
}

/**
 * Labelled knob with a value readout beneath. ps-knob.js finds the
 * .ps-knob-group__value sibling and rewrites it on every turn.
 * @example KnobGroup({ label: "Wow", min: 0, max: 1, step: 0.05, value: 0.65 })
 */
export function KnobGroup(opts) {
  var o = opts || {};
  var label = o.label !== undefined ? o.label : "Gain";
  var value = o.value !== undefined ? o.value : 24;
  return el("div", Object.assign({ class: cx("ps-knob-group", o.class) }, o.attrs),
    el("span", { class: "ps-knob-group__label" }, label),
    Knob({ min: o.min, max: o.max, step: o.step, value: value,
           unit: o.unit, label: label, ticks: o.ticks }),
    el("span", { class: "ps-knob-group__value" }, value + (o.unit || ""))
  );
}

/**
 * Vertical channel fader, a native range input stood on end.
 * @example Fader({ value: 82, label: "Sub" })
 */
export function Fader(opts) {
  var o = opts || {};
  return el("input", Object.assign({
    class: cx("ps-fader", o.class),
    type: "range",
    min: o.min !== undefined ? o.min : 0,
    max: o.max !== undefined ? o.max : 100,
    value: o.value !== undefined ? o.value : 70,
    "aria-label": o.label !== undefined ? o.label : "Air signal"
  }, o.attrs));
}

/**
 * Palette chip grid, one aria-pressed chip at a time. Click swaps the
 * pressed chip and fires a bubbling "change" with { index, color }.
 * @example Swatches({ selected: 5, onchange: e => paint(e.detail.color) })
 */
export function Swatches(opts) {
  var o = opts || {};
  var colors = o.colors || CLASSIC_16;
  var selected = o.selected !== undefined ? o.selected : 5;
  var root = el("div", Object.assign({ class: cx("ps-swatches", o.class) }, o.attrs),
    colors.map(function (c, i) {
      return el("button", {
        class: "ps-swatch",
        style: "background:" + c,
        "aria-pressed": String(i === selected)
      });
    }));
  root.addEventListener("click", function (e) {
    var b = e.target.closest(".ps-swatch");
    if (!b || b.parentNode !== root) { return; }
    var kids = root.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].setAttribute("aria-pressed", String(kids[i] === b));
    }
    var idx = Array.prototype.indexOf.call(kids, b);
    root.dispatchEvent(new CustomEvent("change", {
      bubbles: true, detail: { index: idx, color: colors[idx] }
    }));
  });
  return root;
}

/**
 * VU meter. Bars rest at the CSS floor unless levels (0..100) are given;
 * a level past hot marks the bar data-hot. Animate by writing style.height.
 * @example VuMeter({ levels: [22, 48, 84, 90, 61, 30], hot: 82 })
 */
export function VuMeter(opts) {
  var o = opts || {};
  var levels = o.levels || null;
  var count = levels ? levels.length : (o.bars !== undefined ? o.bars : 26);
  var hot = o.hot !== undefined ? o.hot : 82;
  var root = el("div", Object.assign({ class: cx("ps-vu", o.class) }, o.attrs));
  for (var i = 0; i < count; i++) {
    var bar = el("span", { class: "ps-vu__bar" });
    if (levels) {
      bar.style.height = levels[i] + "%";
      bar.setAttribute("data-hot", String(levels[i] > hot));
    }
    root.appendChild(bar);
  }
  return root;
}
