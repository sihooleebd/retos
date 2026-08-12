/* ==========================================================================
   RETOS UI, MESSAGES + STATUS
   Factories for the message and status pieces of the catalogue.

     import { Banner, Led, Tag, Progress, Wait, Badge, Toast, Empty,
              Balloon } from "./feedback.js";

     Banner({ variant: "warn", title: "Levels are clipping." })
     Led({ label: "Recording", state: "blink" })
     Tag({ label: "4am", variant: "face", removable: true })
     Progress({ value: 62 })          Progress({ indeterminate: true })
     Wait()                           Badge({ label: "Queued", variant: "face" })
     Toast({ children: "Reel 041 archived" })
     Empty()                          Balloon({ text: "Balloon help is on." })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/* base attrs win unless the caller overrides them explicitly */
function merge(base, extra) {
  return Object.assign(base, extra || {});
}

/* default glyph per severity; pass icon to override */
var BANNER_GLYPH = { info: "info", warn: "caution", stop: "times-circle" };

/**
 * Severity banner. Variants: "info" (default), "warn", "stop".
 * @example Banner({ variant: "warn", title: "Levels are clipping.", body: "Peaks hit 0 dBFS on the last pass.", dismissible: true })
 */
export function Banner(opts) {
  opts = opts || {};
  var variant = opts.variant || "info";
  var title = opts.title === undefined ? "Digitising in the background." : opts.title;
  var body = opts.body === undefined
    ? "Playback may stutter while reel 042 is being read."
    : opts.body;
  return el("div",
    merge({ class: cx("ps-banner", "ps-banner--" + variant, opts.class) }, opts.attrs),
    el("span", { class: "ps-banner__glyph" }, icon(opts.icon || BANNER_GLYPH[variant] || "info")),
    el("span", { class: "ps-banner__body" },
      title && el("span", { class: "ps-banner__title" }, title),
      title && body && " ",
      body),
    opts.dismissible && el("button",
      { class: "ps-winbtn ps-banner__close", "aria-label": "Dismiss", onclick: opts.ondismiss },
      icon("close")));
}

/**
 * Status lamp with a word. States: "on" (default), "blink", "warn", or null for dark.
 * @example Led({ label: "Recording", state: "blink" })
 */
export function Led(opts) {
  opts = opts || {};
  var state = opts.state === undefined ? "on" : opts.state;
  return el("span",
    merge({ class: cx("ps-led", opts.class), "data-state": state }, opts.attrs),
    opts.label === undefined ? "On air" : opts.label);
}

/**
 * Small label chip. Variants: null (paper, default), "face", "ink". removable adds the x.
 * @example Tag({ label: "4am", variant: "face", removable: true })
 */
export function Tag(opts) {
  opts = opts || {};
  return el("span",
    merge({ class: cx("ps-tag", opts.variant && "ps-tag--" + opts.variant, opts.class) }, opts.attrs),
    opts.label === undefined ? "ambient" : opts.label,
    opts.removable && [" ", el("button",
      { class: "ps-tag__x", "aria-label": "Remove", onclick: opts.onremove },
      icon("close", 12))]);
}

/**
 * Striped progress bar, 0 to 100. indeterminate barbers forever and ignores value.
 * @example Progress({ value: 62 })
 */
export function Progress(opts) {
  opts = opts || {};
  var value = opts.value === undefined ? 62 : opts.value;
  return el("div",
    merge({ class: cx("ps-progress", opts.indeterminate && "ps-progress--indeterminate", opts.class) }, opts.attrs),
    el("div", { class: "ps-progress__fill", style: opts.indeterminate ? null : "width:" + value + "%" }));
}

/**
 * Wristwatch wait spinner. Purely decorative, spins on its own.
 * @example Wait()
 */
export function Wait(opts) {
  opts = opts || {};
  return el("div", merge({ class: cx("ps-wait", opts.class) }, opts.attrs));
}

/**
 * Uppercase status badge. Variants: null (accent, default), "ink", "face".
 * @example Badge({ label: "Queued", variant: "face" })
 */
export function Badge(opts) {
  opts = opts || {};
  return el("span",
    merge({ class: cx("ps-badge", opts.variant && "ps-badge--" + opts.variant, opts.class) }, opts.attrs),
    opts.label === undefined ? "On air" : opts.label);
}

/**
 * Passing notice with a ringed glyph. children is the message, icon names the glyph.
 * @example Toast({ icon: "check", children: "Reel 041 archived" })
 */
export function Toast(opts) {
  opts = opts || {};
  return el("div",
    merge({ class: cx("ps-toast", opts.class) }, opts.attrs),
    el("span", { class: "ps-toast__glyph" }, icon(opts.icon || "check", 12)),
    opts.children === undefined ? "Reel 041 archived" : opts.children);
}

/**
 * Empty state: big glyph over quiet centred text. children is the message.
 * @example Empty({ icon: "disc", children: ["No reels on this shelf yet.", el("br"), "Drop a tape to start the archive."] })
 */
export function Empty(opts) {
  opts = opts || {};
  var body = opts.children;
  if (body === undefined) {
    body = ["No reels on this shelf yet.", el("br"), "Drop a tape to start the archive."];
  }
  return el("div",
    merge({ class: cx("ps-empty", opts.class) }, opts.attrs),
    el("span", { class: "ps-empty__glyph" }, icon(opts.icon || "disc", 48)),
    body);
}

/**
 * Balloon help pinned under a trigger. children is the trigger; only shows
 * inside an ancestor carrying data-ps-balloons="on".
 * @example Balloon({ text: "Cue the next reel.", children: myButton })
 */
export function Balloon(opts) {
  opts = opts || {};
  var trigger = opts.children === undefined
    ? el("button", { class: "ps-btn ps-btn--face" }, "Hover me")
    : opts.children;
  var text = opts.text === undefined
    ? "Balloon help is on. Toggle it from the menu bar."
    : opts.text;
  return el("span",
    merge({ class: cx("ps-balloon-host", opts.class) }, opts.attrs),
    trigger,
    el("span", { class: "ps-balloon" }, text));
}
