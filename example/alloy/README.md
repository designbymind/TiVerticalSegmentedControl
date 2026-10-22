# Alloy map-backed demo

Copy `app/views/index.xml`, `app/styles/index.tss`, and `app/controllers/index.js` into an iOS Alloy app. The controller opens its own NavigationWindow and supports an optional `onClose` callback when used as a child controller.

Requires `ti.verticalsegmentedcontrol` 0.1.1, `ti.map` (validated with 7.6.0), iOS 27+, and Titanium SDK 13.4.1.GA+. See `../README.md` for the module entries and setup instructions.

The demo reproduces AlloyTestApp's map overlay, synchronized selection, appearance colors, live selection/icon tint controls, and enabled-state toggle. The Classic equivalent is `../app.js`.
