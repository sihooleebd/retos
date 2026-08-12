/* ==========================================================================
   RETOS UI, BUTTONS
   Factories for the button family. Markup only, the stylesheet does the rest.

     import { Button, ButtonGroup, Segment, Key } from "./buttons.js";

     Button({ label: "On Air", variant: "accent" })
     ButtonGroup()                                  transport, play pressed
     Segment({ options: ["Tapes", "Reels"] })       wired, fires "change"
     Key({ label: "OPT" })   Key({ icon: "cmd" })
   ========================================================================== */

import { el, cx, icon } from "./dom.js";

/**
 * A .ps-btn. Icon with no label makes it a square --icon button.
 * @example Button({ label: "Go Live", variant: "accent", onclick: air })
 */
export function Button(opts) {
  opts = opts || {};
  var iconOnly = opts.icon && opts.label == null;
  var label = opts.label == null && !opts.icon ? "On Air" : opts.label;
  var base = {
    class: cx("ps-btn",
      opts.variant && "ps-btn--" + opts.variant,   // face | accent | plain
      iconOnly && "ps-btn--icon",
      opts.class),
    disabled: opts.disabled,
    onclick: opts.onclick
  };
  // catalogue omits aria-pressed on unpressed buttons, so only booleans stamp it
  if (typeof opts.pressed === "boolean") { base["aria-pressed"] = String(opts.pressed); }
  return el("button", Object.assign(base, opts.attrs),
    opts.icon && icon(opts.icon), label);
}

/**
 * A .ps-btngroup of fused .ps-btn. Defaults to the tape transport.
 * @example ButtonGroup({ children: [Button({ label: "Rewind" }), Button({ label: "Eject" })] })
 */
export function ButtonGroup(opts) {
  opts = opts || {};
  var kids = opts.children;
  if (kids == null) {
    kids = [
      Button({ icon: "play", variant: "face", pressed: true }),
      Button({ icon: "pause", variant: "face" }),
      Button({ icon: "prev", variant: "face" }),
      Button({ icon: "next", variant: "face" })
    ];
  }
  return el("div", Object.assign({ class: cx("ps-btngroup", opts.class) }, opts.attrs), kids);
}

/**
 * A .ps-segment single-select. Clicks flip aria-pressed and bubble a
 * "change" CustomEvent with { value, index }.
 * @example Segment({ options: ["Tapes", "Reels", "Live"], value: "Reels" })
 */
export function Segment(opts) {
  opts = opts || {};
  var options = opts.options || ["Tapes", "Reels", "Live"];
  var value = opts.value == null ? options[0] : opts.value;
  var btns = options.map(function (label) {
    return el("button", { class: "ps-segment__opt", "aria-pressed": String(label === value) }, label);
  });
  var root = el("div",
    Object.assign({ class: cx("ps-segment", opts.class), role: "group" }, opts.attrs), btns);
  // the css keys entirely off aria-pressed, so a static segment is dead weight
  btns.forEach(function (b, i) {
    b.addEventListener("click", function () {
      btns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      root.dispatchEvent(new CustomEvent("change", {
        detail: { value: options[i], index: i }, bubbles: true
      }));
    });
  });
  return root;
}

/**
 * A .ps-key keycap. Pass a label string or an icon name (drawn at 12).
 * @example Key({ icon: "shift" })
 */
export function Key(opts) {
  opts = opts || {};
  return el("span", Object.assign({ class: cx("ps-key", opts.class) }, opts.attrs),
    opts.icon ? icon(opts.icon, 12) : (opts.label == null ? "K" : opts.label));
}
