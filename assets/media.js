/* ==========================================================================
   RETOS UI, PLAYER OBJECTS
   The media graphics: tape, discs, terminal, file readout.

     import { Cassette, Disc, Vinyl, Console, Readout, Seg7 } from "./media.js";

     Cassette({ label: ["BH-001", "HARBOUR LIGHTS, 4AM", "SIDE A, 41 MIN"] })
     Disc({ color: "#7fa8c9", lg: true })
     Vinyl({ size: 96 })
     Console({ lines: ["> mount /dev/tape0", "  reel BH-001 ok, 41:20"] })
     Readout({ title: "Mixed by MOODS", body: ["01-moods.mp3", "Audio file"] })
     Seg7({ value: "25:00" })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* arrays of lines get <br> between them, strings pass through */
function lined(v) {
  if (!Array.isArray(v)) { return v; }
  var out = [];
  for (var i = 0; i < v.length; i++) {
    if (i) { out.push(el("br")); }
    out.push(v[i]);
  }
  return out;
}

/**
 * Cassette graphic: paper label over a tape window with two reels.
 * data-spin animates the reels; reduced-motion turns it off in CSS.
 * @example Cassette({ label: ["BH-002", "NIGHT SWIM DUBS", "SIDE B, 32 MIN"] })
 */
export function Cassette(opts) {
  opts = opts || {};
  var label = opts.label === undefined
    ? ["BH-001", "HARBOUR LIGHTS, 4AM", "SIDE A, 41 MIN"]
    : opts.label;
  return el("div",
    Object.assign({
      class: cx("ps-cassette", opts.class),
      data: opts.spin !== false ? { spin: "true" } : null
    }, opts.attrs),
    el("div", { class: "ps-cassette__label" }, lined(label)),
    el("div", { class: "ps-cassette__window" },
      el("span", { class: "ps-cassette__reel" }),
      el("span", { class: "ps-cassette__reel" })));
}

/**
 * Small CD dot; color feeds the --ps-disc ring, lg doubles it up.
 * @example Disc({ color: "#7fa8c9", lg: true })
 */
export function Disc(opts) {
  opts = opts || {};
  return el("span",
    Object.assign({
      class: cx("ps-disc", opts.lg && "ps-disc--lg", opts.class),
      style: opts.color ? { "--ps-disc": opts.color } : null
    }, opts.attrs));
}

/**
 * Spinning record; art feeds --ps-vinyl-art, size overrides the 190px default.
 * @example Vinyl({ size: 96 })
 */
export function Vinyl(opts) {
  opts = opts || {};
  var size = typeof opts.size === "number" ? opts.size + "px" : opts.size;
  var style = {};
  if (size) { style.width = size; style.height = size; }
  if (opts.art) { style["--ps-vinyl-art"] = opts.art; }
  return el("div",
    Object.assign({
      class: cx("ps-vinyl", opts.class),
      data: opts.spin !== false ? { spin: "true" } : null,
      style: (size || opts.art) ? style : null
    }, opts.attrs));
}

/**
 * Terminal panel; lines join with newlines (the CSS is pre-wrap),
 * a blinking caret sits after the last one.
 * @example Console({ lines: ["> level --peak", "  -3.2 dBFS, no clipping"] })
 */
export function Console(opts) {
  opts = opts || {};
  var lines = opts.lines === undefined
    ? ["> mount /dev/tape0", "  reel BH-001 ok, 41:20", "> level --peak",
       "  -3.2 dBFS, no clipping", "> broadcast --start"]
    : opts.lines;
  return el("div",
    Object.assign({ class: cx("ps-console", opts.class) }, opts.attrs),
    Array.isArray(lines) ? lines.join("\n") : lines,
    opts.caret !== false && el("span", { class: "ps-console__caret" }, "\u00a0"));
}

/**
 * File readout card: title head with a small glyph, dim spec body.
 * Pass icon: null to drop the glyph; arrays render as <br> lines.
 * @example Readout({ title: ["Reel 037", "Recovered fragments"], body: ["037-a.mp3", "Duration 12:04"] })
 */
export function Readout(opts) {
  opts = opts || {};
  var title = opts.title === undefined
    ? ["Mixed by MOODS", "An hour of summer"]
    : opts.title;
  var body = opts.body === undefined
    ? ["01-moods.mp3", "Audio file", "Duration 01:02:58", "22KHz 8 Bit, Stereo"]
    : opts.body;
  var glyph = opts.icon === undefined ? "tri-r" : opts.icon;
  return el("div",
    Object.assign({ class: cx("ps-readout", opts.class) }, opts.attrs),
    el("div", { class: "ps-readout__head" },
      el("div", { class: "ps-readout__title" }, lined(title)),
      glyph && icon(glyph, 12)),
    el("div", { class: "ps-readout__body" }, lined(body)));
}

/**
 * Seven-segment display: an instrument readout of segmented digits on
 * the dark panel ink. Understands 0-9, colon, dot, minus, space, and
 * enough letters to spell ERR. Call node.set("12:34") to update live.
 * @example Seg7({ value: "25:00" })
 */
export function Seg7(opts) {
  opts = opts || {};
  var SVG_NS = "http://www.w3.org/2000/svg";
  // rects as x, y, w, h on a 10x18 cell; letters name the classic segments
  var SEGS = {
    a: [1, 0, 8, 2], b: [8, 1, 2, 8], c: [8, 9, 2, 8], d: [1, 16, 8, 2],
    e: [0, 9, 2, 8], f: [0, 1, 2, 8], g: [1, 8, 8, 2],
  };
  var MAP = {
    "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc",
    "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg",
    "-": "g", " ": "", "e": "afged", "r": "eg", "o": "cdeg", "n": "ceg",
  };

  function cell(ch) {
    var svg = document.createElementNS(SVG_NS, "svg");
    if (ch === ":" || ch === ".") {
      svg.setAttribute("viewBox", "0 0 4 18");
      svg.setAttribute("class", "ps-seg7__cell ps-seg7__cell--dots");
      var ys = ch === ":" ? [4, 12] : [15];
      for (var d = 0; d < ys.length; d++) {
        var dot = document.createElementNS(SVG_NS, "rect");
        dot.setAttribute("x", "1"); dot.setAttribute("y", String(ys[d]));
        dot.setAttribute("width", "2"); dot.setAttribute("height", "2");
        dot.setAttribute("data-lit", "true");
        svg.appendChild(dot);
      }
      return svg;
    }
    svg.setAttribute("viewBox", "0 0 10 18");
    svg.setAttribute("class", "ps-seg7__cell");
    var lit = MAP[String(ch).toLowerCase()] || "";
    for (var name in SEGS) {
      var r = SEGS[name];
      var seg = document.createElementNS(SVG_NS, "rect");
      seg.setAttribute("x", String(r[0])); seg.setAttribute("y", String(r[1]));
      seg.setAttribute("width", String(r[2])); seg.setAttribute("height", String(r[3]));
      seg.setAttribute("data-lit", String(lit.indexOf(name) !== -1));
      svg.appendChild(seg);
    }
    return svg;
  }

  var node = el("span",
    Object.assign({ class: cx("ps-seg7", opts.class), role: "img" }, opts.attrs));
  node.set = function (value) {
    var text = String(value == null ? "" : value);
    if (opts.digits) {
      while (text.replace(/[:.]/g, "").length < opts.digits) { text = " " + text; }
    }
    node.textContent = "";
    for (var i = 0; i < text.length; i++) { node.appendChild(cell(text[i])); }
    node.setAttribute("aria-label", text.trim());
  };
  node.set(opts.value === undefined ? "" : opts.value);
  return node;
}
