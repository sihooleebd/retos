/* ==========================================================================
   RETOS UI, HUB
   The one front door to the component library. Import from here and every
   factory arrives ready: the icon sprite is already injected and the knobs
   are already listening before your first element hits the document.

   Usage, named picks or the whole crate:
     import { Window, Button, el } from "./hub.js";
     import PS from "./hub.js";
     document.body.append(PS.Panel({ body: "Reel 041, side A." }));

   Two things this file will not do for you:
     styles    hub.js ships markup and behaviour, not paint. Add
               <link rel="stylesheet" href="poolside.css"> yourself.
     file://   ES modules need http, the browser refuses them from disk.
               From the project folder: python3 -m http.server
               then open http://localhost:8000/
   ========================================================================== */

/* Side effects first. Sprite injection and knob behaviour must be live
   before any factory output reaches the document. Both scripts bail out
   quietly when there is no document, so node imports are a no-op. */
import "./ps-icons.js";
import "./ps-knob.js";

/* Namespace imports, used only to compose the default PS crate below. */
import * as dom        from "./assets/dom.js";
import * as panels     from "./assets/panels.js";
import * as feedback   from "./assets/feedback.js";
import * as buttons    from "./assets/buttons.js";
import * as inputs     from "./assets/inputs.js";
import * as forms      from "./assets/forms.js";
import * as mixer      from "./assets/mixer.js";
import * as menus      from "./assets/menus.js";
import * as wayfinding from "./assets/wayfinding.js";
import * as windows    from "./assets/windows.js";
import * as metrics    from "./assets/metrics.js";
import * as data       from "./assets/data.js";
import * as media      from "./assets/media.js";

/* Named re-exports, one group per module, every name spelled out. No
   `export *`: every name below is unique across the twelve modules today,
   and if two modules ever clash the loser gets an explicit
   `Name as ModuleName` rename right here, where it can be seen. */

// dom.js, the helpers every factory is built from
export { el, cx, icon, frag } from "./assets/dom.js";

// panels.js, cards, toolbars, breadcrumbs, rules, column grids, skeletons
export { Panel, Toolbar, Crumbs, Rule, Cols, Skeleton } from "./assets/panels.js";

// feedback.js, banners, lamps, tags, progress, spinners, badges, toasts
export { Banner, Led, Tag, Progress, Wait, Badge, Toast, Empty, Balloon } from "./assets/feedback.js";

// buttons.js, buttons, fused groups, segments, keycaps
export { Button, ButtonGroup, Segment, Key } from "./assets/buttons.js";

// inputs.js, fields, search, steppers, switches, checks, dropzones
export { Field, Search, Stepper, Switch, Check, Dropzone, Textarea } from "./assets/inputs.js";

// forms.js, fieldsets, form rows, listboxes, split buttons
export { Fieldset, FormRow, Listbox, Combo } from "./assets/forms.js";

// mixer.js, knobs, faders, swatches, VU meters
export { Knob, KnobGroup, Fader, Swatches, VuMeter } from "./assets/mixer.js";

// menus.js, popup menus, tab strips, pagers, tool palettes
export { Menu, Tabs, Pager, Palette } from "./assets/menus.js";

// wayfinding.js, sidebar nav, disclosures, wizard steps, side tabs
export { Nav, Disclosure, Steps, SideTabs } from "./assets/wayfinding.js";

// windows.js, framed windows, statusbars, grips, modal alerts, dragging
export { Window, Statusbar, Grip, Alert, draggable } from "./assets/windows.js";

// metrics.js, stat cards, meters, timelines, avatars, code chips
export { Stat, Meter, Timeline, Avatar, AvatarStack, Code, CodeBlock } from "./assets/metrics.js";

// data.js, charts, waveforms, calendars, ratings, specs, counters, tickers
export { Chart, Waveform, Calendar, Rating, Specs, Counter, Badge88, Ticker, Quote } from "./assets/data.js";

// media.js, cassettes, discs, vinyl, consoles, readouts
export { Cassette, Disc, Vinyl, Console, Readout } from "./assets/media.js";

/* Library version. */
export const version = "2.3.0";

/* Handles on the two classic scripts. Each attaches itself to window when
   it loads (root.PSIcons = ..., root.PSKnob = ...), and since the imports
   above ran first, the handles exist by the time this line runs in a
   browser. Outside a browser both are undefined, the scripts never start. */
export const PSIcons = typeof window !== "undefined" ? window.PSIcons : undefined;
export const PSKnob  = typeof window !== "undefined" ? window.PSKnob  : undefined;

/* The whole crate as one object, so `import PS from "./hub.js"` works
   alongside the named form. Same functions, no copies. */
const PS = Object.freeze({
  ...dom,
  ...panels,
  ...feedback,
  ...buttons,
  ...inputs,
  ...forms,
  ...mixer,
  ...menus,
  ...wayfinding,
  ...windows,
  ...metrics,
  ...data,
  ...media,
  version,
  PSIcons,
  PSKnob,
});

export default PS;
