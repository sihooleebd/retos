/* ==========================================================================
   RETOS UI, METRICS
   Readouts for the front office: stat cards, percentage meters, transfer
   timelines, avatars and inline code.

     import { Stat, Meter, Timeline, Avatar, AvatarStack, Code, CodeBlock } from "./metrics.js";

     Stat({ label: "Reels online", value: 96, delta: "6 this week", dir: "up" })
     Meter({ label: "Disc used", value: 62 })
     Timeline({ items: [{ when: "04 Aug 21:10", label: "Reel received", state: "done" }] })
     Avatar({ initials: "SM" })
     AvatarStack({ children: ["SM", "AV", "MN", "+9"] })
     Code({ text: "psctl transfer --side a" })
     CodeBlock({ lines: ["psctl transfer --side a --rate 22050", "  reading reel BH-001"] })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* fold user attrs onto the base attr object */
function pass(base, extra) {
  return extra ? Object.assign(base, extra) : base;
}

/**
 * Big-number stat card. delta is the small trend line beneath the figure;
 * dir "up" or "down" points the trending arrow (down just rotates it).
 * @example Stat({ label: "Listeners", value: 418, delta: "22 this week", dir: "down" })
 */
export function Stat(o) {
  o = o || {};
  var label = o.label, value = o.value, delta = o.delta;
  if (label == null && value == null && delta == null) {
    label = "Reels online";
    value = 96;
    delta = "6 this week";
  }
  return el("div", pass({ class: cx("ps-stat", o.class) }, o.attrs),
    label != null && el("span", { class: "ps-stat__label" }, label),
    value != null && el("span", { class: "ps-stat__value" }, value),
    delta != null && el("span", { class: "ps-stat__delta", data: { dir: o.dir || "up" } },
      icon("trending", 12), " " + delta));
}

/**
 * Labelled percentage bar. value (0 to 100) drives the fill width; val
 * overrides the printed figure. dither swaps the solid fill for checker.
 * @example Meter({ label: "Bandwidth", value: 31, dither: true })
 */
export function Meter(o) {
  o = o || {};
  var value = o.value !== undefined ? o.value : 62;
  var label = o.label !== undefined ? o.label : "Disc used";
  return el("div", pass({ class: cx("ps-meter", o.dither && "ps-meter--dither", o.class) }, o.attrs),
    el("div", { class: "ps-meter__head" }, label, " ",
      el("span", { class: "ps-meter__val" }, o.val !== undefined ? o.val : value + "%")),
    el("div", { class: "ps-meter__track" },
      el("div", { class: "ps-meter__fill", style: { width: value + "%" } })));
}

/**
 * Vertical event log. items are { when, label, state } with state "done",
 * "now", or unset for pending; a bare string is a label alone.
 * @example Timeline({ items: [{ when: "04 Aug 21:10", label: "Reel received", state: "done" }, { when: "pending", label: "Mastered" }] })
 */
export function Timeline(o) {
  o = o || {};
  var items = o.items || [
    { when: "04 Aug 21:10", label: "Reel received from the shelf", state: "done" },
    { when: "05 Aug 09:00", label: "Baked and inspected", state: "done" },
    { when: "10 Aug 23:07", label: "Transferring, side A", state: "now" },
    { when: "pending", label: "Mastered and published" }
  ];
  var lis = [];
  for (var i = 0; i < items.length; i++) {
    var it = typeof items[i] === "string" ? { label: items[i] } : items[i];
    lis.push(el("li",
      { class: "ps-timeline__item", data: it.state ? { state: it.state } : null },
      it.when != null && el("div", { class: "ps-timeline__when" }, it.when),
      it.label));
  }
  return el("ol", pass({ class: cx("ps-timeline", o.class) }, o.attrs), lis);
}

/**
 * Square portrait chip: initials, an icon, or an img the stylesheet
 * grayscales. lg is the 48px size. src wins over icon over initials.
 * @example Avatar({ icon: "user", lg: true })
 */
export function Avatar(o) {
  o = o || {};
  var body;
  if (o.src) { body = el("img", { src: o.src, alt: o.alt || "" }); }
  else if (o.icon) { body = icon(o.icon); }
  else { body = o.initials !== undefined ? o.initials : "SM"; }
  return el("span",
    pass({ class: cx("ps-avatar", o.lg && "ps-avatar--lg", o.class) }, o.attrs), body);
}

/**
 * Overlapping row of avatars. String children become initials chips,
 * so the overflow count is just another string ("+9").
 * @example AvatarStack({ children: ["SM", "AV", "MN", "+9"] })
 */
export function AvatarStack(o) {
  o = o || {};
  var kids = o.children != null ? o.children : ["SM", "AV", "MN", "+9"];
  if (!Array.isArray(kids)) { kids = [kids]; }
  var out = [];
  for (var i = 0; i < kids.length; i++) {
    out.push(typeof kids[i] === "string" ? Avatar({ initials: kids[i] }) : kids[i]);
  }
  return el("div", pass({ class: cx("ps-avatar-stack", o.class) }, o.attrs), out);
}

/**
 * Inline code chip for a command sitting in running text.
 * @example Code({ text: "psctl transfer --side a" })
 */
export function Code(o) {
  o = o || {};
  return el("code", pass({ class: cx("ps-code", o.class) }, o.attrs),
    o.text !== undefined ? o.text : "psctl transfer --side a");
}

/**
 * Preformatted terminal output. text keeps its newlines as authored;
 * lines joins an array with them for you and wins over text.
 * @example CodeBlock({ lines: ["psctl transfer --side a --rate 22050", "  reading reel BH-001"] })
 */
export function CodeBlock(o) {
  o = o || {};
  var text = o.lines ? o.lines.join("\n")
    : o.text !== undefined ? o.text
    : "psctl transfer --side a --rate 22050\n  reading reel BH-001\n  wrote 41:20 to /archive/1997/08";
  return el("pre", pass({ class: cx("ps-codeblock", o.class) }, o.attrs), text);
}
