/* ==========================================================================
   RETOS UI ICONS
   Injects the sprite into the document, then every <use href="#i-name"/> in
   the page resolves. Inlined rather than fetched so it also works over
   file:// with no server.

   Art: Pixel Icon Library by HackerNoon (@hackernoon/pixel-icon-library),
   drawn on a 24x24 grid. Symbols marked "authored" in the sprite are
   original work on the same grid, outlined to the same 1px staircase weight.

   Usage:
     <svg class="ps-icon"><use href="#i-play"/></svg>
     <svg class="ps-icon ps-icon--48"><use href="#i-cassette"/></svg>

   Sizes: 12 / 24 / 48 / 72 only. Anything else is off grid and will blur.
   PSIcons.names() lists every id.
   ========================================================================== */

(function (root) {
  "use strict";
  if (typeof document === "undefined") { return; }   // not a browser, nothing to inject

  var SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
  <!-- regular/align-justify.svg -->
  <symbol id="i-align-just" viewBox="0 0 24 24"><rect x="1" y="8" width="22" height="1"/><rect x="1" y="21" width="22" height="1"/><rect x="1" y="15" width="22" height="1"/><rect x="1" y="2" width="22" height="1"/></symbol>
  <!-- regular/align-left.svg -->
  <symbol id="i-align-left" viewBox="0 0 24 24"><rect x="1" y="2" width="15" height="1"/><rect x="1" y="15" width="15" height="1"/><rect x="1" y="8" width="22" height="1"/><rect x="1" y="21" width="22" height="1"/></symbol>
  <!-- regular/align-center.svg -->
  <symbol id="i-align-mid" viewBox="0 0 24 24"><rect x="1" y="21" width="22" height="1"/><rect x="5" y="15" width="14" height="1"/><rect x="5" y="2" width="14" height="1"/><rect x="1" y="8" width="22" height="1"/></symbol>
  <!-- regular/archive.svg -->
  <symbol id="i-archive" viewBox="0 0 24 24"><polygon points="17 16 17 18 16 18 16 19 8 19 8 18 7 18 7 16 8 16 8 15 16 15 16 16 17 16"/><path d="M22,12V11H21V6H20V5H19V4H18V3H17V2H16V1H5V2H4V3H3V8H2V9H1V22H2v1H22V22h1V12ZM8,10V9H7V8H5V4H6V3h8V8h5v3H9V10ZM21,20H20v1H4V20H3V11H4V10H6v1H7v1H9v1H20v1h1Z"/></symbol>
  <!-- regular/arrow-down.svg -->
  <symbol id="i-arrow-d" viewBox="0 0 24 24"><polygon points="23 12 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 18 17 18 18 17 18 17 19 16 19 16 20 15 20 15 21 14 21 14 22 13 22 13 23 11 23 11 22 10 22 10 21 9 21 9 20 8 20 8 19 7 19 7 18 6 18 6 17 5 17 5 16 4 16 4 15 3 15 3 14 2 14 2 13 1 13 1 12 2 12 2 11 3 11 3 12 4 12 4 13 5 13 5 14 6 14 6 15 7 15 7 16 8 16 8 17 9 17 9 18 10 18 10 19 11 19 11 1 13 1 13 19 14 19 14 18 15 18 15 17 16 17 16 16 17 16 17 15 18 15 18 14 19 14 19 13 20 13 20 12 21 12 21 11 22 11 22 12 23 12"/></symbol>
  <!-- regular/arrow-left.svg -->
  <symbol id="i-arrow-l" viewBox="0 0 24 24"><polygon points="23 11 23 13 5 13 5 14 6 14 6 15 7 15 7 16 8 16 8 17 9 17 9 18 10 18 10 19 11 19 11 20 12 20 12 21 13 21 13 22 12 22 12 23 11 23 11 22 10 22 10 21 9 21 9 20 8 20 8 19 7 19 7 18 6 18 6 17 5 17 5 16 4 16 4 15 3 15 3 14 2 14 2 13 1 13 1 11 2 11 2 10 3 10 3 9 4 9 4 8 5 8 5 7 6 7 6 6 7 6 7 5 8 5 8 4 9 4 9 3 10 3 10 2 11 2 11 1 12 1 12 2 13 2 13 3 12 3 12 4 11 4 11 5 10 5 10 6 9 6 9 7 8 7 8 8 7 8 7 9 6 9 6 10 5 10 5 11 23 11"/></symbol>
  <!-- regular/arrow-right.svg -->
  <symbol id="i-arrow-r" viewBox="0 0 24 24"><polygon points="23 11 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 18 17 18 18 17 18 17 19 16 19 16 20 15 20 15 21 14 21 14 22 13 22 13 23 12 23 12 22 11 22 11 21 12 21 12 20 13 20 13 19 14 19 14 18 15 18 15 17 16 17 16 16 17 16 17 15 18 15 18 14 19 14 19 13 1 13 1 11 19 11 19 10 18 10 18 9 17 9 17 8 16 8 16 7 15 7 15 6 14 6 14 5 13 5 13 4 12 4 12 3 11 3 11 2 12 2 12 1 13 1 13 2 14 2 14 3 15 3 15 4 16 4 16 5 17 5 17 6 18 6 18 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11"/></symbol>
  <!-- regular/arrow-up.svg -->
  <symbol id="i-arrow-u" viewBox="0 0 24 24"><polygon points="23 11 23 12 22 12 22 13 21 13 21 12 20 12 20 11 19 11 19 10 18 10 18 9 17 9 17 8 16 8 16 7 15 7 15 6 14 6 14 5 13 5 13 23 11 23 11 5 10 5 10 6 9 6 9 7 8 7 8 8 7 8 7 9 6 9 6 10 5 10 5 11 4 11 4 12 3 12 3 13 2 13 2 12 1 12 1 11 2 11 2 10 3 10 3 9 4 9 4 8 5 8 5 7 6 7 6 6 7 6 7 5 8 5 8 4 9 4 9 3 10 3 10 2 11 2 11 1 13 1 13 2 14 2 14 3 15 3 15 4 16 4 16 5 17 5 17 6 18 6 18 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11"/></symbol>
  <!-- regular/at.svg -->
  <symbol id="i-at" viewBox="0 0 24 24"><path d="m22,10v-2h-1v-2h-1v-2h-1v-1h-2v-1h-3v-1h-4v1h-3v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h3v1h4v-1h3v-2h-3v1h-4v-1h-3v-1h-1v-1h-1v-2h-1v-2h-1v-4h1v-2h1v-2h1v-1h1v-1h3v-1h4v1h3v1h1v1h1v2h1v2h1v4h-1v1h-2v-5h-1v-2h-1v-1h-2v-1h-4v1h-2v1h-1v2h-1v4h1v2h1v1h2v1h4v-1h2v-1h1v1h4v-1h1v-2h1v-4h-1Zm-6,4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1v-1h4v1h1v1h1v4Z"/></symbol>
  <!-- regular/badge-check.svg -->
  <symbol id="i-badge-check" viewBox="0 0 24 24"><path d="m22,10v-1h-1v-4h-1v-1h-1v-1h-4v-1h-1v-1h-4v1h-1v1h-4v1h-1v1h-1v4h-1v1h-1v4h1v1h1v4h1v1h1v1h4v1h1v1h4v-1h1v-1h4v-1h1v-1h1v-4h1v-1h1v-4h-1Zm-1,4h-1v1h-1v4h-4v1h-1v1h-4v-1h-1v-1h-4v-4h-1v-1h-1v-4h1v-1h1v-4h4v-1h1v-1h4v1h1v1h4v4h1v1h1v4Z"/><polygon points="17 9 17 11 16 11 16 12 15 12 15 13 14 13 14 14 13 14 13 15 12 15 12 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 11 8 11 8 10 9 10 9 11 10 11 10 12 12 12 12 11 13 11 13 10 14 10 14 9 15 9 15 8 16 8 16 9 17 9"/></symbol>
  <!-- regular/bank.svg -->
  <symbol id="i-bank" viewBox="0 0 24 24"><polygon points="14 4 14 6 13 6 13 7 11 7 11 6 10 6 10 4 11 4 11 3 13 3 13 4 14 4"/><path d="m21,20v-1h-1v-9h-2v9h-2v-9h-2v9h-4v-9h-2v9h-2v-9h-2v9h-1v1H1v2h1v1h20v-1h1v-2h-2Zm0,2H3v-1h1v-1h16v1h1v1Z"/><polygon points="22 7 22 8 21 8 21 9 3 9 3 8 2 8 2 7 4 7 4 8 20 8 20 7 22 7"/><polygon points="23 5 23 7 22 7 22 6 19 6 19 5 17 5 17 4 15 4 15 3 13 3 13 2 11 2 11 3 9 3 9 4 7 4 7 5 5 5 5 6 2 6 2 7 1 7 1 5 4 5 4 4 6 4 6 3 8 3 8 2 10 2 10 1 14 1 14 2 16 2 16 3 18 3 18 4 20 4 20 5 23 5"/></symbol>
  <!-- regular/bell.svg -->
  <symbol id="i-bell" viewBox="0 0 24 24"><polygon points="15 20 15 22 14 22 14 23 10 23 10 22 9 22 9 20 15 20"/><path d="m21,17v-1h-1v-2h-1v-6h-1v-2h-1v-1h-1v-1h-2v-1h-1V1h-2v2h-1v1h-2v1h-1v1h-1v2h-1v6h-1v2h-1v1h-1v1h1v1h18v-1h1v-1h-1Zm-15-1v-2h1v-6h1v-2h2v-1h4v1h2v2h1v6h1v2h1v1H5v-1h1Z"/></symbol>
  <!-- regular/bell-mute.svg -->
  <symbol id="i-bell-off" viewBox="0 0 24 24"><rect x="3" y="16" width="1" height="1"/><polygon points="5 16 4 16 4 14 5 14 5 8 6 8 6 6 7 6 7 5 8 5 8 4 10 4 10 3 11 3 11 1 13 1 13 3 14 3 14 4 16 4 16 5 15 5 15 6 14 6 14 5 10 5 10 6 8 6 8 8 7 8 7 14 6 14 6 15 5 15 5 16"/><rect x="2" y="17" width="1" height="1"/><polygon points="15 20 15 22 14 22 14 23 10 23 10 22 9 22 9 20 15 20"/><polygon points="21 17 22 17 22 18 21 18 21 19 9 19 9 18 10 18 10 17 19 17 19 16 18 16 18 14 17 14 17 10 18 10 18 9 19 9 19 14 20 14 20 16 21 16 21 17"/><polygon points="22 3 22 4 21 4 21 5 20 5 20 6 19 6 19 7 18 7 18 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 12 13 12 13 13 12 13 12 14 11 14 11 15 10 15 10 16 9 16 9 17 8 17 8 18 7 18 7 19 6 19 6 20 5 20 5 21 4 21 4 22 3 22 3 21 2 21 2 20 3 20 3 19 4 19 4 18 5 18 5 17 6 17 6 16 7 16 7 15 8 15 8 14 9 14 9 13 10 13 10 12 11 12 11 11 12 11 12 10 13 10 13 9 14 9 14 8 15 8 15 7 16 7 16 6 17 6 17 5 18 5 18 4 19 4 19 3 20 3 20 2 21 2 21 3 22 3"/></symbol>
  <!-- regular/bold.svg -->
  <symbol id="i-bold" viewBox="0 0 24 24"><path d="m19,13v-1h-2v-1h1v-1h1v-6h-1v-1h-1v-1h-1v-1H5v1h-1v20h1v1h12v-1h1v-1h1v-1h1v-7h-1ZM6,3h10v1h1v6H6V3Zm12,17h-1v1H6v-9h10v1h1v1h1v6Z"/></symbol>
  <!-- regular/bolt.svg -->
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="m14,10v-4h1v-3h1V1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h7v4h-1v3h-1v2h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h-7Zm4,2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-5h-5v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v5h5v1Z"/></symbol>
  <!-- regular/book.svg -->
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M20,17h1V16h1V2H21V1H4V2H3V3H2V21H3v1H4v1H21V22h1V21H21V20H20Zm-2,4H5V20H4V18H5V17H18ZM4,3H20V15H4Z"/></symbol>
  <!-- regular/bookmark.svg -->
  <symbol id="i-bookmark" viewBox="0 0 24 24"><path d="m19,2v-1H5v1h-1v21h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1V2h-1Zm-1,16h-1v-1h-1v-1h-1v-1h-1v-1h-4v1h-1v1h-1v1h-1v1h-1V4h1v-1h10v1h1v14Z"/></symbol>
  <!-- regular/branch.svg -->
  <symbol id="i-branch" viewBox="0 0 24 24"><path d="M20,2V1H16V2H15V6h1V7h1v4H7V7H8V6H9V2H8V1H4V2H3V6H4V7H5V17H4v1H3v4H4v1H8V22H9V18H8V17H7V13H19V7h1V6h1V2ZM5,3H7V5H5ZM7,21H5V19H7ZM19,5H17V3h2Z"/></symbol>
  <!-- regular/briefcase.svg -->
  <symbol id="i-briefcase" viewBox="0 0 24 24"><path d="M22,7V6H17V3H16V2H8V3H7V6H2V7H1V21H2v1H22V21h1V7ZM9,4h6V6H9ZM21,19H20v1H4V19H3V14H9v2h6V14h6Zm0-7H3V9H4V8H20V9h1Z"/></symbol>
  <!-- regular/broom.svg -->
  <symbol id="i-broom" viewBox="0 0 24 24"><path d="M21,1V2H20V3H19V4H18V5H17V6H16V7H15V8H10V9H8v1H6v1H4v1H2v1H1v2H2v1H3v1H4v1H5v1H6v1H7v1H8v1H9v1h2V22h1V20h1V18h1V16h1V14h1V9h1V8h1V7h1V6h1V5h1V4h1V3h1V1ZM13,16H12v2H11v2H9V19H8V18H7V17H6V16H7V15H8V14H6v1H4V13H6V12H8V11H9v1h1v1h1v1h1v1h1Zm1-3H13V12H12V11H11V10h2v1h1Z"/></symbol>
  <!-- regular/paint-brush.svg -->
  <symbol id="i-brush" viewBox="0 0 24 24"><path d="M19,2V1H4V2H3V16H4v1H9v4h1v1h1v1h2V22h1V21h1V17h4V16h1V2ZM13,21H11V19h2Zm5-7H5V3H7V5H9V3h2V7h2V3h5Z"/></symbol>
  <!-- regular/bug.svg -->
  <symbol id="i-bug" viewBox="0 0 24 24"><polygon points="9 6 8 6 8 4 9 4 9 3 11 3 11 2 13 2 13 3 15 3 15 4 16 4 16 6 15 6 15 7 9 7 9 6"/><path d="M18,12V10h1V9h1V8h1V6H19V7H18V8H17V9H7V8H6V7H5V6H3V8H4V9H5v1H6v2H1v2H6v3H5v1H4v1H3v2H5V20H6V19H7v1H8v1h3v1h2V21h3V20h1V19h1v1h1v1h2V19H20V18H19V17H18V14h5V12Zm-3,6v1H13V13H11v6H9V18H8V12H9V11h6v1h1v6Z"/></symbol>
  <!-- regular/bullhorn.svg -->
  <symbol id="i-bullhorn" viewBox="0 0 24 24"><path d="m22,10v-1h-1V3h-1v-1h-1v1h-1v1h-2v1h-2v1h-2v1H2v1h-1v7h1v1h3v5h1v1h2v-1h1v-5h3v1h2v1h2v1h2v1h1v1h1v-1h1v-6h1v-1h1v-3h-1Zm-3,7h-2v-1h-2v-1h-2v-1h-3v-5h3v-1h2v-1h2v-1h2v11Z"/></symbol>
  <!-- regular/calender.svg -->
  <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="16" y="1" width="2" height="1"/><path d="m22,5v-1h-3v-2h-1v5h-2V2h-1v2h-6v-2h-1v5h-2V2h-1v2h-3v1h-1v17h1v1h20v-1h1V5h-1ZM2,6h1v-1h2v2h-3v-1Zm4,16h-3v-1h-1v-3h4v4Zm0-5H2v-4h4v4Zm0-5H2v-4h4v4Zm11-4v4h-4v-4h4Zm0,9h-4v-4h4v4ZM9,5h6v2h-6v-2Zm2,17h-4v-4h4v4Zm0-5h-4v-4h4v4Zm0-5h-4v-4h4v4Zm2,10v-4h4v4h-4Zm9-1h-1v1h-3v-4h4v3Zm0-4h-4v-4h4v4Zm0-5h-4v-4h4v4Zm0-5h-3v-2h2v1h1v1Z"/><rect x="6" y="1" width="2" height="1"/></symbol>
  <!-- regular/calendar-alt.svg -->
  <symbol id="i-calendar-alt" viewBox="0 0 24 24"><rect x="6" y="1" width="2" height="6"/><rect x="9" y="4" width="6" height="2"/><rect x="16" y="1" width="2" height="6"/><path d="M22,5V4H19V6h2V9H3V6H5V4H2V5H1V22H2v1H22V22h1V5ZM21,21H3V11H21Z"/></symbol>
  <!-- regular/retro-camera.svg -->
  <symbol id="i-camera" viewBox="0 0 24 24"><path d="m22,3v-1H2v1h-1v18h1v1h20v-1h1V3h-1ZM3,4h6v1H3v-1Zm7,16H3v-10h7v1h-2v2h-1v4h1v2h2v1Zm-1-3v-4h1v-1h4v1h1v4h-1v1h-4v-1h-1Zm12,3h-7v-1h2v-2h1v-4h-1v-2h-2v-1h7v10Zm0-12H3v-1h6v-1h1v-1h1v-1h10v4Z"/><polygon points="13 13 13 14 11 14 11 16 10 16 10 13 13 13"/></symbol>
  <!-- regular/credit-card.svg -->
  <symbol id="i-card" viewBox="0 0 24 24"><path d="m22,5v-1H2v1h-1v14h1v1h20v-1h1V5h-1Zm-1,13H3v-7h18v7Zm0-10H3v-2h18v2Z"/><rect x="4" y="15" width="4" height="1"/><rect x="10" y="15" width="6" height="1"/></symbol>
  <!-- regular/shopping-cart.svg -->
  <symbol id="i-cart" viewBox="0 0 24 24"><polygon points="9 19 10 19 10 21 9 21 9 22 7 22 7 21 6 21 6 19 7 19 7 18 9 18 9 19"/><polygon points="20 19 21 19 21 21 20 21 20 22 18 22 18 21 17 21 17 19 18 19 18 18 20 18 20 19"/><path d="m4,3v-1H1v2h3v3h1v5h1v4h1v1h13v-2h-12v-2h12v-1h1v-3h1v-3h1v-3H4Zm16,3v3h-1v2H7v-4h-1v-2h15v1h-1Z"/></symbol>
  <!-- regular/cassette-tape.svg -->
  <symbol id="i-cassette" viewBox="0 0 24 24"><polygon points="17 19 18 19 18 20 6 20 6 19 7 19 7 17 8 17 8 16 16 16 16 17 17 17 17 19"/><path d="M22,5V4H2V5H1V19H2v1H4V19H5V17H6V16H7V15H17v1h1v1h1v2h1v1h2V19h1V5ZM21,16H19V15H18V14H6v1H5v1H3V6H21Z"/><polygon points="8 9 8 11 7 11 7 12 5 12 5 11 4 11 4 9 5 9 5 8 7 8 7 9 8 9"/><polygon points="14 11 15 11 15 12 9 12 9 11 10 11 10 9 9 9 9 8 15 8 15 9 14 9 14 11"/><polygon points="20 9 20 11 19 11 19 12 17 12 17 11 16 11 16 9 17 9 17 8 19 8 19 9 20 9"/></symbol>
  <!-- regular/exclamation-triangle.svg -->
  <symbol id="i-caution" viewBox="0 0 24 24"><polygon points="14 11 14 14 13 14 13 17 11 17 11 14 10 14 10 11 14 11"/><rect x="11" y="18" width="2" height="2"/><path d="m22,20v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-1h-2v1h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h1v1h20v-1h1v-2h-1Zm-19,1v-1h1v-2h1v-2h1v-2h1v-2h1v-2h1v-2h1v-2h1v-2h2v2h1v2h1v2h1v2h1v2h1v2h1v2h1v2h1v1H3Z"/></symbol>
  <!-- regular/analytics.svg -->
  <symbol id="i-chart" viewBox="0 0 24 24"><rect x="2" y="15" width="2" height="7"/><rect x="8" y="10" width="2" height="12"/><rect x="14" y="14" width="2" height="8"/><rect x="20" y="10" width="2" height="12"/><rect x="18" y="5" width="1" height="1"/><rect x="17" y="6" width="1" height="1"/><rect x="14" y="7" width="2" height="1"/><rect x="14" y="10" width="2" height="1"/><rect x="13" y="8" width="1" height="2"/><rect x="16" y="8" width="1" height="2"/><rect x="12" y="6" width="1" height="1"/><rect x="11" y="5" width="1" height="1"/><rect x="8" y="4" width="2" height="1"/><rect x="8" y="1" width="2" height="1"/><rect x="10" y="2" width="1" height="2"/><rect x="7" y="2" width="1" height="2"/><rect x="20" y="4" width="2" height="1"/><rect x="19" y="2" width="1" height="2"/><rect x="20" y="1" width="2" height="1"/><rect x="22" y="2" width="1" height="2"/><rect x="6" y="6" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="4" y="9" width="1" height="2"/><rect x="1" y="9" width="1" height="2"/><rect x="2" y="8" width="2" height="1"/><rect x="2" y="11" width="2" height="1"/></symbol>
  <!-- regular/chart-line.svg -->
  <symbol id="i-chart-line" viewBox="0 0 24 24"><polygon points="22 5 22 12 21 12 21 8 19 8 19 9 18 9 18 10 17 10 17 11 16 11 16 12 15 12 15 13 14 13 14 14 13 14 13 13 12 13 12 12 11 12 11 11 10 11 10 10 9 10 9 11 8 11 8 12 7 12 7 13 6 13 6 11 7 11 7 10 8 10 8 9 9 9 9 8 10 8 10 9 11 9 11 10 12 10 12 11 13 11 13 12 14 12 14 11 15 11 15 10 16 10 16 9 17 9 17 8 18 8 18 7 19 7 19 6 15 6 15 5 22 5"/><polygon points="23 18 23 20 2 20 2 19 1 19 1 4 3 4 3 18 23 18"/></symbol>
  <!-- regular/check.svg -->
  <symbol id="i-check" viewBox="0 0 24 24"><polygon points="22 4 22 6 21 6 21 7 20 7 20 8 19 8 19 9 18 9 18 10 17 10 17 11 16 11 16 12 15 12 15 13 14 13 14 14 13 14 13 15 12 15 12 16 11 16 11 17 10 17 10 18 8 18 8 17 7 17 7 16 6 16 6 15 5 15 5 14 4 14 4 13 3 13 3 12 2 12 2 10 4 10 4 11 5 11 5 12 6 12 6 13 7 13 7 14 8 14 8 15 10 15 10 14 11 14 11 13 12 13 12 12 13 12 13 11 14 11 14 10 15 10 15 9 16 9 16 8 17 8 17 7 18 7 18 6 19 6 19 5 20 5 20 4 22 4"/></symbol>
  <!-- regular/check-circle.svg -->
  <symbol id="i-check-circle" viewBox="0 0 24 24"><polygon points="19 9 19 10 18 10 18 11 17 11 17 12 16 12 16 13 15 13 15 14 14 14 14 15 13 15 13 16 12 16 12 17 10 17 10 16 9 16 9 15 8 15 8 14 7 14 7 13 6 13 6 12 7 12 7 11 8 11 8 12 9 12 9 13 10 13 10 14 12 14 12 13 13 13 13 12 14 12 14 11 15 11 15 10 16 10 16 9 17 9 17 8 18 8 18 9 19 9"/><path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-2,6v2h-1v2h-2v1h-2v1h-6v-1h-2v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v-1h2v-1h6v1h2v1h2v2h1v2h1v6h-1Z"/></symbol>
  <!-- regular/chevron-down.svg -->
  <symbol id="i-chevron-d" viewBox="0 0 24 24"><polygon points="22 6 22 8 21 8 21 9 20 9 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 12 6 12 6 11 5 11 5 10 4 10 4 9 3 9 3 8 2 8 2 6 4 6 4 7 5 7 5 8 6 8 6 9 7 9 7 10 8 10 8 11 9 11 9 12 10 12 10 13 11 13 11 14 13 14 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 9 18 9 18 8 19 8 19 7 20 7 20 6 22 6"/></symbol>
  <!-- regular/chevron-up.svg -->
  <symbol id="i-chevron-u" viewBox="0 0 24 24"><polygon points="22 16 22 18 20 18 20 17 19 17 19 16 18 16 18 15 17 15 17 14 16 14 16 13 15 13 15 12 14 12 14 11 13 11 13 10 11 10 11 11 10 11 10 12 9 12 9 13 8 13 8 14 7 14 7 15 6 15 6 16 5 16 5 17 4 17 4 18 2 18 2 16 3 16 3 15 4 15 4 14 5 14 5 13 6 13 6 12 7 12 7 11 8 11 8 10 9 10 9 9 10 9 10 8 11 8 11 7 13 7 13 8 14 8 14 9 15 9 15 10 16 10 16 11 17 11 17 12 18 12 18 13 19 13 19 14 20 14 20 15 21 15 21 16 22 16"/></symbol>
  <!-- regular/clipboard.svg -->
  <symbol id="i-clipboard" viewBox="0 0 24 24"><path d="m19,5v-1h-3v-1h-1v-1h-1v-1h-4v1h-1v1h-1v1h-3v1h-1v17h1v1h14v-1h1V5h-1Zm-9-2h1v-1h2v1h1v2h-1v1h-2v-1h-1v-2Zm-4,3h2v1h8v-1h2v15H6V6Z"/></symbol>
  <!-- regular/clock.svg -->
  <symbol id="i-clock" viewBox="0 0 24 24"><path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-1,6h-1v2h-1v2h-2v1h-2v1h-6v-1h-2v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v-1h2v-1h6v1h2v1h2v2h1v2h1v6Z"/><polygon points="16 15 16 16 15 16 15 17 14 17 14 16 13 16 13 15 12 15 12 14 11 14 11 5 13 5 13 13 14 13 14 14 15 14 15 15 16 15"/></symbol>
  <!-- regular/times.svg -->
  <symbol id="i-close" viewBox="0 0 24 24"><polygon points="14 13 15 13 15 14 16 14 16 15 17 15 17 16 18 16 18 17 19 17 19 18 20 18 20 19 21 19 21 20 22 20 22 21 21 21 21 22 20 22 20 21 19 21 19 20 18 20 18 19 17 19 17 18 16 18 16 17 15 17 15 16 14 16 14 15 13 15 13 14 11 14 11 15 10 15 10 16 9 16 9 17 8 17 8 18 7 18 7 19 6 19 6 20 5 20 5 21 4 21 4 22 3 22 3 21 2 21 2 20 3 20 3 19 4 19 4 18 5 18 5 17 6 17 6 16 7 16 7 15 8 15 8 14 9 14 9 13 10 13 10 11 9 11 9 10 8 10 8 9 7 9 7 8 6 8 6 7 5 7 5 6 4 6 4 5 3 5 3 4 2 4 2 3 3 3 3 2 4 2 4 3 5 3 5 4 6 4 6 5 7 5 7 6 8 6 8 7 9 7 9 8 10 8 10 9 11 9 11 10 13 10 13 9 14 9 14 8 15 8 15 7 16 7 16 6 17 6 17 5 18 5 18 4 19 4 19 3 20 3 20 2 21 2 21 3 22 3 22 4 21 4 21 5 20 5 20 6 19 6 19 7 18 7 18 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 13"/></symbol>
  <!-- purcats/cloud.svg -->
  <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M23.505 17.5034H21.5045V19.5039H23.505V17.5034Z" fill="black"/>
<path d="M18.5039 21.5044H16.5034V23.5048H18.5039V21.5044Z" fill="black"/>
<path d="M20.5043 17.5036V18.5038H18.5039V17.5036H17.5037V14.5029H18.5039V16.5034H19.5041V17.5036H20.5043Z" fill="black"/>
<path d="M16.5034 19.5041V20.5043H14.503V19.5041H13.5027V14.5029H14.503V18.5038H15.5032V19.5041H16.5034Z" fill="black"/>
<path d="M11.5023 14.5029V19.5041H10.502V20.5043H8.50159V19.5041H9.50181V18.5038H10.502V14.5029H11.5023Z" fill="black"/>
<path d="M8.50155 21.5044H6.5011V23.5048H8.50155V21.5044Z" fill="black"/>
<path d="M7.50135 14.5029V17.5036H6.50113V18.5038H4.50067V17.5036H5.5009V16.5034H6.50113V14.5029H7.50135Z" fill="black"/>
<path d="M22.5048 7.50136V6.50114H21.5045V5.50091H19.5041V3.50045H18.5039V2.50023H17.5036V1.5H12.5025V2.50023H11.5023V3.50045H10.502V4.50068H9.50182V3.50045H6.50114V4.50068H5.50091V5.50091H4.50068V7.50136H2.50023V8.50159H1.5V11.5023H2.50023V12.5025H3.50045V13.5027H21.5045V12.5025H22.5048V11.5023H23.505V7.50136H22.5048ZM14.503 10.502V9.50182H13.5027V7.50136H14.503V8.50159H15.5032V5.50091H16.5034V8.50159H17.5036V7.50136H18.5039V9.50182H17.5036V10.502H16.5034V11.5023H15.5032V10.502H14.503ZM10.502 6.50114V7.50136H11.5023V9.50182H10.502V8.50159H9.50182V11.5023H8.50159V8.50159H7.50136V9.50182H6.50114V7.50136H7.50136V6.50114H8.50159V5.50091H9.50182V6.50114H10.502Z" fill="black"/>
<path d="M3.50045 17.5034H1.5V19.5039H3.50045V17.5034Z" fill="black"/></symbol>
  <!-- regular/command.svg -->
  <symbol id="i-cmd" viewBox="0 0 24 24"><path d="M20,10V9h2V7h1V4H22V2H20V1H17V2H15V4H14V8H10V4H9V2H7V1H4V2H2V4H1V7H2V9H4v1H8v4H4v1H2v2H1v3H2v2H4v1H7V22H9V20h1V16h4v4h1v2h2v1h3V22h2V20h1V17H22V15H20V14H16V10ZM16,4h1V3h3V4h1V7H20V8H17V7H16ZM8,20H7v1H4V20H3V17H4V16H7v1H8ZM8,7H7V8H4V7H3V4H4V3H7V4H8Zm2,7V10h4v4Zm11,3v3H20v1H17V20H16V17h1V16h3v1Z"/></symbol>
  <!-- regular/code.svg -->
  <symbol id="i-code" viewBox="0 0 24 24"><polygon points="7 7 7 8 6 8 6 9 5 9 5 10 4 10 4 11 3 11 3 13 4 13 4 14 5 14 5 15 6 15 6 16 7 16 7 17 5 17 5 16 4 16 4 15 3 15 3 14 2 14 2 13 1 13 1 11 2 11 2 10 3 10 3 9 4 9 4 8 5 8 5 7 7 7"/><polygon points="15 3 16 3 16 6 15 6 15 9 14 9 14 12 13 12 13 14 12 14 12 17 11 17 11 20 10 20 10 21 9 21 9 18 10 18 10 15 11 15 11 12 12 12 12 10 13 10 13 7 14 7 14 4 15 4 15 3"/><polygon points="23 11 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 17 17 17 16 18 16 18 15 19 15 19 14 20 14 20 13 21 13 21 11 20 11 20 10 19 10 19 9 18 9 18 8 17 8 17 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11"/></symbol>
  <!-- regular/code-block.svg -->
  <symbol id="i-code-block" viewBox="0 0 24 24"><polygon points="14 10 13 10 13 8 14 8 14 7 15 7 15 6 16 6 16 5 15 5 15 4 14 4 14 3 13 3 13 1 14 1 14 2 15 2 15 3 16 3 16 4 17 4 17 5 18 5 18 6 17 6 17 7 16 7 16 8 15 8 15 9 14 9 14 10"/><polygon points="2 6 1 6 1 5 2 5 2 4 3 4 3 3 4 3 4 2 5 2 5 1 6 1 6 3 5 3 5 4 4 4 4 5 3 5 3 6 4 6 4 7 5 7 5 8 6 8 6 10 5 10 5 9 4 9 4 8 3 8 3 7 2 7 2 6"/><polygon points="8 10 7 10 7 8 8 8 8 6 9 6 9 4 10 4 10 2 11 2 11 1 12 1 12 3 11 3 11 5 10 5 10 7 9 7 9 9 8 9 8 10"/><polygon points="23 5 23 22 22 22 22 23 2 23 2 22 1 22 1 9 2 9 2 10 3 10 3 21 21 21 21 6 19 6 19 4 22 4 22 5 23 5"/></symbol>
  <!-- regular/coins.svg -->
  <symbol id="i-coins" viewBox="0 0 24 24"><polygon points="23 4 23 15 22 15 22 16 19 16 19 14 21 14 21 12 19 12 19 10 21 10 21 8 18 8 18 6 20 6 20 4 18 4 18 3 11 3 11 4 9 4 9 5 7 5 7 3 9 3 9 2 11 2 11 1 18 1 18 2 20 2 20 3 22 3 22 4 23 4"/><path d="M15,8V7H12V6H6V7H3V8H1V21H3v1H6v1h6V22h3V21h2V8ZM3,9H6V8h6V9h3v2H12v1H6V11H3ZM15,20H12v1H6V20H3V17H6v1h6V17h3Zm-3-5v1H6V15H3V13H6v1h6V13h3v2Z"/></symbol>
  <!-- regular/collapse.svg -->
  <symbol id="i-collapse" viewBox="0 0 24 24"><polygon points="9 1 9 8 8 8 8 9 1 9 1 7 7 7 7 1 9 1"/><polygon points="8 16 9 16 9 23 7 23 7 17 1 17 1 15 8 15 8 16"/><polygon points="23 7 23 9 16 9 16 8 15 8 15 1 17 1 17 7 23 7"/><polygon points="23 15 23 17 17 17 17 23 15 23 15 16 16 16 16 15 23 15"/></symbol>
  <!-- regular/comment.svg -->
  <symbol id="i-comment" viewBox="0 0 24 24"><path d="m22,8v-2h-1v-1h-1v-1h-2v-1h-3v-1h-6v1h-3v1h-2v1h-1v1h-1v2h-1v6h1v2h1v2h-1v1h-1v2h5v-1h1v-1h2v1h6v-1h3v-1h2v-1h1v-1h1v-2h1v-6h-1Zm-2,6v2h-2v1h-3v1h-6v-1h-2v1h-1v1h-2v-1h1v-2h-1v-2h-1v-6h1v-2h2v-1h3v-1h6v1h3v1h2v2h1v6h-1Z"/></symbol>
  <!-- regular/comments.svg -->
  <symbol id="i-comments" viewBox="0 0 24 24"><path d="m23,16v-5h-1v-2h-2v-1h-2v-1h-3v-2h-2v-1h-2v-1h-5v1h-2v1h-2v2h-1v5h1v2h-1v4h3v-1h1v-1h4v2h2v1h2v1h6v1h1v1h3v-4h-1v-2h1Zm-18-2v1h-1v1h-1v-2h1v-2h-1v-5h1v-1h2v-1h5v1h2v1h1v5h-1v1h-2v1h-6Zm16,2h-1v2h1v2h-1v-1h-1v-1h-6v-1h-2v-2h2v-1h2v-2h1v-3h2v1h2v1h1v5Z"/></symbol>
  <!-- regular/copy.svg -->
  <symbol id="i-copy" viewBox="0 0 24 24"><polygon points="16 20 16 22 15 22 15 23 3 23 3 22 2 22 2 6 3 6 3 5 6 5 6 20 16 20"/><path d="m16,7V1h-8v1h-1v16h1v1h13v-1h1V7h-6Zm4,10h-11V3h5v6h6v8Z"/><polygon points="22 5 22 6 17 6 17 1 18 1 18 2 19 2 19 3 20 3 20 4 21 4 21 5 22 5"/></symbol>
  <!-- regular/crown.svg -->
  <symbol id="i-crown" viewBox="0 0 24 24"><path d="m22,7v-1h-2v1h-1v2h1v1h-1v1h-1v1h-2v-1h-1v-2h-1v-2h-1v-1h1v-2h-1v-1h-2v1h-1v2h1v1h-1v2h-1v2h-1v1h-2v-1h-1v-1h-1v-1h1v-2h-1v-1h-2v1h-1v2h1v1h1v4h1v3h1v2h1v2h12v-2h1v-2h1v-3h1v-4h1v-1h1v-2h-1Zm-4,7v3h-1v2H7v-2h-1v-3h-1v-1h1v1h2v-1h1v-1h1v-1h1v-2h2v2h1v1h1v1h1v1h2v-1h1v1h-1Z"/></symbol>
  <!-- regular/disc.svg -->
  <symbol id="i-disc" viewBox="0 0 24 24"><path d="M15,10V9H14V8H10V9H9v1H8v4H9v1h1v1h4V15h1V14h1V10Zm-1,3H13v1H11V13H10V11h1V10h2v1h1Z"/><polygon points="12 4 12 6 9 6 9 7 8 7 8 8 7 8 7 9 6 9 6 12 4 12 4 10 5 10 5 8 6 8 6 7 7 7 7 6 8 6 8 5 10 5 10 4 12 4"/><path d="M22,9V7H21V5H20V4H19V3H17V2H15V1H9V2H7V3H5V4H4V5H3V7H2V9H1v6H2v2H3v2H4v1H5v1H7v1H9v1h6V22h2V21h2V20h1V19h1V17h1V15h1V9Zm-1,6H20v2H19v1H18v1H17v1H15v1H9V20H7V19H6V18H5V17H4V15H3V9H4V7H5V6H6V5H7V4H9V3h6V4h2V5h1V6h1V7h1V9h1Z"/></symbol>
  <!-- regular/notebook.svg -->
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M22,3V2H21V1H5V2H4V5H1V7H4v4H1v2H4v4H1v2H4v3H5v1H21V22h1V21h1V3ZM9,21H6V3H9Zm12-1H20v1H11V3h9V4h1Z"/></symbol>
  <!-- regular/download.svg -->
  <symbol id="i-download" viewBox="0 0 24 24"><polygon points="5 10 4 10 4 8 6 8 6 9 7 9 7 10 8 10 8 11 9 11 9 12 10 12 10 13 11 13 11 1 13 1 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 9 18 9 18 8 20 8 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 12 6 12 6 11 5 11 5 10"/><rect x="2" y="21" width="20" height="2"/></symbol>
  <!-- regular/edit.svg -->
  <symbol id="i-edit" viewBox="0 0 24 24"><polygon points="22 4 22 7 21 7 21 8 20 8 20 7 19 7 19 6 21 6 21 5 20 5 20 4 19 4 19 6 18 6 18 5 17 5 17 4 18 4 18 3 21 3 21 4 22 4"/><polygon points="18 14 18 21 17 21 17 22 2 22 2 21 1 21 1 6 2 6 2 5 14 5 14 6 13 6 13 7 3 7 3 20 16 20 16 15 17 15 17 14 18 14"/><path d="m18,8v-1h-1v-1h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v4h4v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-2h-1Zm-1,2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-2h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h2v2Z"/></symbol>
  <!-- authored -->
  <symbol id="i-eject" viewBox="0 0 24 24"><path d="M11 4h2v1h-2zM10 5h1v1h-1zM13 5h1v1h-1zM9 6h1v1h-1zM14 6h1v1h-1zM8 7h1v1h-1zM15 7h1v1h-1zM7 8h1v1h-1zM16 8h1v1h-1zM6 9h1v1h-1zM17 9h1v1h-1zM5 10h1v1h-1zM18 10h1v1h-1zM4 11h16v1h-16z"/><path d="M4 15h16v1h-16zM4 16h1v1h-1zM19 16h1v1h-1zM4 17h1v1h-1zM19 17h1v1h-1zM4 18h1v1h-1zM19 18h1v1h-1zM4 19h16v1h-16z"/></symbol>
  <!-- regular/expand.svg -->
  <symbol id="i-expand" viewBox="0 0 24 24"><polygon points="9 1 9 3 3 3 3 9 1 9 1 2 2 2 2 1 9 1"/><polygon points="9 21 9 23 2 23 2 22 1 22 1 15 3 15 3 21 9 21"/><polygon points="23 15 23 22 22 22 22 23 15 23 15 21 21 21 21 15 23 15"/><polygon points="23 2 23 9 21 9 21 3 15 3 15 1 22 1 22 2 23 2"/></symbol>
  <!-- regular/external-link.svg -->
  <symbol id="i-external" viewBox="0 0 24 24"><polygon points="20 15 20 22 19 22 19 23 2 23 2 22 1 22 1 5 2 5 2 4 11 4 11 6 3 6 3 21 18 21 18 15 20 15"/><polygon points="23 1 23 9 21 9 21 5 20 5 20 6 19 6 19 7 18 7 18 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 12 13 12 13 13 12 13 12 14 11 14 11 15 10 15 10 16 9 16 9 17 7 17 7 15 8 15 8 14 9 14 9 13 10 13 10 12 11 12 11 11 12 11 12 10 13 10 13 9 14 9 14 8 15 8 15 7 16 7 16 6 17 6 17 5 18 5 18 4 19 4 19 3 15 3 15 1 23 1"/></symbol>
  <!-- regular/eye.svg -->
  <symbol id="i-eye" viewBox="0 0 24 24"><rect x="16" y="11" width="1" height="2"/><polygon points="16 13 16 15 15 15 15 16 13 16 13 15 14 15 14 14 15 14 15 13 16 13"/><polygon points="16 9 16 11 15 11 15 10 14 10 14 9 13 9 13 8 15 8 15 9 16 9"/><rect x="11" y="16" width="2" height="1"/><polygon points="11 15 11 16 9 16 9 15 8 15 8 13 9 13 9 14 10 14 10 15 11 15"/><polygon points="13 7 13 8 12 8 12 11 11 11 11 12 8 12 8 13 7 13 7 11 8 11 8 9 9 9 9 8 11 8 11 7 13 7"/><path d="m22,11v-2h-1v-1h-1v-1h-1v-1h-2v-1H7v1h-2v1h-1v1h-1v1h-1v2h-1v2h1v2h1v1h1v1h1v1h2v1h10v-1h2v-1h1v-1h1v-1h1v-2h1v-2h-1Zm-1,3h-1v1h-1v1h-1v1h-2v1h-8v-1h-1v-1h-2v-1h-1v-1h-1v-4h1v-1h1v-1h1v-1h2v-1h8v1h2v1h1v1h1v1h1v4Z"/></symbol>
  <!-- regular/eye-cross.svg -->
  <symbol id="i-eye-off" viewBox="0 0 24 24"><polygon points="15 13 16 13 16 15 15 15 15 16 13 16 13 15 14 15 14 14 15 14 15 13"/><rect x="16" y="11" width="1" height="2"/><polygon points="23 11 23 13 22 13 22 15 21 15 21 16 20 16 20 17 19 17 19 18 17 18 17 19 9 19 9 18 16 18 16 17 18 17 18 16 19 16 19 15 20 15 20 14 21 14 21 10 20 10 20 9 19 9 19 8 21 8 21 9 22 9 22 11 23 11"/><polygon points="2 13 1 13 1 11 2 11 2 9 3 9 3 8 4 8 4 7 5 7 5 6 7 6 7 5 15 5 15 6 8 6 8 7 6 7 6 8 5 8 5 9 4 9 4 10 3 10 3 14 4 14 4 15 5 15 5 16 3 16 3 15 2 15 2 13"/><polygon points="13 7 13 8 12 8 12 9 11 9 11 10 10 10 10 11 9 11 9 12 8 12 8 13 7 13 7 11 8 11 8 9 9 9 9 8 11 8 11 7 13 7"/><polygon points="9 17 8 17 8 18 7 18 7 19 6 19 6 20 5 20 5 21 4 21 4 22 3 22 3 21 2 21 2 20 3 20 3 19 4 19 4 18 5 18 5 17 6 17 6 16 7 16 7 15 8 15 8 14 9 14 9 13 10 13 10 12 11 12 11 11 12 11 12 10 13 10 13 9 14 9 14 8 15 8 15 7 16 7 16 6 17 6 17 5 18 5 18 4 19 4 19 3 20 3 20 2 21 2 21 3 22 3 22 4 21 4 21 5 20 5 20 6 19 6 19 7 18 7 18 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 12 13 12 13 13 12 13 12 14 11 14 11 15 10 15 10 16 9 16 9 17"/><rect x="11" y="16" width="2" height="1"/></symbol>
  <!-- regular/filter.svg -->
  <symbol id="i-filter" viewBox="0 0 24 24"><path d="m1,2v4h1v1h1v1h1v1h1v1h1v1h1v1h1v2h1v3h1v1h1v1h1v1h1v1h1v1h1v-8h1v-2h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1V2H1Zm20,3h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v3h-1v3h-1v-1h-1v-2h-1v-3h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h18v1Z"/></symbol>
  <!-- regular/fire.svg -->
  <symbol id="i-fire" viewBox="0 0 24 24"><path d="m19,13v-3h-1v-1h-1v-3h-1v-2h-1v-1h-1v-1h-1v-1h-2v1h1v2h-1v2h-1v1h-1v1h-1v1h-1v1h-1v3h1v2h-1v-1h-1v-2h-1v2h-1v3h1v2h1v1h1v1h1v1h1v1h8v-1h1v-1h1v-1h1v-2h1v-5h-1Zm-3,7v1h-2v1h-4v-1h-1v-3h1v-1h1v-1h1v-1h1v-4h1v2h1v4h-1v2h1v-1h1v-1h1v3h-1Zm3-3h-1v-1h-2v-4h-1v-2h-1v-1h-3v1h1v4h-1v1h-1v1h-1v1h-1v3h-1v-1h-1v-1h-1v-2h3v-4h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-2h1v-1h1v1h1v2h1v3h1v1h1v3h1v3Z"/></symbol>
  <!-- regular/flag.svg -->
  <symbol id="i-flag" viewBox="0 0 24 24"><path d="m21,4v1h-2v1h-6v-1h-7v1h-1v-1h1v-2h-1v-1h-2v1h-1v2h1v17h2v-4h1v-1h7v1h6v-1h2v-1h1V4h-1Zm-1,11h-1v1h-6v-1h-7v1h-1v-8h1v-1h7v1h6v-1h1v8Z"/></symbol>
  <!-- regular/save.svg -->
  <symbol id="i-floppy" viewBox="0 0 24 24"><polygon points="15 14 15 18 14 18 14 19 10 19 10 18 9 18 9 14 10 14 10 13 14 13 14 14 15 14"/><path d="m22,7v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H2v1h-1v20h1v1h20v-1h1V7h-1Zm-7,3V3h1v1h1v1h1v1h1v1h1v1h1v13H3V3h1v7h11ZM6,3h7v5h-7V3Z"/></symbol>
  <!-- regular/folder.svg -->
  <symbol id="i-folder" viewBox="0 0 24 24"><path d="m22,6v-1h-9v-1h-1v-1h-1v-1H2v1h-1v18h1v1h20v-1h1V6h-1Zm-1,14H3V4h7v1h1v1h1v1h9v13Z"/></symbol>
  <!-- regular/folder-open.svg -->
  <symbol id="i-folder-open" viewBox="0 0 24 24"><path d="m6,10v2h-1v2h-1v2h-1v2h-1v3h1v1h15v-1h1v-3h1v-2h1v-2h1v-2h1v-2H6Zm14,4h-1v2h-1v2h-1v2H4v-2h1v-2h1v-2h1v-2h13v2Z"/><polygon points="20 5 20 9 18 9 18 6 9 6 9 5 8 5 8 4 3 4 3 14 2 14 2 16 1 16 1 3 2 3 2 2 9 2 9 3 10 3 10 4 19 4 19 5 20 5"/></symbol>
  <!-- regular/fork.svg -->
  <symbol id="i-fork" viewBox="0 0 24 24"><path d="M21,2V1H17V2H16V6h1V7h1v4H6V7H7V6H8V2H7V1H3V2H2V6H3V7H4v6h7v4H10v1H9v4h1v1h4V22h1V18H14V17H13V13h7V7h1V6h1V2ZM4,3H6V5H4Zm9,18H11V19h2ZM20,5H18V3h2Z"/></symbol>
  <!-- regular/cog.svg -->
  <symbol id="i-gear" viewBox="0 0 24 24"><path d="m21,10v-1h-1v-2h1v-2h-1v-1h-1v-1h-2v1h-2v-1h-1V1h-4v2h-1v1h-2v-1h-2v1h-1v1h-1v2h1v2h-1v1H1v4h2v1h1v2h-1v2h1v1h1v1h2v-1h2v1h1v2h4v-2h1v-1h2v1h2v-1h1v-1h1v-2h-1v-2h1v-1h2v-4h-2Zm0,3h-1v1h-1v1h-1v2h1v2h-2v-1h-2v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-2v1h-2v-2h1v-2h-1v-1h-1v-1h-1v-2h1v-1h1v-1h1v-2h-1v-2h2v1h2v-1h1v-1h1v-1h2v1h1v1h1v1h2v-1h2v2h-1v2h1v1h1v1h1v2Z"/><path d="m16,10v-1h-1v-1h-1v-1h-4v1h-1v1h-1v1h-1v4h1v1h1v1h1v1h4v-1h1v-1h1v-1h1v-4h-1Zm-1,4h-1v1h-4v-1h-1v-4h1v-1h4v1h1v4Z"/></symbol>
  <!-- regular/glasses.svg -->
  <symbol id="i-glasses" viewBox="0 0 24 24"><path d="M21,5V4H20V3H16V5h3V6h1v5H15v1H9V11H4V6H5V5H8V3H4V4H3V5H2V17H3v2H5v1H8V19h2V17h1V16h2v1h1v2h2v1h3V19h2V17h1V5ZM8,17v1H5V17H4V14H5V13H8v1H9v3Zm11,0v1H16V17H15V14h1V13h3v1h1v3Z"/></symbol>
  <!-- regular/globe.svg -->
  <symbol id="i-globe" viewBox="0 0 24 24"><path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v7h1v1h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-1,1v4h-3v-4h3Zm-5-6h1v1h2v2h1v1h-3v-3h-1v-1Zm-2,14v2h-1v1h-2v-1h-1v-2h-1v-2h6v2h-1Zm2-8v4h-8v-4h8Zm-7-4h1v-2h1v-1h2v1h1v2h1v2h-6v-2Zm-5,1h1v-2h2v-1h1v1h-1v3h-3v-1Zm-1,7v-4h3v4h-3Zm2,5v-2h-1v-1h3v3h1v1h-1v-1h-2Zm14-2v2h-2v1h-1v-1h1v-3h3v1h-1Z"/></symbol>
  <!-- regular/graduation-cap.svg -->
  <symbol id="i-graduation" viewBox="0 0 24 24"><path d="M22,8V7H20V6H17V5H15V4H13V3H11V4H9V5H7V6H4V7H2V8H1V21H3V10H4v1H5v7H6v1H7v1H9v1h6V20h2V19h1V18h1V11h1V10h2V9h1V8Zm-5,9H16v1H15v1H9V18H8V17H7V12H9v1h2v1h2V13h2V12h2Zm3-8H17v1H15v1H13v1H11V11H9V10H7V9H4V8H7V7H9V6h2V5h2V6h2V7h2V8h3Z"/></symbol>
  <!-- regular/grid.svg -->
  <symbol id="i-grid" viewBox="0 0 24 24"><path d="m10,13H2v1h-1v8h1v1h8v-1h1v-8h-1v-1Zm-1,8H3v-6h6v6Z"/><path d="m10,2v-1H2v1h-1v8h1v1h8v-1h1V2h-1Zm-7,7V3h6v6H3Z"/><path d="m22,13h-8v1h-1v8h1v1h8v-1h1v-8h-1v-1Zm-1,8h-6v-6h6v6Z"/><path d="m22,2v-1h-8v1h-1v8h1v1h8v-1h1V2h-1Zm-1,7h-6V3h6v6Z"/></symbol>
  <!-- regular/handshake.svg -->
  <symbol id="i-handshake" viewBox="0 0 24 24"><polygon points="18 8 18 7 11 7 11 8 10 8 10 9 9 9 9 10 8 10 8 12 11 12 11 11 12 11 12 10 13 10 13 9 15 9 15 10 16 10 16 11 17 11 17 12 18 12 18 13 19 13 19 14 21 14 21 13 23 13 23 15 22 15 22 16 20 16 20 17 19 17 19 18 18 18 18 19 17 19 17 20 14 20 14 21 8 21 8 20 6 20 6 19 5 19 5 18 4 18 4 17 3 17 3 16 2 16 2 15 1 15 1 13 3 13 3 14 4 14 4 15 5 15 5 16 6 16 6 17 7 17 7 18 8 18 8 19 9 19 9 18 8 18 8 17 7 17 7 16 9 16 9 17 10 17 10 18 11 18 11 19 13 19 13 18 12 18 12 17 11 17 11 16 10 16 10 15 12 15 12 16 13 16 13 17 14 17 14 18 17 18 17 17 15 17 15 16 14 16 14 15 13 15 13 14 15 14 15 15 16 15 16 16 18 16 18 15 17 15 17 14 16 14 16 13 15 13 15 12 13 12 13 13 11 13 11 14 8 14 8 13 7 13 7 12 6 12 6 10 7 10 7 9 8 9 8 8 9 8 9 7 6 7 6 8 5 8 5 7 3 7 3 6 1 6 1 4 3 4 3 5 5 5 5 6 6 6 6 5 18 5 18 6 19 6 19 5 21 5 21 4 23 4 23 6 21 6 21 7 19 7 19 8 18 8"/></symbol>
  <!-- regular/hashtag.svg -->
  <symbol id="i-hash" viewBox="0 0 24 24"><path d="M17,12V9h6V7H18V4h1V1H17V4H16V7H10V4h1V1H9V4H8V7H3V9H7v3H6v3H1v2H5v3H4v3H6V20H7V17h6v3H12v3h2V20h1V17h6V15H16V12Zm-2,0H14v3H8V12H9V9h6Z"/></symbol>
  <!-- regular/h1.svg -->
  <symbol id="i-heading" viewBox="0 0 24 24"><polygon points="23 18 23 20 14 20 14 18 18 18 18 6 17 6 17 7 16 7 16 8 14 8 14 6 15 6 15 5 16 5 16 4 20 4 20 18 23 18"/><polygon points="12 4 12 20 10 20 10 12 3 12 3 20 1 20 1 4 3 4 3 10 10 10 10 4 12 4"/></symbol>
  <!-- regular/headphones.svg -->
  <symbol id="i-headphones" viewBox="0 0 24 24"><path d="m22,9v-2h-1v-1h-1v-1h-1v-1h-1v-1h-2v-1h-8v1h-2v1h-1v1h-1v1h-1v1h-1v2h-1v11h1v2h1v1h3v-1h1v-9h-1v-1h-3v2h-1v-4h1v-2h1v-1h1v-1h1v-1h1v-1h2v-1h6v1h2v1h1v1h1v1h1v1h1v2h1v4h-1v-2h-3v1h-1v9h1v1h3v-1h1v-2h1v-11h-1ZM3,15h1v-1h1v7h-1v-1h-1v-5Zm18,5h-1v1h-1v-7h1v1h1v5Z"/></symbol>
  <!-- regular/heart.svg -->
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="m22,6v-1h-1v-1h-1v-1h-6v1h-1v1h-2v-1h-1v-1h-6v1h-1v1h-1v1h-1v5h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-5h-1Zm-2,4v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1h1v-1h4v1h1v1h1v1h2v-1h1v-1h1v-1h4v1h1v1h1v3h-1Z"/></symbol>
  <!-- solid/heart-solid.svg -->
  <symbol id="i-heart-fill" viewBox="0 0 24 24"><polygon points="23 6 23 11 22 11 22 12 21 12 21 13 20 13 20 14 19 14 19 15 18 15 18 16 17 16 17 17 16 17 16 18 15 18 15 19 14 19 14 20 13 20 13 21 11 21 11 20 10 20 10 19 9 19 9 18 8 18 8 17 7 17 7 16 6 16 6 15 5 15 5 14 4 14 4 13 3 13 3 12 2 12 2 11 1 11 1 6 2 6 2 5 3 5 3 4 4 4 4 3 10 3 10 4 11 4 11 5 13 5 13 4 14 4 14 3 20 3 20 4 21 4 21 5 22 5 22 6 23 6"/></symbol>
  <!-- regular/highlight.svg -->
  <symbol id="i-highlight" viewBox="0 0 24 24"><path d="m21,1v8h-10V1h-2v10h1v2h1v2h1v6H1v2h19v-8h1v-2h1v-2h1V1h-2Zm-3,20h-4v-4h4v4Zm2-8h-1v2h-6v-2h-1v-2h8v2Z"/></symbol>
  <!-- regular/home.svg -->
  <symbol id="i-home" viewBox="0 0 24 24"><path d="m22,11v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h3v10h1v1h4v-7h6v7h4v-1h1v-10h3v-1h-1Zm-3,0h-1v10h-1v-6h-1v-1h-8v1h-1v6h-1v-10h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h2v1h1v1h1v1h1v1h1v1h1v1h1v1Z"/></symbol>
  <!-- regular/image.svg -->
  <symbol id="i-image" viewBox="0 0 24 24"><polygon points="9 6 9 9 8 9 8 10 5 10 5 9 4 9 4 6 5 6 5 5 8 5 8 6 9 6"/><path d="m22,2v-1H2v1h-1v20h1v1h20v-1h1V2h-1Zm-5,12v1h1v1h1v1h1v1h1v3h-13v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v1h1Zm3,1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1V3h18v12h-1Zm-15,3v1h1v1h1v1H3v-4h1v1h1Z"/></symbol>
  <!-- regular/file-import.svg -->
  <symbol id="i-import" viewBox="0 0 24 24"><polygon points="1 15 1 13 12 13 12 8 13 8 13 9 14 9 14 10 15 10 15 11 16 11 16 12 17 12 17 13 18 13 18 15 17 15 17 16 16 16 16 17 15 17 15 18 14 18 14 19 13 19 13 20 12 20 12 15 1 15"/><polygon points="23 6 23 22 22 22 22 23 7 23 7 22 6 22 6 16 8 16 8 21 21 21 21 8 16 8 16 3 8 3 8 12 6 12 6 2 7 2 7 1 18 1 18 2 19 2 19 3 20 3 20 4 21 4 21 5 22 5 22 6 23 6"/></symbol>
  <!-- regular/indent.svg -->
  <symbol id="i-indent" viewBox="0 0 24 24"><path d="M8,11V10H7V9H6V8H5V7H4V6H2V7H1V17H2v1H4V17H5V16H6V15H7V14H8V13H9V11ZM6,13v1H5v1H4v1H2V8H4V9H5v1H6v1H7v2Z"/><rect x="11" y="8" width="12" height="1"/><rect x="1" y="21" width="22" height="1"/><rect x="11" y="15" width="12" height="1"/><rect x="1" y="2" width="22" height="1"/></symbol>
  <!-- regular/info-circle.svg -->
  <symbol id="i-info" viewBox="0 0 24 24"><polygon points="14 15 14 17 10 17 10 15 11 15 11 10 10 10 10 9 13 9 13 15 14 15"/><rect x="11" y="6" width="2" height="2"/><path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-1,6h-1v2h-1v1h-1v1h-1v1h-2v1h-6v-1h-2v-1h-1v-1h-1v-1h-1v-2h-1v-6h1v-2h1v-1h1v-1h1v-1h2v-1h6v1h2v1h1v1h1v1h1v2h1v6Z"/><g id="BG_copy_84"><rect width="24" height="24" fill="none"/></g></symbol>
  <!-- regular/italics.svg -->
  <symbol id="i-italic" viewBox="0 0 24 24"><polygon points="22 1 22 3 17 3 17 4 16 4 16 6 15 6 15 8 14 8 14 11 13 11 13 13 12 13 12 16 11 16 11 18 10 18 10 20 9 20 9 21 16 21 16 23 2 23 2 21 7 21 7 20 8 20 8 18 9 18 9 16 10 16 10 13 11 13 11 11 12 11 12 8 13 8 13 6 14 6 14 4 15 4 15 3 8 3 8 1 22 1"/></symbol>
  <!-- regular/laptop-code.svg -->
  <symbol id="i-laptop" viewBox="0 0 24 24"><polygon points="3 14 3 5 4 5 4 4 20 4 20 5 21 5 21 14 19 14 19 6 5 6 5 14 3 14"/><polygon points="10 11 11 11 11 13 10 13 10 12 9 12 9 11 8 11 8 9 9 9 9 8 10 8 10 7 11 7 11 9 10 9 10 11"/><polygon points="14 9 13 9 13 7 14 7 14 8 15 8 15 9 16 9 16 11 15 11 15 12 14 12 14 13 13 13 13 11 14 11 14 9"/><path d="M1,15v3H2v1H3v1H21V19h1V18h1V15Zm2,3V17H21v1Z"/></symbol>
  <!-- authored -->
  <symbol id="i-led" viewBox="0 0 24 24"><path d="M10 8h4v1h-4zM9 9h6v1h-6zM8 10h8v1h-8zM8 11h8v1h-8zM8 12h8v1h-8zM8 13h8v1h-8zM9 14h6v1h-6zM10 15h4v1h-4z"/></symbol>
  <!-- regular/lightbulb.svg -->
  <symbol id="i-lightbulb" viewBox="0 0 24 24"><polygon points="14 21 14 22 13 22 13 23 11 23 11 22 10 22 10 21 14 21"/><rect x="11" y="4" width="2" height="1"/><rect x="10" y="5" width="1" height="1"/><path d="m19,7v-2h-1v-1h-1v-1h-1v-1h-2v-1h-4v1h-2v1h-1v1h-1v1h-1v2h-1v4h1v2h1v1h1v1h1v1h1v4h6v-4h1v-1h1v-1h1v-1h1v-2h1v-4h-1Zm-1,4h-1v2h-1v1h-1v1h-1v1h-4v-1h-1v-1h-1v-1h-1v-2h-1v-4h1v-2h1v-1h2v-1h4v1h2v1h1v2h1v4Z"/><rect x="9" y="6" width="1" height="1"/><rect x="8" y="7" width="1" height="2"/></symbol>
  <!-- regular/link.svg -->
  <symbol id="i-link" viewBox="0 0 24 24"><polygon points="16 10 17 10 17 17 16 17 16 18 15 18 15 19 14 19 14 20 13 20 13 21 12 21 12 22 11 22 11 23 5 23 5 22 4 22 4 21 3 21 3 20 2 20 2 19 1 19 1 14 2 14 2 13 3 13 3 12 4 12 4 11 5 11 5 14 4 14 4 15 3 15 3 18 4 18 4 19 5 19 5 20 6 20 6 21 10 21 10 20 11 20 11 19 12 19 12 18 13 18 13 17 14 17 14 16 15 16 15 11 14 11 14 10 13 10 13 9 14 9 14 8 15 8 15 9 16 9 16 10"/><polygon points="23 5 23 10 22 10 22 11 21 11 21 12 20 12 20 13 19 13 19 10 20 10 20 9 21 9 21 6 20 6 20 5 19 5 19 4 18 4 18 3 14 3 14 4 13 4 13 5 12 5 12 6 11 6 11 7 10 7 10 8 9 8 9 13 10 13 10 14 11 14 11 15 10 15 10 16 9 16 9 15 8 15 8 14 7 14 7 7 8 7 8 6 9 6 9 5 10 5 10 4 11 4 11 3 12 3 12 2 13 2 13 1 19 1 19 2 20 2 20 3 21 3 21 4 22 4 22 5 23 5"/></symbol>
  <!-- regular/bullet-list.svg -->
  <symbol id="i-list" viewBox="0 0 24 24"><rect x="2" y="5" width="3" height="3"/><rect x="2" y="11" width="3" height="3"/><rect x="2" y="17" width="3" height="3"/><rect x="8" y="18" width="14" height="1"/><rect x="8" y="6" width="14" height="1"/><rect x="8" y="12" width="14" height="1"/></symbol>
  <!-- regular/numbered-list.svg -->
  <symbol id="i-list-num" viewBox="0 0 24 24"><rect x="4" y="11" width="1" height="2"/><polygon points="4 8 5 8 5 9 2 9 2 8 3 8 3 6 2 6 2 5 3 5 3 4 4 4 4 8"/><polygon points="4 10 4 11 3 11 3 12 2 12 2 10 4 10"/><polygon points="5 16 5 21 2 21 2 20 4 20 4 19 3 19 3 18 4 18 4 17 2 17 2 16 5 16"/><polygon points="3 13 4 13 4 14 5 14 5 15 2 15 2 14 3 14 3 13"/><rect x="9" y="6" width="14" height="1"/><rect x="9" y="12" width="14" height="1"/><rect x="9" y="18" width="14" height="1"/></symbol>
  <!-- regular/lock.svg -->
  <symbol id="i-lock" viewBox="0 0 24 24"><path d="m21,12v-1h-3v-6h-1v-2h-1v-1h-2v-1h-4v1h-2v1h-1v2h-1v6h-3v1h-1v10h1v1h18v-1h1v-10h-1Zm-1,1v8H4v-8h16ZM9,5v-1h1v-1h4v1h1v1h1v6h-8v-6h1Z"/></symbol>
  <!-- regular/login.svg -->
  <symbol id="i-login" viewBox="0 0 24 24"><polygon points="10 19 10 20 8 20 8 18 9 18 9 17 10 17 10 16 11 16 11 15 12 15 12 14 13 14 13 13 1 13 1 11 13 11 13 10 12 10 12 9 11 9 11 8 10 8 10 7 9 7 9 6 8 6 8 4 10 4 10 5 11 5 11 6 12 6 12 7 13 7 13 8 14 8 14 9 15 9 15 10 16 10 16 11 17 11 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 12 17 12 18 11 18 11 19 10 19"/><rect x="21" y="2" width="2" height="20"/></symbol>
  <!-- authored -->
  <symbol id="i-logo" viewBox="0 0 24 24"><path d="M11 2h2v1h-2zM10 3h4v1h-4zM9 4h6v1h-6zM8 5h8v1h-8zM7 6h10v1h-10zM6 7h12v1h-12zM5 8h14v1h-14zM4 9h16v1h-16zM3 10h18v1h-18zM2 11h20v1h-20zM2 12h20v1h-20zM3 13h18v1h-18zM4 14h16v1h-16zM5 15h14v1h-14zM6 16h12v1h-12zM7 17h10v1h-10zM8 18h8v1h-8zM9 19h6v1h-6zM10 20h4v1h-4zM11 21h2v1h-2z"/></symbol>
  <!-- regular/logout.svg -->
  <symbol id="i-logout" viewBox="0 0 24 24"><polygon points="14 4 16 4 16 5 17 5 17 6 18 6 18 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 18 17 18 18 17 18 17 19 16 19 16 20 14 20 14 18 15 18 15 17 16 17 16 16 17 16 17 15 18 15 18 14 19 14 19 13 7 13 7 11 19 11 19 10 18 10 18 9 17 9 17 8 16 8 16 7 15 7 15 6 14 6 14 4"/><rect x="1" y="2" width="2" height="20"/></symbol>
  <!-- regular/envelope.svg -->
  <symbol id="i-mail" viewBox="0 0 24 24"><path d="m21,5v-1H3v1H1v14h1v1h20v-1h1V5h-2Zm-11,7v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h14v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1Zm-6-5v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v11H3V7h1Z"/></symbol>
  <!-- regular/bars.svg -->
  <symbol id="i-menu" viewBox="0 0 24 24"><rect x="1" y="11" width="22" height="2"/><rect x="1" y="19" width="22" height="2"/><rect x="1" y="3" width="22" height="2"/></symbol>
  <!-- regular/merge.svg -->
  <symbol id="i-merge" viewBox="0 0 24 24"><path d="M21,11V10H17v1H16v1H11V11H9V10H8V9H7V7H8V6H9V2H8V1H4V2H3V6H4V7H5V17H4v1H3v4H4v1H8V22H9V18H8V17H7V11H8v1H9v1h2v1h5v1h1v1h4V15h1V11ZM5,3H7V5H5ZM7,21H5V19H7Zm13-7H18V12h2Z"/></symbol>
  <!-- regular/message-dots.svg -->
  <symbol id="i-message" viewBox="0 0 24 24"><polygon points="19 9 19 11 18 11 18 12 16 12 16 11 15 11 15 9 16 9 16 8 18 8 18 9 19 9"/><polygon points="14 9 14 11 13 11 13 12 11 12 11 11 10 11 10 9 11 9 11 8 13 8 13 9 14 9"/><polygon points="9 9 9 11 8 11 8 12 6 12 6 11 5 11 5 9 6 9 6 8 8 8 8 9 9 9"/><path d="m22,2v-1H2v1h-1v16h1v1h6v4h1v-1h1v-1h1v-1h2v-1h9v-1h1V2h-1Zm-1,15H3V3h18v14Z"/></symbol>
  <!-- regular/minus.svg -->
  <symbol id="i-minus" viewBox="0 0 24 24"><rect x="1" y="11" width="22" height="2"/></symbol>
  <!-- regular/moon.svg -->
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="m21,17v1h-2v1h-4v-1h-2v-1h-2v-1h-1v-2h-1v-2h-1v-4h1v-2h1v-2h1v-1h2v-1h2v-1h-5v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h-1Zm-13,3v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v1h-1v2h-1v4h1v2h1v2h1v1h1v1h1v1h2v1h2v1h-5v-1h-2Z"/></symbol>
  <!-- regular/sound-mute.svg -->
  <symbol id="i-mute" viewBox="0 0 24 24"><polygon points="22 8 22 10 21 10 21 11 20 11 20 13 21 13 21 14 22 14 22 16 20 16 20 15 19 15 19 14 18 14 18 15 17 15 17 16 15 16 15 14 16 14 16 13 17 13 17 11 16 11 16 10 15 10 15 8 17 8 17 9 18 9 18 10 19 10 19 9 20 9 20 8 22 8"/><path d="m11,2v1h-1v1h-1v1h-1v1h-1v1h-1v1H1v8h5v1h1v1h1v1h1v1h1v1h1v1h3V2h-3ZM3,10h4v-1h1v-1h1v-1h1v-1h1v-1h1v14h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H3v-4Z"/></symbol>
  <!-- regular/newspaper.svg -->
  <symbol id="i-newspaper" viewBox="0 0 24 24"><path d="m22,6v-1H3v1h-1v1h-1v11h1v1h20v-1h1V6h-1ZM4,17h-1V7h1v10Zm17,0H6V7h15v10Z"/><rect x="14" y="14" width="5" height="2"/><rect x="14" y="11" width="5" height="2"/><rect x="14" y="8" width="5" height="2"/><path d="m7,8v5h6v-5h-6Zm4,3h-2v-1h2v1Z"/><rect x="7" y="14" width="6" height="2"/></symbol>
  <!-- authored -->
  <symbol id="i-next" viewBox="0 0 24 24"><path d="M4 4h1v1h-1zM4 5h2v1h-2zM4 6h1v1h-1zM6 6h1v1h-1zM4 7h1v1h-1zM7 7h1v1h-1zM4 8h1v1h-1zM8 8h1v1h-1zM4 9h1v1h-1zM9 9h1v1h-1zM4 10h1v1h-1zM10 10h1v1h-1zM4 11h1v1h-1zM11 11h1v1h-1zM4 12h1v1h-1zM11 12h1v1h-1zM4 13h1v1h-1zM10 13h1v1h-1zM4 14h1v1h-1zM9 14h1v1h-1zM4 15h1v1h-1zM8 15h1v1h-1zM4 16h1v1h-1zM7 16h1v1h-1zM4 17h1v1h-1zM6 17h1v1h-1zM4 18h2v1h-2zM4 19h1v1h-1z"/><path d="M14 4h3v1h-3zM14 5h1v1h-1zM16 5h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM14 7h1v1h-1zM16 7h1v1h-1zM14 8h1v1h-1zM16 8h1v1h-1zM14 9h1v1h-1zM16 9h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM14 11h1v1h-1zM16 11h1v1h-1zM14 12h1v1h-1zM16 12h1v1h-1zM14 13h1v1h-1zM16 13h1v1h-1zM14 14h1v1h-1zM16 14h1v1h-1zM14 15h1v1h-1zM16 15h1v1h-1zM14 16h1v1h-1zM16 16h1v1h-1zM14 17h1v1h-1zM16 17h1v1h-1zM14 18h1v1h-1zM16 18h1v1h-1zM14 19h3v1h-3z"/></symbol>
  <!-- regular/music.svg -->
  <symbol id="i-note" viewBox="0 0 24 24"><path d="m21,1v1h-3v1h-3v1h-4v1h-3v1h-2v10h-3v1h-1v1h-1v3h1v1h1v1h4v-1h1v-1h1v-10h2v-1h4v-1h3v-1h2v5h-3v1h-1v1h-1v3h1v1h1v1h4v-1h1v-1h1V1h-2ZM3,21v-3h4v3H3Zm15-15v1h-3v1h-4v1h-3v-2h3v-1h4v-1h3v-1h3v2h-3Zm-1,12v-3h4v3h-4Z"/></symbol>
  <!-- regular/outdent.svg -->
  <symbol id="i-outdent" viewBox="0 0 24 24"><rect x="11" y="8" width="12" height="1"/><rect x="11" y="15" width="12" height="1"/><rect x="1" y="21" width="22" height="1"/><path d="M8,7V6H6V7H5V8H4V9H3v1H2v1H1v2H2v1H3v1H4v1H5v1H6v1H8V17H9V7Zm0,9H6V15H5V14H4V13H3V11H4V10H5V9H6V8H8Z"/><rect x="1" y="2" width="22" height="1"/></symbol>
  <!-- regular/paperclip.svg -->
  <symbol id="i-paperclip" viewBox="0 0 24 24"><polygon points="21 4 21 9 20 9 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 12 17 12 18 11 18 11 19 8 19 8 18 7 18 7 17 6 17 6 14 7 14 7 13 8 13 8 12 9 12 9 11 10 11 10 10 11 10 11 9 12 9 12 8 13 8 13 7 14 7 14 6 15 6 15 5 16 5 16 6 17 6 17 7 16 7 16 8 15 8 15 9 14 9 14 10 13 10 13 11 12 11 12 12 11 12 11 13 10 13 10 14 9 14 9 15 8 15 8 16 9 16 9 17 10 17 10 16 11 16 11 15 12 15 12 14 13 14 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 9 18 9 18 8 19 8 19 5 18 5 18 4 17 4 17 3 14 3 14 4 13 4 13 5 12 5 12 6 11 6 11 7 10 7 10 8 9 8 9 9 8 9 8 10 7 10 7 11 6 11 6 12 5 12 5 13 4 13 4 18 5 18 5 19 6 19 6 20 7 20 7 21 12 21 12 20 13 20 13 19 14 19 14 18 15 18 15 17 16 17 16 16 17 16 17 15 18 15 18 14 19 14 19 13 21 13 21 15 20 15 20 16 19 16 19 17 18 17 18 18 17 18 17 19 16 19 16 20 15 20 15 21 14 21 14 22 13 22 13 23 7 23 7 22 5 22 5 21 4 21 4 20 3 20 3 18 2 18 2 12 3 12 3 11 4 11 4 10 5 10 5 9 6 9 6 8 7 8 7 7 8 7 8 6 9 6 9 5 10 5 10 4 11 4 11 3 12 3 12 2 14 2 14 1 18 1 18 2 19 2 19 3 20 3 20 4 21 4"/></symbol>
  <!-- regular/pause.svg -->
  <symbol id="i-pause" viewBox="0 0 24 24"><path d="m9,1H2v1h-1v20h1v1h7v-1h1V2h-1v-1Zm-1,2v18H3V3h5Z"/><path d="m22,2v-1h-7v1h-1v20h1v1h7v-1h1V2h-1Zm-1,1v18h-5V3h5Z"/></symbol>
  <!-- regular/retro-pc.svg -->
  <symbol id="i-pc" viewBox="0 0 24 24"><rect x="11" y="14" width="7" height="2"/><rect x="6" y="14" width="2" height="2"/><polygon points="18 6 18 11 17 11 17 12 7 12 7 11 6 11 6 6 7 6 7 5 17 5 17 6 18 6"/><path d="M21,3V2H20V1H4V2H3V3H2V17H3v1H4v4H5v1H19V22h1V18h1V17h1V3ZM18,21H6V19H18Zm2-5H19v1H5V16H4V4H5V3H19V4h1Z"/></symbol>
  <!-- regular/pen-nib.svg -->
  <symbol id="i-pen" viewBox="0 0 24 24"><path d="m22,4v-1h-1v-1h-1v-1h-3v1h-1v1h-1v1h-1v1h-2v1h-3v1h-3v1h-1v2h-1v3h-1v3h-1v3h-1v3h1v1h3v-1h3v-1h3v-1h3v-1h2v-1h1v-3h1v-3h1v-2h1v-1h1v-1h1v-1h1v-3h-1Zm-6,8v3h-1v2h-1v1h-3v1h-3v1h-2v-1h1v-1h1v-1h1v-1h3v-3h-1v-1h-3v3h-1v1h-1v1h-1v1h-1v-2h1v-3h1v-3h1v-1h2v-1h3v-1h3v1h1v1h1v3h-1Z"/></symbol>
  <!-- regular/pencil.svg -->
  <symbol id="i-pencil" viewBox="0 0 24 24"><path d="m22,4v-1h-1v-1h-1v-1h-4v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v7h7v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-4h-1Zm-14,16h-1v1h-3v-1h-1v-3h1v-1h1v1h1v1h1v1h1v1Zm9-9h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h2v1h1v1h1v2Zm1-3v-1h-1v-1h-1v-2h1v-1h2v1h1v1h1v2h-1v1h-2Z"/></symbol>
  <!-- regular/phone-ringing-high.svg -->
  <symbol id="i-phone" viewBox="0 0 24 24"><rect x="12" y="10" width="2" height="2"/><polygon points="18 9 19 9 19 12 17 12 17 10 16 10 16 9 15 9 15 8 14 8 14 7 12 7 12 5 15 5 15 6 16 6 16 7 17 7 17 8 18 8 18 9"/><polygon points="23 8 23 12 21 12 21 8 20 8 20 7 19 7 19 6 18 6 18 5 17 5 17 4 16 4 16 3 12 3 12 1 16 1 16 2 18 2 18 3 19 3 19 4 20 4 20 5 21 5 21 6 22 6 22 8 23 8"/><path d="m22,17v-1h-1v-1h-2v-1h-3v1h-1v1h-3v-1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1h1v-3h-1v-2h-1v-1h-1v-1h-3v1h-2v1h-1v5h1v4h1v2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h2v1h4v1h5v-1h1v-2h1v-3h-1Zm-2,3v1h-4v-1h-4v-1h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-2h-1v-4h-1v-4h1v-1h3v2h1v3h-1v1h-1v3h1v1h1v1h1v1h1v1h1v1h1v1h3v-1h1v-1h3v1h2v3h-1Z"/></symbol>
  <!-- regular/thumbtack.svg -->
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="m18,13v-1h-1v-1h-1v-7h2v-2h-1v-1H7v1h-1v2h2v7h-1v1h-1v1h-1v2h1v1h5v7h2v-7h5v-1h1v-2h-1ZM9,3h6v1h-1v8h1v1h1v1h-8v-1h1v-1h1V4h-1v-1Z"/></symbol>
  <!-- regular/location-pin.svg -->
  <symbol id="i-pin-map" viewBox="0 0 24 24"><polygon points="15 8 15 10 14 10 14 11 13 11 13 12 11 12 11 11 10 11 10 10 9 10 9 8 10 8 10 7 11 7 11 6 13 6 13 7 14 7 14 8 15 8"/><path d="m19,6v-2h-1v-1h-1v-1h-2v-1h-6v1h-2v1h-1v1h-1v2h-1v6h1v2h1v1h1v2h1v1h1v2h1v1h1v2h2v-2h1v-1h1v-2h1v-1h1v-2h1v-1h1v-2h1v-6h-1Zm-2,6v2h-1v1h-1v2h-1v1h-1v2h-2v-2h-1v-1h-1v-2h-1v-1h-1v-2h-1v-6h1v-2h2v-1h6v1h2v2h1v6h-1Z"/></symbol>
  <!-- regular/plane.svg -->
  <symbol id="i-plane" viewBox="0 0 24 24"><path d="m22,11v-1h-7v-1h-1v-2h-1v-1h-1v-2h-1v-1h-1v-1h-3v3h1v3h1v2h-4v-1h-1v-1h-1v-1H1v3h1v4h-1v3h2v-1h1v-1h1v-1h4v2h-1v3h-1v3h3v-1h1v-1h1v-2h1v-1h1v-2h1v-1h7v-1h1v-2h-1Zm-8,2v1h-1v2h-1v1h-1v2h-1v1h-1v1h-1v-1h1v-3h1v-4h-6v1h-1v-4h1v1h6v-4h-1v-3h-1v-1h1v1h1v1h1v2h1v1h1v2h1v1h7v2h-7Z"/></symbol>
  <!-- regular/play.svg -->
  <symbol id="i-play" viewBox="0 0 24 24"><path d="m21,11v-1h-1v-1h-2v-1h-2v-1h-1v-1h-2v-1h-2v-1h-1v-1h-2v-1h-2v-1h-3v1h-1v20h1v1h3v-1h2v-1h2v-1h1v-1h2v-1h2v-1h1v-1h2v-1h2v-1h1v-1h1v-2h-1Zm-2,2h-2v1h-2v1h-1v1h-2v1h-2v1h-1v1h-2v1h-2v1h-1V3h1v1h2v1h2v1h1v1h2v1h2v1h1v1h2v1h2v2Z"/></symbol>
  <!-- regular/playlist.svg -->
  <symbol id="i-playlist" viewBox="0 0 24 24"><path d="m21,1v1h-2v1h-2v1h-1v12h-4v1h-2v1h-1v3h1v1h2v1h5v-1h1v-1h1v-13h2v-1h2V1h-2Zm-10,19v-1h1v-1h5v2h-1v1h-4v-1h-1Zm8-14v1h-1v-2h1v-1h2v2h-2Z"/><rect x="1" y="15" width="6" height="2"/><rect x="1" y="9" width="12" height="2"/><rect x="1" y="3" width="12" height="2"/></symbol>
  <!-- regular/plus.svg -->
  <symbol id="i-plus" viewBox="0 0 24 24"><polygon points="23 11 23 13 13 13 13 23 11 23 11 13 1 13 1 11 11 11 11 1 13 1 13 11 23 11"/></symbol>
  <!-- authored -->
  <symbol id="i-prev" viewBox="0 0 24 24"><path d="M19 4h1v1h-1zM18 5h2v1h-2zM17 6h1v1h-1zM19 6h1v1h-1zM16 7h1v1h-1zM19 7h1v1h-1zM15 8h1v1h-1zM19 8h1v1h-1zM14 9h1v1h-1zM19 9h1v1h-1zM13 10h1v1h-1zM19 10h1v1h-1zM12 11h1v1h-1zM19 11h1v1h-1zM12 12h1v1h-1zM19 12h1v1h-1zM13 13h1v1h-1zM19 13h1v1h-1zM14 14h1v1h-1zM19 14h1v1h-1zM15 15h1v1h-1zM19 15h1v1h-1zM16 16h1v1h-1zM19 16h1v1h-1zM17 17h1v1h-1zM19 17h1v1h-1zM18 18h2v1h-2zM19 19h1v1h-1z"/><path d="M7 4h3v1h-3zM7 5h1v1h-1zM9 5h1v1h-1zM7 6h1v1h-1zM9 6h1v1h-1zM7 7h1v1h-1zM9 7h1v1h-1zM7 8h1v1h-1zM9 8h1v1h-1zM7 9h1v1h-1zM9 9h1v1h-1zM7 10h1v1h-1zM9 10h1v1h-1zM7 11h1v1h-1zM9 11h1v1h-1zM7 12h1v1h-1zM9 12h1v1h-1zM7 13h1v1h-1zM9 13h1v1h-1zM7 14h1v1h-1zM9 14h1v1h-1zM7 15h1v1h-1zM9 15h1v1h-1zM7 16h1v1h-1zM9 16h1v1h-1zM7 17h1v1h-1zM9 17h1v1h-1zM7 18h1v1h-1zM9 18h1v1h-1zM7 19h3v1h-3z"/></symbol>
  <!-- regular/print.svg -->
  <symbol id="i-print" viewBox="0 0 24 24"><rect x="18" y="12" width="2" height="1"/><polygon points="20 3 20 8 18 8 18 4 17 4 17 3 6 3 6 8 4 8 4 1 18 1 18 2 19 2 19 3 20 3"/><path d="m1,9v8h3v6h16v-6h3v-8H1Zm17,12H6v-5h12v5Zm3-6h-2v-1H5v1h-2v-4h18v4Z"/></symbol>
  <!-- regular/pull-request.svg -->
  <symbol id="i-pull" viewBox="0 0 24 24"><path d="M20,18V17H19V3H15V1H14V2H13V3H11V5h2V6h1V7h1V5h2V17H16v1H15v4h1v1h4V22h1V18Zm-1,1v2H17V19Z"/><path d="M8,2V1H4V2H3V6H4V7H5V17H4v1H3v4H4v1H8V22H9V18H8V17H7V7H8V6H9V2ZM5,5V3H7V5ZM7,19v2H5V19Z"/></symbol>
  <!-- regular/question-circle.svg -->
  <symbol id="i-question" viewBox="0 0 24 24"><rect x="11" y="17" width="2" height="2"/><polygon points="16 7 16 11 15 11 15 12 14 12 14 13 13 13 13 15 11 15 11 12 12 12 12 11 13 11 13 10 14 10 14 8 13 8 13 7 11 7 11 8 10 8 10 9 8 9 8 7 9 7 9 6 10 6 10 5 14 5 14 6 15 6 15 7 16 7"/><path d="M22,9V7H21V5H20V4H19V3H17V2H15V1H9V2H7V3H5V4H4V5H3V7H2V9H1v6H2v2H3v2H4v1H5v1H7v1H9v1h6V22h2V21h2V20h1V19h1V17h1V15h1V9Zm-2,6v2H19v1H18v1H17v1H15v1H9V20H7V19H6V18H5V17H4V15H3V9H4V7H5V6H6V5H7V4H9V3h6V4h2V5h1V6h1V7h1V9h1v6Z"/></symbol>
  <!-- regular/quote-left.svg -->
  <symbol id="i-quote" viewBox="0 0 24 24"><path d="m22,13v-1h-5v-4h1v-1h2v-1h1v-3h-1v-1h-2v1h-2v1h-1v1h-1v2h-1v14h1v1h8v-1h1v-8h-1Zm-7,0h1v1h5v6h-6v-7Z"/><path d="m10,13v-1h-5v-4h1v-1h2v-1h1v-3h-1v-1h-2v1h-2v1h-1v1h-1v2h-1v14h1v1h8v-1h1v-8h-1Zm-7,0h1v1h5v6H3v-7Z"/></symbol>
  <!-- regular/wifi.svg -->
  <symbol id="i-radio" viewBox="0 0 24 24"><path d="M14,17V16H10v1H9v4h1v1h4V21h1V17Zm-1,3H11V18h2Z"/><polygon points="23 8 23 10 20 10 20 9 19 9 19 8 18 8 18 7 16 7 16 6 8 6 8 7 6 7 6 8 5 8 5 9 4 9 4 10 1 10 1 8 2 8 2 7 3 7 3 6 4 6 4 5 6 5 6 4 8 4 8 3 16 3 16 4 18 4 18 5 20 5 20 6 21 6 21 7 22 7 22 8 23 8"/><polygon points="18 12 19 12 19 15 17 15 17 14 16 14 16 13 15 13 15 12 9 12 9 13 8 13 8 14 7 14 7 15 5 15 5 12 6 12 6 11 8 11 8 10 9 10 9 9 15 9 15 10 16 10 16 11 18 11 18 12"/></symbol>
  <!-- regular/receipt.svg -->
  <symbol id="i-receipt" viewBox="0 0 24 24"><rect x="7" y="15" width="10" height="2"/><rect x="7" y="11" width="10" height="2"/><rect x="7" y="7" width="10" height="2"/><path d="m19,1v1h-1v1h-1v-1h-1v-1h-2v1h-1v1h-2v-1h-1v-1h-2v1h-1v1h-1v-1h-1v-1h-1v22h1v-1h1v-1h1v1h1v1h2v-1h1v-1h2v1h1v1h2v-1h1v-1h1v1h1v1h1V1h-1Zm-3,19v1h-2v-1h-1v-1h-2v1h-1v1h-2v-1h-1v-1h-1V5h1v-1h1v-1h2v1h1v1h2v-1h1v-1h2v1h1v1h1v14h-1v1h-1Z"/></symbol>
  <!-- authored -->
  <symbol id="i-record" viewBox="0 0 24 24"><path d="M9 4h6v1h-6zM7 5h2v1h-2zM15 5h2v1h-2zM6 6h1v1h-1zM17 6h1v1h-1zM5 7h1v1h-1zM18 7h1v1h-1zM5 8h1v1h-1zM18 8h1v1h-1zM4 9h1v1h-1zM19 9h1v1h-1zM4 10h1v1h-1zM19 10h1v1h-1zM4 11h1v1h-1zM19 11h1v1h-1zM4 12h1v1h-1zM19 12h1v1h-1zM4 13h1v1h-1zM19 13h1v1h-1zM4 14h1v1h-1zM19 14h1v1h-1zM5 15h1v1h-1zM18 15h1v1h-1zM5 16h1v1h-1zM18 16h1v1h-1zM6 17h1v1h-1zM17 17h1v1h-1zM7 18h2v1h-2zM15 18h2v1h-2zM9 19h6v1h-6z"/></symbol>
  <!-- regular/refresh.svg -->
  <symbol id="i-refresh" viewBox="0 0 24 24"><polygon points="23 14 23 15 22 15 22 17 21 17 21 19 20 19 20 20 19 20 19 21 17 21 17 22 15 22 15 23 9 23 9 22 7 22 7 21 5 21 5 20 3 20 3 21 2 21 2 22 1 22 1 15 8 15 8 16 7 16 7 17 6 17 6 19 7 19 7 20 9 20 9 21 15 21 15 20 17 20 17 19 19 19 19 17 20 17 20 14 23 14"/><polygon points="23 2 23 9 16 9 16 8 17 8 17 7 18 7 18 5 17 5 17 4 15 4 15 3 9 3 9 4 7 4 7 5 5 5 5 7 4 7 4 10 1 10 1 9 2 9 2 7 3 7 3 5 4 5 4 4 5 4 5 3 7 3 7 2 9 2 9 1 15 1 15 2 17 2 17 3 19 3 19 4 21 4 21 3 22 3 22 2 23 2"/></symbol>
  <!-- regular/robot.svg -->
  <symbol id="i-robot" viewBox="0 0 24 24"><rect x="14" y="15" width="3" height="1"/><rect x="11" y="15" width="2" height="1"/><rect x="7" y="15" width="3" height="1"/><path d="m19,7h-1v-1h-5v-3h-2v3h-5v1h-1v1h-1v10h1v1h1v1h12v-1h1v-1h1v-10h-1v-1Zm-2,10v1H7v-1h-1v-8h1v-1h10v1h1v8h-1Z"/><polygon points="23 11 23 16 22 16 22 17 21 17 21 10 22 10 22 11 23 11"/><polygon points="2 10 3 10 3 17 2 17 2 16 1 16 1 11 2 11 2 10"/><rect x="14" y="10" width="3" height="3"/><rect x="7" y="10" width="3" height="3"/></symbol>
  <!-- brands/rss.svg -->
  <symbol id="i-rss" viewBox="0 0 24 24"><path d="m22,2v-1H2v1h-1v20h1v1h20v-1h1V2h-1Zm-6,16v-3h-1v-2h-1v-1h-1v-1h-1v-1h-1v-1h-2v-1h-2v-1h-3v-3h3v1h2v1h2v1h2v1h1v1h1v1h1v1h1v2h1v2h1v2h1v3h-3v-2h-1Zm-5,0v-2h-1v-1h-1v-1h-1v-1h-2v-1h-2v-3h2v1h2v1h2v1h1v1h1v1h1v2h1v2h1v2h-3v-2h-1Zm-7,1v-3h1v-1h3v1h1v3h-1v1h-3v-1h-1Z"/></symbol>
  <!-- regular/search.svg -->
  <symbol id="i-search" viewBox="0 0 24 24"><path d="m22,20v-1h-1v-1h-1v-1h-1v-1h-2v-1h1v-2h1v-6h-1v-2h-1v-1h-1v-1h-1v-1h-2v-1h-6v1h-2v1h-1v1h-1v1h-1v2h-1v6h1v2h1v1h1v1h1v1h2v1h6v-1h2v-1h1v2h1v1h1v1h1v1h1v1h2v-1h1v-2h-1Zm-10-5v1h-4v-1h-2v-1h-1v-2h-1v-4h1v-2h1v-1h2v-1h4v1h2v1h1v2h1v4h-1v2h-1v1h-2Z"/></symbol>
  <!-- regular/seedlings.svg -->
  <symbol id="i-seedling" viewBox="0 0 24 24"><path d="m18,2v1h-2v1h-2v1h-1v1h-1v2h1v2h1v2h2v-1h2v-1h2v-1h1v-1h1v-2h1V2h-5Zm2,4v2h-2v1h-2v1h-1v-2h-1v-2h2v-1h2v-1h3v2h-1Z"/><path d="m12,9h-1v-1h-1v-1h-2v-1h-2v-1H1v3h1v2h1v2h1v1h1v1h2v1h4v7h2v-11h-1v-2Zm-7,3v-2h-1v-2h-1v-1h3v1h2v1h2v2h1v2h-4v-1h-2Z"/></symbol>
  <!-- regular/shapes.svg -->
  <symbol id="i-shapes" viewBox="0 0 24 24"><path d="M16,8V6H15V4H14V2H13V1H11V2H10V4H9V6H8V8H7v2H17V8ZM9,9V7h1V5h1V3h2V5h1V7h1V9Z"/><path d="M22,13V12H14v1H13v8h1v1h8V21h1V13Zm0,7H21v1H15V20H14V14h1V13h6v1h1Z"/><path d="M10,15V13H8V12H4v1H2v2H1v4H2v2H4v1H8V21h2V19h1V15Zm0,3H9v2H7v1H5V20H3V18H2V16H3V14H5V13H7v1H9v2h1Z"/></symbol>
  <!-- regular/share-alt.svg -->
  <symbol id="i-share" viewBox="0 0 24 24"><path d="M22,9V8H21V7H20V6H19V5H18V4H17V3H16V2H14V3H13V7H6V8H4V9H3v2H2v2H1v3H2v2H3v2H4v1H5v1H7V20H6V15H7V13h6v4h1v1h2V17h1V16h1V15h1V14h1V13h1V12h1V11h1V9Zm-2,2H19v1H18v1H17v1H16v1H15V11H6v1H5v3H3V13H4V11H5V10H7V9h8V5h1V6h1V7h1V8h1V9h1Z"/></symbol>
  <!-- solid/arrow-up-solid.svg -->
  <symbol id="i-shift" viewBox="0 0 24 24"><polygon points="11 1 13 1 13 2 14 2 14 3 15 3 15 4 16 4 16 5 17 5 17 6 18 6 18 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11 23 12 22 12 22 13 21 13 21 14 20 14 20 13 19 13 19 12 18 12 18 11 17 11 17 10 16 10 16 9 15 9 15 8 14 8 14 23 10 23 10 8 9 8 9 9 8 9 8 10 7 10 7 11 6 11 6 12 5 12 5 13 4 13 4 14 3 14 3 13 2 13 2 12 1 12 1 11 2 11 2 10 3 10 3 9 4 9 4 8 5 8 5 7 6 7 6 6 7 6 7 5 8 5 8 4 9 4 9 3 10 3 10 2 11 2 11 1"/></symbol>
  <!-- regular/shop.svg -->
  <symbol id="i-shop" viewBox="0 0 24 24"><polygon points="14 11 14 20 13 20 13 21 4 21 4 20 3 20 3 11 5 11 5 16 12 16 12 11 14 11"/><rect x="19" y="11" width="2" height="10"/><path d="m22,7v-1h-1v-2h-1v-1H4v1h-1v2h-1v1h-1v2h1v1h20v-1h1v-2h-1Zm-19,1v-1h1v-1h1v-1h14v1h1v1h1v1H3Z"/></symbol>
  <!-- regular/shuffle.svg -->
  <symbol id="i-shuffle" viewBox="0 0 24 24"><polygon points="8 15 9 15 9 17 8 17 8 18 7 18 7 19 1 19 1 17 7 17 7 16 8 16 8 15"/><polygon points="21 16 22 16 22 18 21 18 21 19 20 19 20 20 19 20 19 21 18 21 18 18 14 18 14 17 13 17 13 16 12 16 12 14 11 14 11 13 10 13 10 11 9 11 9 10 8 10 8 8 7 8 7 7 1 7 1 5 8 5 8 6 9 6 9 8 10 8 10 10 11 10 11 11 12 11 12 13 13 13 13 14 14 14 14 16 18 16 18 13 19 13 19 14 20 14 20 15 21 15 21 16"/><polygon points="22 5 22 7 21 7 21 8 20 8 20 9 19 9 19 10 18 10 18 7 14 7 14 8 13 8 13 9 12 9 12 7 13 7 13 6 14 6 14 5 18 5 18 2 19 2 19 3 20 3 20 4 21 4 21 5 22 5"/></symbol>
  <!-- regular/side-nav-collapse.svg -->
  <symbol id="i-sidebar-close" viewBox="0 0 24 24"><path d="M22,5V3H20V2H4V3H2V5H1V19H2v2H4v1H20V21h2V19h1V5ZM7,19H5V18H4V6H5V5H7Zm13-1H19v1H10V5h9V6h1Z"/><polygon points="18 7 18 9 17 9 17 10 16 10 16 11 15 11 15 13 16 13 16 14 17 14 17 15 18 15 18 17 16 17 16 16 15 16 15 15 14 15 14 14 13 14 13 13 12 13 12 11 13 11 13 10 14 10 14 9 15 9 15 8 16 8 16 7 18 7"/></symbol>
  <!-- regular/side-nav-expand.svg -->
  <symbol id="i-sidebar-open" viewBox="0 0 24 24"><path d="M22,5V3H20V2H4V3H2V5H1V19H2v2H4v1H20V21h2V19h1V5ZM7,19H5V18H4V6H5V5H7Zm13-1H19v1H10V5h9V6h1Z"/><polygon points="18 11 18 13 17 13 17 14 16 14 16 15 15 15 15 16 14 16 14 17 12 17 12 15 13 15 13 14 14 14 14 13 15 13 15 11 14 11 14 10 13 10 13 9 12 9 12 7 14 7 14 8 15 8 15 9 16 9 16 10 17 10 17 11 18 11"/></symbol>
  <!-- regular/sitemap.svg -->
  <symbol id="i-sitemap" viewBox="0 0 24 24"><path d="M22,17V16H21V12H20V11H13V8h2V2H9V8h2v3H4v1H3v4H2v1H1v4H2v1H6V21H7V17H6V16H5V13h6v3H10v1H9v4h1v1h4V21h1V17H14V16H13V13h6v3H18v1H17v4h1v1h4V21h1V17Zm-9,1v2H11V18Zm8,0v2H19V18ZM3,20V18H5v2ZM11,6V4h2V6Z"/></symbol>
  <!-- regular/sort.svg -->
  <symbol id="i-sort" viewBox="0 0 24 24"><path d="m19,14v-1H5v1h-1v2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-2h-1Zm-2,2h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1h10v1Z"/><path d="m19,8v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v2h1v1h14v-1h1v-2h-1Zm-2,1H7v-1h1v-1h1v-1h1v-1h1v-1h2v1h1v1h1v1h1v1h1v1Z"/></symbol>
  <!-- regular/sparkles.svg -->
  <symbol id="i-sparkles" viewBox="0 0 24 24"><polygon points="23 5 23 6 21 6 21 7 20 7 20 9 19 9 19 7 18 7 18 6 16 6 16 5 18 5 18 4 19 4 19 2 20 2 20 4 21 4 21 5 23 5"/><polygon points="23 18 23 19 21 19 21 20 20 20 20 22 19 22 19 20 18 20 18 19 16 19 16 18 18 18 18 17 19 17 19 15 20 15 20 17 21 17 21 18 23 18"/><path d="M15,11V10H13V9H12V8H11V6H10V4H8V6H7V8H6V9H5v1H3v1H1v2H3v1H5v1H6v1H7v2H8v2h2V18h1V16h1V15h1V14h2V13h2V11Zm-3,2v1H11v1H10v2H8V15H7V14H6V13H4V11H6V10H7V9H8V7h2V9h1v1h1v1h2v2Z"/></symbol>
  <!-- regular/spinner.svg -->
  <symbol id="i-spinner" viewBox="0 0 24 24"><rect x="20" y="13" width="2" height="1"/><rect x="22" y="11" width="1" height="2"/><rect x="20" y="10" width="2" height="1"/><rect x="19" y="11" width="1" height="2"/><rect x="17" y="19" width="2" height="1"/><rect x="19" y="17" width="1" height="2"/><rect x="17" y="16" width="2" height="1"/><rect x="16" y="17" width="1" height="2"/><rect x="10" y="20" width="1" height="2"/><rect x="11" y="22" width="2" height="1"/><rect x="13" y="20" width="1" height="2"/><rect x="11" y="19" width="2" height="1"/><rect x="5" y="19" width="2" height="1"/><rect x="13" y="2" width="1" height="2"/><rect x="11" y="4" width="2" height="1"/><rect x="11" y="1" width="2" height="1"/><rect x="10" y="2" width="1" height="2"/><rect x="7" y="17" width="1" height="2"/><rect x="7" y="5" width="1" height="2"/><rect x="5" y="7" width="2" height="1"/><rect x="5" y="16" width="2" height="1"/><rect x="5" y="4" width="2" height="1"/><rect x="4" y="17" width="1" height="2"/><rect x="4" y="11" width="1" height="2"/><rect x="4" y="5" width="1" height="2"/><rect x="2" y="10" width="2" height="1"/><rect x="2" y="13" width="2" height="1"/><rect x="1" y="11" width="1" height="2"/></symbol>
  <!-- regular/star.svg -->
  <symbol id="i-star" viewBox="0 0 24 24"><path d="m16,8v-2h-1v-2h-1v-2h-1v-1h-2v1h-1v2h-1v2h-1v2H1v2h1v1h1v1h1v1h1v1h1v5h-1v4h2v-1h2v-1h2v-1h2v1h2v1h2v1h2v-4h-1v-5h1v-1h1v-1h1v-1h1v-1h1v-2h-7Zm4,3h-1v1h-1v1h-1v1h-1v5h1v1h-2v-1h-2v-1h-2v1h-2v1h-2v-1h1v-5h-1v-1h-1v-1h-1v-1h-1v-1h4v-1h1v-1h1v-2h1v-2h2v2h1v2h1v1h1v1h4v1Z"/></symbol>
  <!-- authored -->
  <symbol id="i-stop" viewBox="0 0 24 24"><path d="M4 4h16v1h-16zM4 5h1v1h-1zM19 5h1v1h-1zM4 6h1v1h-1zM19 6h1v1h-1zM4 7h1v1h-1zM19 7h1v1h-1zM4 8h1v1h-1zM19 8h1v1h-1zM4 9h1v1h-1zM19 9h1v1h-1zM4 10h1v1h-1zM19 10h1v1h-1zM4 11h1v1h-1zM19 11h1v1h-1zM4 12h1v1h-1zM19 12h1v1h-1zM4 13h1v1h-1zM19 13h1v1h-1zM4 14h1v1h-1zM19 14h1v1h-1zM4 15h1v1h-1zM19 15h1v1h-1zM4 16h1v1h-1zM19 16h1v1h-1zM4 17h1v1h-1zM19 17h1v1h-1zM4 18h1v1h-1zM19 18h1v1h-1zM4 19h16v1h-16z"/></symbol>
  <!-- regular/sun.svg -->
  <symbol id="i-sun" viewBox="0 0 24 24"><path d="m21,11v-1h1v-1h1v-2h-3v-1h-2v-2h-1V1h-2v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-2v3h-1v2h-2v1H1v2h1v1h1v1h1v2h-1v1h-1v1h-1v2h3v1h2v2h1v3h2v-1h1v-1h1v-1h2v1h1v1h1v1h2v-3h1v-2h2v-1h3v-2h-1v-1h-1v-1h-1v-2h1Zm-2,2v1h1v1h1v1h-3v1h-1v1h-1v3h-1v-1h-1v-1h-1v-1h-2v1h-1v1h-1v1h-1v-3h-1v-1h-1v-1h-3v-1h1v-1h1v-1h1v-2h-1v-1h-1v-1h-1v-1h3v-1h1v-1h1v-3h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v2h1v2h1v1h3v1h-1v1h-1v1h-1v2h1Z"/><path d="m16,10v-1h-1v-1h-1v-1h-4v1h-1v1h-1v1h-1v4h1v1h1v1h1v1h4v-1h1v-1h1v-1h1v-4h-1Zm-1,4h-1v1h-4v-1h-1v-4h1v-1h4v1h1v4Z"/></symbol>
  <!-- regular/table.svg -->
  <symbol id="i-table" viewBox="0 0 24 24"><path d="m22,2v-1H2v1h-1v20h1v1h20v-1h1V2h-1Zm-9,14h8v5h-8v-5Zm0-1v-6h8v6h-8Zm0-7V3h8v5h-8Zm-2,1v6H3v-6h8Zm-8-1V3h8v5H3Zm8,8v5H3v-5h8Z"/></symbol>
  <!-- regular/tag.svg -->
  <symbol id="i-tag" viewBox="0 0 24 24"><polygon points="8 5 8 7 7 7 7 8 5 8 5 7 4 7 4 5 5 5 5 4 7 4 7 5 8 5"/><path d="m22,13v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H2v1h-1v9h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-2h-1ZM3,3h7v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1V3Z"/></symbol>
  <!-- regular/thumbsdown.svg -->
  <symbol id="i-thumbsdown" viewBox="0 0 24 24"><polygon points="6 2 6 15 2 15 2 14 1 14 1 3 2 3 2 2 6 2"/><path d="m22,12v-3h-1v-3h-1v-3h-1v-1h-7v1h-2v1h-1v1h-1v9h1v1h1v1h1v2h1v3h1v1h2v-1h1v-4h-1v-2h7v-1h1v-2h-1Zm-2,1h-6v1h-1v1h-1v-1h-1v-1h-1v-7h1v-1h2v-1h5v2h1v3h1v4Z"/></symbol>
  <!-- regular/thumbsup.svg -->
  <symbol id="i-thumbsup" viewBox="0 0 24 24"><path d="m22,10v-1h-7v-2h1V3h-1v-1h-2v1h-1v3h-1v2h-1v1h-1v1h-1v9h1v1h1v1h2v1h7v-1h1v-3h1v-3h1v-3h1v-2h-1Zm-3,5v3h-1v2h-5v-1h-2v-1h-1v-7h1v-1h1v-1h1v1h1v1h6v4h-1Z"/><polygon points="6 9 6 22 2 22 2 21 1 21 1 10 2 10 2 9 6 9"/></symbol>
  <!-- regular/times-circle.svg -->
  <symbol id="i-times-circle" viewBox="0 0 24 24"><polygon points="14 13 15 13 15 14 16 14 16 15 17 15 17 16 16 16 16 17 15 17 15 16 14 16 14 15 13 15 13 14 11 14 11 15 10 15 10 16 9 16 9 17 8 17 8 16 7 16 7 15 8 15 8 14 9 14 9 13 10 13 10 11 9 11 9 10 8 10 8 9 7 9 7 8 8 8 8 7 9 7 9 8 10 8 10 9 11 9 11 10 13 10 13 9 14 9 14 8 15 8 15 7 16 7 16 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 13"/><path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-1,6h-1v2h-1v2h-2v1h-2v1h-6v-1h-2v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v-1h2v-1h6v1h2v1h2v2h1v2h1v6Z"/></symbol>
  <!-- regular/translate.svg -->
  <symbol id="i-translate" viewBox="0 0 24 24"><rect x="11" y="22" width="11" height="1"/><rect x="22" y="10" width="1" height="12"/><rect x="11" y="9" width="11" height="1"/><polygon points="22 5 22 6 21 6 21 7 20 7 20 8 18 8 18 7 17 7 17 6 16 6 16 5 18 5 18 4 17 4 17 3 16 3 16 2 19 2 19 3 20 3 20 5 22 5"/><path d="m20,16v-2h-1v-1h-1v-1h-1v-1h-1v1h-1v1h-1v1h-1v2h-1v5h2v-3h5v3h2v-5h-1Zm-1,1h-5v-1h1v-2h3v2h1v1Z"/><rect x="10" y="10" width="1" height="12"/><rect x="13" y="2" width="1" height="6"/><rect x="2" y="1" width="11" height="1"/><rect x="1" y="2" width="1" height="12"/><rect x="2" y="14" width="7" height="1"/><path d="m12,4v-1H3v1h4v2h-1v-1h-2v1h-1v4h1v1h2v-1h1v3h1v-5h1v-1h2v1h1v-2h-1v-1h-2v1h-1v-2h4Zm-5,4h-1v1h-2v-2h3v1Z"/><polygon points="6 19 6 20 7 20 7 21 8 21 8 22 5 22 5 21 4 21 4 19 2 19 2 18 3 18 3 17 4 17 4 16 6 16 6 17 7 17 7 18 8 18 8 19 6 19"/></symbol>
  <!-- regular/trash.svg -->
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="m4,6v8h1v8h1v1h12v-1h1v-8h1V6H4Zm14,7h-1v8H7v-8h-1v-5h12v5Z"/><polygon points="21 3 21 5 3 5 3 3 4 3 4 2 9 2 9 1 15 1 15 2 20 2 20 3 21 3"/></symbol>
  <!-- regular/trending.svg -->
  <symbol id="i-trending" viewBox="0 0 24 24"><polygon points="23 5 23 14 22 14 22 13 21 13 21 12 20 12 20 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 12 17 12 18 10 18 10 17 9 17 9 16 8 16 8 15 7 15 7 14 5 14 5 15 4 15 4 16 3 16 3 17 1 17 1 15 2 15 2 14 3 14 3 13 4 13 4 12 5 12 5 11 7 11 7 12 8 12 8 13 9 13 9 14 10 14 10 15 12 15 12 14 13 14 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 8 16 8 16 7 15 7 15 6 14 6 14 5 23 5"/></symbol>
  <!-- solid/angle-down-solid.svg -->
  <symbol id="i-tri-d" viewBox="0 0 24 24"><polygon points="5 7 7 7 7 8 8 8 8 9 9 9 9 10 10 10 10 11 11 11 11 12 13 12 13 11 14 11 14 10 15 10 15 9 16 9 16 8 17 8 17 7 19 7 19 8 20 8 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 12 6 12 6 11 5 11 5 10 4 10 4 8 5 8 5 7"/></symbol>
  <!-- solid/angle-left-solid.svg -->
  <symbol id="i-tri-l" viewBox="0 0 24 24"><polygon points="17 5 17 7 16 7 16 8 15 8 15 9 14 9 14 10 13 10 13 11 12 11 12 13 13 13 13 14 14 14 14 15 15 15 15 16 16 16 16 17 17 17 17 19 16 19 16 20 14 20 14 19 13 19 13 18 12 18 12 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 11 8 11 8 10 9 10 9 9 10 9 10 8 11 8 11 7 12 7 12 6 13 6 13 5 14 5 14 4 16 4 16 5 17 5"/></symbol>
  <!-- solid/angle-right-solid.svg -->
  <symbol id="i-tri-r" viewBox="0 0 24 24"><polygon points="7 19 7 17 8 17 8 16 9 16 9 15 10 15 10 14 11 14 11 13 12 13 12 11 11 11 11 10 10 10 10 9 9 9 9 8 8 8 8 7 7 7 7 5 8 5 8 4 10 4 10 5 11 5 11 6 12 6 12 7 13 7 13 8 14 8 14 9 15 9 15 10 16 10 16 11 17 11 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 12 17 12 18 11 18 11 19 10 19 10 20 8 20 8 19 7 19"/></symbol>
  <!-- solid/angle-up-solid.svg -->
  <symbol id="i-tri-u" viewBox="0 0 24 24"><polygon points="19 17 17 17 17 16 16 16 16 15 15 15 15 14 14 14 14 13 13 13 13 12 11 12 11 13 10 13 10 14 9 14 9 15 8 15 8 16 7 16 7 17 5 17 5 16 4 16 4 14 5 14 5 13 6 13 6 12 7 12 7 11 8 11 8 10 9 10 9 9 10 9 10 8 11 8 11 7 13 7 13 8 14 8 14 9 15 9 15 10 16 10 16 11 17 11 17 12 18 12 18 13 19 13 19 14 20 14 20 16 19 16 19 17"/></symbol>
  <!-- regular/trophy.svg -->
  <symbol id="i-trophy" viewBox="0 0 24 24"><path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5Zm-10,9h-2v-1h-1v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1Zm0-4v-5h8v5h-1v3h-1v2h-4v-2h-1v-3h-1Zm12,0v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3h-1Z"/></symbol>
  <!-- regular/underline.svg -->
  <symbol id="i-underline" viewBox="0 0 24 24"><polygon points="22 1 22 16 21 16 21 18 20 18 20 20 19 20 19 21 17 21 17 22 15 22 15 23 9 23 9 22 7 22 7 21 5 21 5 20 4 20 4 18 3 18 3 16 2 16 2 1 4 1 4 16 5 16 5 18 6 18 6 19 7 19 7 20 9 20 9 21 15 21 15 20 17 20 17 19 18 19 18 18 19 18 19 16 20 16 20 1 22 1"/></symbol>
  <!-- regular/unlock.svg -->
  <symbol id="i-unlock" viewBox="0 0 24 24"><path d="m21,12v-1h-13v-6h1v-1h1v-1h4v1h1v1h1v4h2v-4h-1v-2h-1v-1h-2v-1h-4v1h-2v1h-1v2h-1v6h-3v1h-1v10h1v1h18v-1h1v-10h-1Zm-1,9H4v-8h16v8Z"/></symbol>
  <!-- regular/upload.svg -->
  <symbol id="i-upload" viewBox="0 0 24 24"><polygon points="4 10 4 8 5 8 5 7 6 7 6 6 7 6 7 5 8 5 8 4 9 4 9 3 10 3 10 2 11 2 11 1 13 1 13 2 14 2 14 3 15 3 15 4 16 4 16 5 17 5 17 6 18 6 18 7 19 7 19 8 20 8 20 10 18 10 18 9 17 9 17 8 16 8 16 7 15 7 15 6 14 6 14 5 13 5 13 17 11 17 11 5 10 5 10 6 9 6 9 7 8 7 8 8 7 8 7 9 6 9 6 10 4 10"/><rect x="2" y="20" width="20" height="3"/></symbol>
  <!-- regular/user.svg -->
  <symbol id="i-user" viewBox="0 0 24 24"><path d="m17,5v-2h-1v-1h-2v-1h-4v1h-2v1h-1v2h-1v4h1v2h1v1h2v1h4v-1h2v-1h1v-2h1v-4h-1Zm-2,4v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1v-1h4v1h1v1h1v4h-1Z"/><path d="m21,19v-1h-1v-1h-1v-1h-2v-1H7v1h-2v1h-1v1h-1v1h-1v3h1v1h18v-1h1v-3h-1Zm-16,0v-1h2v-1h10v1h2v1h1v2H4v-2h1Z"/></symbol>
  <!-- regular/user-check.svg -->
  <symbol id="i-user-check" viewBox="0 0 24 24"><path d="m15,16v-1h-1v-1h-1v-1h-2v1h-5v-1h-2v1h-1v1h-1v1h-1v4h1v1h13v-1h1v-4h-1Zm-1,3H3v-3h1v-1h2v1h5v-1h2v1h1v3Z"/><polygon points="23 9 23 10 22 10 22 11 21 11 21 12 20 12 20 13 19 13 19 14 17 14 17 13 16 13 16 12 15 12 15 11 16 11 16 10 17 10 17 11 19 11 19 10 20 10 20 9 21 9 21 8 22 8 22 9 23 9"/><path d="m12,6v-2h-2v-1h-3v1h-2v2h-1v3h1v2h2v1h3v-1h2v-2h1v-3h-1Zm-2,3v1h-3v-1h-1v-3h1v-1h3v1h1v3h-1Z"/></symbol>
  <!-- regular/user-plus.svg -->
  <symbol id="i-user-plus" viewBox="0 0 24 24"><polygon points="11 20 12 20 12 21 2 21 2 20 1 20 1 17 2 17 2 16 3 16 3 15 4 15 4 14 11 14 11 15 10 15 10 16 4 16 4 17 3 17 3 19 11 19 11 20"/><path d="M22,15V13H21V12H19V11H16v1H14v1H13v2H12v3h1v2h1v1h2v1h3V21h2V20h1V18h1V15Zm-4,2v2H17V17H15V16h2V14h1v2h2v1Z"/><path d="M12,5V4H11V3H6V4H5V5H4v5H5v1H6v1h5V11h1V10h1V5ZM10,9v1H7V9H6V6H7V5h3V6h1V9Z"/></symbol>
  <!-- regular/users.svg -->
  <symbol id="i-users" viewBox="0 0 24 24"><path d="m19,18v-1h-1v-1h-2v-1h-8v1h-2v1h-1v1h-1v3h1v1h14v-1h1v-3h-1Zm-11,0v-1h8v1h2v2H6v-2h2Z"/><path d="m15,7v-1h-1v-1h-4v1h-1v1h-1v4h1v1h1v1h4v-1h1v-1h1v-4h-1Zm-5,4v-4h4v4h-4Z"/><polygon points="7 5 8 5 8 6 7 6 7 8 5 8 5 7 4 7 4 5 5 5 5 4 7 4 7 5"/><polygon points="7 12 8 12 8 13 2 13 2 12 1 12 1 10 2 10 2 9 7 9 7 12"/><polygon points="17 6 16 6 16 5 17 5 17 4 19 4 19 5 20 5 20 7 19 7 19 8 17 8 17 6"/><polygon points="23 10 23 12 22 12 22 13 16 13 16 12 17 12 17 9 22 9 22 10 23 10"/></symbol>
  <!-- regular/video-camera.svg -->
  <symbol id="i-video" viewBox="0 0 24 24"><polygon points="23 7 23 17 22 17 22 18 21 18 21 17 20 17 20 16 19 16 19 15 18 15 18 9 19 9 19 8 20 8 20 7 21 7 21 6 22 6 22 7 23 7"/><path d="M15,7V5H3V6H2V7H1V17H2v1H3v1H15V17h1V7Zm-1,9H13v1H4V16H3V8H4V7h9V8h1Z"/></symbol>
  <!-- regular/sound-on.svg -->
  <symbol id="i-volume" viewBox="0 0 24 24"><polygon points="17 15 17 14 16 14 16 13 17 13 17 11 16 11 16 10 17 10 17 9 18 9 18 10 19 10 19 14 18 14 18 15 17 15"/><polygon points="23 10 23 14 22 14 22 16 21 16 21 17 20 17 20 18 19 18 19 17 18 17 18 16 19 16 19 15 20 15 20 14 21 14 21 10 20 10 20 9 19 9 19 8 18 8 18 7 19 7 19 6 20 6 20 7 21 7 21 8 22 8 22 10 23 10"/><path d="m11,2v1h-1v1h-1v1h-1v1h-1v1h-1v1H1v8h5v1h1v1h1v1h1v1h1v1h1v1h3V2h-3Zm1,17h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H3v-4h4v-1h1v-1h1v-1h1v-1h1v-1h1v14Z"/></symbol>
  <!-- regular/wallet.svg -->
  <symbol id="i-wallet" viewBox="0 0 24 24"><polygon points="18 12 18 13 19 13 19 15 18 15 18 16 16 16 16 15 15 15 15 13 16 13 16 12 18 12"/><polygon points="23 8 23 21 22 21 22 22 2 22 2 21 1 21 1 3 2 3 2 2 21 2 21 3 22 3 22 4 3 4 3 20 21 20 21 9 5 9 5 7 22 7 22 8 23 8"/></symbol>
  <!-- solid/clock-solid.svg -->
  <symbol id="i-watch" viewBox="0 0 24 24"><path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-9,7v-1h-1v-1h-1V5h2v8h1v1h1v1h1v1h-1v1h-1v-1h-1Z"/></symbol>
  <!-- authored -->
  <symbol id="i-wave" viewBox="0 0 24 24"><path d="M10 3h3v1h-3zM10 4h3v1h-3zM10 5h3v1h-3zM6 6h3v1h-3zM10 6h3v1h-3zM14 6h3v1h-3zM6 7h3v1h-3zM10 7h3v1h-3zM14 7h3v1h-3zM6 8h3v1h-3zM10 8h3v1h-3zM14 8h3v1h-3zM2 9h3v1h-3zM6 9h3v1h-3zM10 9h3v1h-3zM14 9h3v1h-3zM18 9h3v1h-3zM2 10h3v1h-3zM6 10h3v1h-3zM10 10h3v1h-3zM14 10h3v1h-3zM18 10h3v1h-3zM2 11h3v1h-3zM6 11h3v1h-3zM10 11h3v1h-3zM14 11h3v1h-3zM18 11h3v1h-3zM2 12h3v1h-3zM6 12h3v1h-3zM10 12h3v1h-3zM14 12h3v1h-3zM18 12h3v1h-3zM2 13h3v1h-3zM6 13h3v1h-3zM10 13h3v1h-3zM14 13h3v1h-3zM18 13h3v1h-3zM2 14h3v1h-3zM6 14h3v1h-3zM10 14h3v1h-3zM14 14h3v1h-3zM18 14h3v1h-3zM6 15h3v1h-3zM10 15h3v1h-3zM14 15h3v1h-3zM6 16h3v1h-3zM10 16h3v1h-3zM14 16h3v1h-3zM6 17h3v1h-3zM10 17h3v1h-3zM14 17h3v1h-3zM10 18h3v1h-3zM10 19h3v1h-3zM10 20h3v1h-3z"/></symbol>
  <!-- regular/window-restore.svg -->
  <symbol id="i-window" viewBox="0 0 24 24"><polygon points="23 2 23 18 22 18 22 19 20 19 20 17 21 17 21 3 7 3 7 4 5 4 5 2 6 2 6 1 22 1 22 2 23 2"/><path d="M18,6V5H2V6H1V22H2v1H18V22h1V6ZM3,21V7H17V21Z"/></symbol>
  <!-- regular/times.svg -->
  <symbol id="i-x-small" viewBox="0 0 24 24"><polygon points="14 13 15 13 15 14 16 14 16 15 17 15 17 16 18 16 18 17 19 17 19 18 20 18 20 19 21 19 21 20 22 20 22 21 21 21 21 22 20 22 20 21 19 21 19 20 18 20 18 19 17 19 17 18 16 18 16 17 15 17 15 16 14 16 14 15 13 15 13 14 11 14 11 15 10 15 10 16 9 16 9 17 8 17 8 18 7 18 7 19 6 19 6 20 5 20 5 21 4 21 4 22 3 22 3 21 2 21 2 20 3 20 3 19 4 19 4 18 5 18 5 17 6 17 6 16 7 16 7 15 8 15 8 14 9 14 9 13 10 13 10 11 9 11 9 10 8 10 8 9 7 9 7 8 6 8 6 7 5 7 5 6 4 6 4 5 3 5 3 4 2 4 2 3 3 3 3 2 4 2 4 3 5 3 5 4 6 4 6 5 7 5 7 6 8 6 8 7 9 7 9 8 10 8 10 9 11 9 11 10 13 10 13 9 14 9 14 8 15 8 15 7 16 7 16 6 17 6 17 5 18 5 18 4 19 4 19 3 20 3 20 2 21 2 21 3 22 3 22 4 21 4 21 5 20 5 20 6 19 6 19 7 18 7 18 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 13"/></symbol>
  <!-- regular/expand.svg -->
  <symbol id="i-zoom" viewBox="0 0 24 24"><polygon points="9 1 9 3 3 3 3 9 1 9 1 2 2 2 2 1 9 1"/><polygon points="9 21 9 23 2 23 2 22 1 22 1 15 3 15 3 21 9 21"/><polygon points="23 15 23 22 22 22 22 23 15 23 15 21 21 21 21 15 23 15"/><polygon points="23 2 23 9 21 9 21 3 15 3 15 1 22 1 22 2 23 2"/></symbol>
</svg>`;

  function inject() {
    if (document.getElementById("ps-icon-sprite")) { return; }
    var holder = document.createElement("div");
    holder.id = "ps-icon-sprite";
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    holder.innerHTML = SPRITE;
    document.body.insertBefore(holder, document.body.firstChild);
  }

  function names() {
    return SPRITE.match(/id="i-[^"]+"/g).map(function (s) { return s.slice(4, -1); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  root.PSIcons = { inject: inject, names: names };
})(typeof window !== "undefined" ? window : globalThis);
