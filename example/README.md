# Map-backed examples

Both examples match the Vertical Segmented Control component in AlloyTestApp:

- A Ti.Map background with native and custom controls layered above it.
- Shared selection: Explore (`NORMAL_TYPE`), Driving (`MUTED_STANDARD_TYPE`), Satellite (`HYBRID_FLYOVER_TYPE`).
- Appearance-based icon colors and custom selection tint.
- Buttons for programmatic selection, selection tint, normal/active icon colors, resetting icon colors, and enabling/disabling the controls.
- Explicit listener and map cleanup when closing.

Use iOS 27+, Titanium SDK 13.4.1.GA+, `ti.verticalsegmentedcontrol` 0.1.1, and `ti.map` (validated with 7.6.0). The map demo uses Apple Park coordinates and does not request the user's location.

Merge these entries into your application's existing `tiapp.xml` sections:

```xml
<modules>
    <module platform="iphone" version="0.1.1">ti.verticalsegmentedcontrol</module>
    <module platform="iphone" version="7.6.0">ti.map</module>
</modules>
<ios>
    <min-ios-ver>27.0</min-ios-ver>
</ios>
```

Install both modules using your normal Titanium module workflow. Ti.Map is a dependency of these examples; the segmented-control module itself does not require it.

## Classic

Copy `app.js` to an iOS Classic app's `Resources/app.js`. The file creates and opens its own NavigationWindow and has no Alloy dependency.

## Alloy

Copy the three files under `alloy/app/` into the matching `app/controllers/`, `app/views/`, and `app/styles/` directories of an iOS Alloy app. The index controller opens its own NavigationWindow. For use as a child controller, it also accepts an optional `onClose` callback, matching AlloyTestApp's component lifecycle.
