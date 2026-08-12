/* ==========================================================================
   RETOS UI, KNOB
   Turns every .ps-knob on the page into a real control.

   Markup, either form:
     <div class="ps-knob"></div>
     <div class="ps-knob" data-min="0" data-max="11" data-step="0.5"
          data-value="7" data-label="Drive"></div>

   Read or write from script:
     el.psKnob.value            // number
     el.psKnob.value = 42       // moves the pointer, fires input
     el.addEventListener("input", e => console.log(e.detail.value));

   Interaction:
     drag up / right   increase        shift + drag   fine, quarter speed
     wheel             one step        double click   back to start value
     arrows            one step        page up/down   ten steps
     home / end        min / max
   ========================================================================== */

(function (root) {
  "use strict";
  if (typeof document === "undefined") { return; }   // not a browser, nothing to claim

  var SWEEP_MIN = -140;   // degrees at min
  var SWEEP_MAX = 140;    // degrees at max
  var TRAVEL    = 160;    // pixels of drag for the full range

  function num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function quantise(v, min, step) {
    if (!step) { return v; }
    return min + Math.round((v - min) / step) * step;
  }

  function round(v, step) {
    // keep 0.1 + 0.2 style noise out of the readout
    var dp = (String(step).split(".")[1] || "").length;
    return Number(v.toFixed(Math.min(dp, 6)));
  }

  function Knob(el) {
    this.el = el;
    this.min = num(el.dataset.min, 0);
    this.max = num(el.dataset.max, 100);
    this.step = num(el.dataset.step, 1);
    if (this.max <= this.min) { this.max = this.min + 1; }

    // Starting value: data-value wins, otherwise read back whatever angle the
    // stylesheet set, so existing markup keeps the position it was authored with.
    var start = el.dataset.value;
    this._value = start !== undefined
      ? num(start, this.min)
      : this.fromDeg(num(getComputedStyle(el).getPropertyValue("--ps-knob-deg"), 0));
    this._value = clamp(this._value, this.min, this.max);
    this.initial = this._value;

    this.readout = el.parentNode &&
      el.parentNode.querySelector(".ps-knob-group__value");

    this.setupA11y();
    this.bind();
    this.render();
  }

  Knob.prototype.fromDeg = function (deg) {
    var t = (clamp(deg, SWEEP_MIN, SWEEP_MAX) - SWEEP_MIN) / (SWEEP_MAX - SWEEP_MIN);
    return this.min + t * (this.max - this.min);
  };

  Knob.prototype.toDeg = function (value) {
    var t = (value - this.min) / (this.max - this.min);
    return SWEEP_MIN + t * (SWEEP_MAX - SWEEP_MIN);
  };

  Knob.prototype.setupA11y = function () {
    var el = this.el;
    if (!el.hasAttribute("tabindex")) { el.tabIndex = 0; }
    el.setAttribute("role", "slider");
    el.setAttribute("aria-valuemin", this.min);
    el.setAttribute("aria-valuemax", this.max);
    el.setAttribute("aria-orientation", "vertical");
    if (el.dataset.label && !el.getAttribute("aria-label")) {
      el.setAttribute("aria-label", el.dataset.label);
    }
  };

  Object.defineProperty(Knob.prototype, "value", {
    get: function () { return this._value; },
    set: function (v) { this.set(v, true); }
  });

  Knob.prototype.set = function (v, emit) {
    v = round(clamp(quantise(v, this.min, this.step), this.min, this.max), this.step);
    if (v === this._value) { return; }
    this._value = v;
    this.render();
    if (emit !== false) { this.emit("input"); }
  };

  Knob.prototype.render = function () {
    var el = this.el;
    el.style.setProperty("--ps-knob-deg", this.toDeg(this._value).toFixed(2) + "deg");
    el.setAttribute("aria-valuenow", this._value);
    if (el.dataset.unit) {
      el.setAttribute("aria-valuetext", this._value + " " + el.dataset.unit);
    }
    if (this.readout) {
      this.readout.textContent = this._value + (el.dataset.unit || "");
    }
  };

  Knob.prototype.emit = function (type) {
    this.el.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      detail: { value: this._value }
    }));
  };

  Knob.prototype.nudge = function (steps, e) {
    var s = this.step * (e && e.shiftKey ? 0.25 : 1);
    this.set(this._value + steps * s);
  };

  Knob.prototype.disabled = function () {
    return this.el.getAttribute("aria-disabled") === "true";
  };

  Knob.prototype.bind = function () {
    var self = this;
    var el = this.el;
    var drag = null;

    el.addEventListener("pointerdown", function (e) {
      if (self.disabled() || e.button !== 0) { return; }
      // Pointer capture is what makes the drag survive leaving the 46px circle.
      el.setPointerCapture(e.pointerId);
      drag = { y: e.clientY, x: e.clientX, from: self._value };
      e.preventDefault();
      el.focus({ preventScroll: true });
    });

    el.addEventListener("pointermove", function (e) {
      if (!drag) { return; }
      // Vertical is the primary axis, horizontal is there for trackpads.
      var delta = (drag.y - e.clientY) + (e.clientX - drag.x);
      var span = self.max - self.min;
      var fine = e.shiftKey ? 0.25 : 1;
      self.set(drag.from + (delta / TRAVEL) * span * fine);
    });

    function end(e) {
      if (!drag) { return; }
      drag = null;
      if (el.hasPointerCapture && el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
      self.emit("change");
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    el.addEventListener("dblclick", function () {
      if (self.disabled()) { return; }
      self.set(self.initial);
      self.emit("change");
    });

    el.addEventListener("wheel", function (e) {
      if (self.disabled()) { return; }
      e.preventDefault();
      self.nudge(e.deltaY < 0 ? 1 : -1, e);
      self.emit("change");
    }, { passive: false });

    el.addEventListener("keydown", function (e) {
      if (self.disabled()) { return; }
      var span = self.max - self.min;
      var handled = true;
      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight": self.nudge(1, e); break;
        case "ArrowDown":
        case "ArrowLeft":  self.nudge(-1, e); break;
        case "PageUp":     self.nudge(10, e); break;
        case "PageDown":   self.nudge(-10, e); break;
        case "Home":       self.set(self.min); break;
        case "End":        self.set(self.max); break;
        default: handled = false;
      }
      if (handled) { e.preventDefault(); self.emit("change"); }
      void span;
    });
  };

  function scan(scope) {
    var list = (scope || document).querySelectorAll(".ps-knob");
    for (var i = 0; i < list.length; i++) {
      if (!list[i].psKnob) { list[i].psKnob = new Knob(list[i]); }
    }
  }

  function start() {
    scan(document);
    if (root.MutationObserver) {
      new MutationObserver(function () { scan(document); })
        .observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  root.PSKnob = { scan: scan, Knob: Knob };
})(typeof window !== "undefined" ? window : globalThis);
