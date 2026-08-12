/* ==========================================================================
   RETOS UI, CHARTS, LISTS, WEB97
   Factories for the data displays and the 1997 page ornaments.

     import { Chart, Waveform, Calendar, Rating, Specs,
              Counter, Badge88, Ticker, Quote } from "./data.js";

     Chart({ data: [["Mar", 34], ["Apr", 52]] })
     Waveform({ bars: 90, progress: 0.38 })
     Calendar({ marked: [2, 4, 5], current: 10 })
     Rating({ value: 4 })         Specs({ items: [["Format", "Type II"]] })
     Counter({ value: 14892 })    Badge88({ lines: ["BEST AT", "800 x 600"] })
     Ticker({ items: ["Requests close at 04:00"] })
     Quote({ text: "...", source: "Sleeve note, BH-001" })
   ========================================================================== */

import { el, cx } from "./dom.js";

/* em-space pause between ticker notices, straight from the catalogue */
var TICKER_GAP = "\u2003 \u2003";

/**
 * A .ps-chart of labelled bars, heights in percent of the 108px plot.
 * @example Chart({ data: [["Mon", 40], ["Tue", 72]], dither: ["ps-dither-25"] })
 */
export function Chart(opts) {
  opts = opts || {};
  var data = opts.data || [["Mar", 34], ["Apr", 52], ["May", 41], ["Jun", 68], ["Jul", 77], ["Aug", 62]];
  var dither = opts.dither ||
    ["ps-dither-12", "ps-dither-25", "ps-dither-50", "ps-dither-25", "ps-dither-75", "ps-dither-50"];
  return el("div", Object.assign({ class: cx("ps-chart", opts.class) }, opts.attrs),
    data.map(function (d, i) {
      return el("div",
        { class: cx("ps-chart__bar", dither[i % dither.length]), style: { height: d[1] + "%" } },
        el("span", d[0]));
    }));
}

/**
 * A .ps-waveform. Pass peaks (0 to 100) or let it synthesize a take;
 * bars left of progress read as already played.
 * @example Waveform({ bars: 90, progress: 0.38 })
 */
export function Waveform(opts) {
  opts = opts || {};
  var peaks = opts.peaks;
  if (!peaks) {
    // catalogue synth: a slow sine with tape hiss on top
    peaks = [];
    var n = opts.bars == null ? 90 : opts.bars;
    for (var w = 0; w < n; w++) {
      peaks.push(12 + Math.abs(Math.sin(w / 6)) * 60 + Math.random() * 22);
    }
  }
  var progress = opts.progress == null ? 0.38 : opts.progress;
  var played = Math.floor(peaks.length * progress);
  return el("div", Object.assign({ class: cx("ps-waveform", opts.class) }, opts.attrs),
    peaks.map(function (h, i) {
      return el("span", {
        class: "ps-waveform__bar",
        data: { past: String(i < played) },
        style: { height: h + "%" }
      });
    }));
}

/**
 * A .ps-calendar month. Marked days get the dot fill, current is inverted.
 * @example Calendar({ days: 31, marked: [2, 4, 9], current: 10 })
 */
export function Calendar(opts) {
  opts = opts || {};
  var head = opts.head || ["M", "T", "W", "T", "F", "S", "S"];
  var days = opts.days == null ? 31 : opts.days;
  var marked = opts.marked || [2, 4, 5, 9, 11, 12, 16, 18, 19, 23, 25, 26, 30];
  var current = opts.current == null ? 10 : opts.current;
  var grid = [];
  for (var d = 1; d <= days; d++) {
    grid.push(el("button", {
      class: "ps-calendar__day",
      data: { on: String(marked.indexOf(d) > -1) },
      "aria-current": d === current ? "date" : null
    }, d));
  }
  return el("div", Object.assign({ class: cx("ps-calendar", opts.class) }, opts.attrs),
    el("div", { class: "ps-calendar__head" }, head.map(function (h) { return el("span", h); })),
    el("div", { class: "ps-calendar__grid" }, grid));
}

/**
 * A .ps-rating row of pips, value filled out of max.
 * @example Rating({ value: 4, max: 5 })
 */
export function Rating(opts) {
  opts = opts || {};
  var max = opts.max == null ? 5 : opts.max;
  var value = opts.value == null ? 4 : opts.value;
  var pips = [];
  for (var n = 1; n <= max; n++) {
    pips.push(el("span", { class: "ps-rating__pip", data: { on: String(n <= value) } }));
  }
  return el("div", Object.assign({ class: cx("ps-rating", opts.class) }, opts.attrs), pips);
}

/**
 * A .ps-specs definition list of [term, detail] rows.
 * @example Specs({ items: [["Format", "Type II chrome"], ["Source", "Tape room B"]] })
 */
export function Specs(opts) {
  opts = opts || {};
  var items = opts.items || [
    ["Format", "Type II chrome"],
    ["Sample", "22 kHz, 8 bit"],
    ["Source", "Tape room B"]
  ];
  return el("dl", Object.assign({ class: cx("ps-specs", opts.class) }, opts.attrs),
    items.map(function (it) {
      return el("div", el("dt", it[0]), el("dd", it[1]));
    }));
}

/**
 * A .ps-counter hit counter, value zero-padded to digits.
 * @example Counter({ value: 14892, digits: 6 })
 */
export function Counter(opts) {
  opts = opts || {};
  var value = opts.value == null ? 14892 : opts.value;
  var digits = opts.digits == null ? 6 : opts.digits;
  return el("div", Object.assign({ class: cx("ps-counter", opts.class) }, opts.attrs),
    String(value).padStart(digits, "0").split("").map(function (c) {
      return el("span", { class: "ps-counter__digit" }, c);
    }));
}

/**
 * A .ps-88 link badge, 88 by 31, lines stacked with <br>.
 * @example Badge88({ lines: ["BEST AT", "800 x 600"], variant: "accent" })
 */
export function Badge88(opts) {
  opts = opts || {};
  var lines = opts.lines || ["BLUE HOUR", "BROADCASTING"];
  var kids = [];
  lines.forEach(function (line, i) {
    if (i > 0) { kids.push(el("br")); }
    kids.push(line);
  });
  return el("span", Object.assign({
    class: cx("ps-88", opts.variant && "ps-88--" + opts.variant, opts.class)   // face | accent
  }, opts.attrs), kids);
}

/**
 * A .ps-ticker marquee. Notices join with em-space pauses; the rail text
 * is doubled because the animation loops at minus fifty percent.
 * @example Ticker({ label: "Notice", items: ["Requests close at 04:00", "Six reels online"] })
 */
export function Ticker(opts) {
  opts = opts || {};
  var items = opts.items || [
    "Requests close at 04:00",
    "Reel 037 declared unrecoverable",
    "Six reels online"
  ];
  var line = items.map(function (s) { return s + TICKER_GAP; }).join("");
  return el("div", Object.assign({ class: cx("ps-ticker", opts.class) }, opts.attrs),
    el("span", { class: "ps-ticker__label" }, opts.label == null ? "Notice" : opts.label),
    el("div", { class: "ps-ticker__viewport" },
      el("div", { class: "ps-ticker__rail" }, line + line)));
}

/**
 * A .ps-quote pull quote with an attribution footer.
 * @example Quote({ text: "Side B is the good side.", source: "Sleeve note, BH-002" })
 */
export function Quote(opts) {
  opts = opts || {};
  var text = opts.text == null
    ? "Nobody asked for a fourth take, so we kept the first one." : opts.text;
  return el("blockquote", Object.assign({ class: cx("ps-quote", opts.class) }, opts.attrs),
    text,
    el("footer", opts.source == null ? "Sleeve note, BH-001" : opts.source));
}
