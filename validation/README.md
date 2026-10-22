# Validation

Validated with Xcode 27.1 beta (27A9269), Titanium SDK 13.4.1.GA, and the iPhone 18 Pro simulator running iOS 27.0.

- Titanium module distribution build passed for device arm64 and simulator arm64/x86_64.
- Standalone Classic consuming-app build and module loading passed.
- 17 live JavaScript-to-native bridge checks passed. They cover constants, creation-order-independent selection, defaults, `Ti.UI.SIZE`, programmatic events, repeated selection, invalid index/size/style handling, item reorder/removal, duplicate IDs, invalid symbols, style changes, and empty items.
- Simulator taps on the native and custom controls produced `change` events with `reason: 'user'`. The demo's next button produced `reason: 'programmatic'`.
- Alloy example compiled successfully and its generated controller calls `require('ti.verticalsegmentedcontrol').createView` for both styles. A full Alloy consuming-app run has not been performed.

Physical-device interaction, VoiceOver, exact animation matching, drag tracking and all accessibility/appearance combinations remain unverified. The custom-style internal background-view workaround is documented in the main README.

## Reproduce

1. Build the module from `ios/` using the main README command.
2. Extract `ios/dist/ti.verticalsegmentedcontrol-iphone-0.1.1.zip` into `validation/VerticalSegmentedDemo/`. Its `modules/iphone/...` tree is app-local; no global installation is needed.
3. Build the demo with the installed simulator's actual UUID:

```sh
DEVELOPER_DIR=/Applications/Xcode-27.1-Beta.app/Contents/Developer \
  ti build -p ios -T simulator --project-dir "$PWD/validation/VerticalSegmentedDemo" \
  --sdk 13.4.1.GA --device-id '<simulator UUID>' --no-prompt --no-banner
```

The demo reports the check count near the bottom. Test code is in `VerticalSegmentedDemo/Resources/bridgeChecks.js`. Tests run before manual interactions; their view is removed afterward. Generated build products and app-local module installations are ignored by Git.

To check the Alloy fragments in isolation, copy `example/alloy/app/` into a temporary Titanium app and run `alloy compile <project-dir> --config platform=ios`.

## 0.1.1 icon colors

The isolated simulator app passed the same 17 bridge checks. Its `renderChecks.js` then captured the actual native controls with `toImage()` at seven stages: creation, live color changes, selected-color inheritance, reset to system colors, selected-only color, changed selection, and style changes. `check_tint_snapshots.py` checked the icon pixels in all 14 snapshots: 42 segment-color checks passed. Evidence is in `tint-snapshots-0.1.1/`, including `pixel-checks.json`. These are native-view snapshots, not touch-driven or physical-device proof.

AlloyTestApp was built with app-local 0.1.1. It keeps the existing orange icon color, adds blue selected icons, and has an Icons button to change or clear both tints. Device Hub screen capture was unavailable during this run.

## Example refresh from AlloyTestApp

The bundled Alloy and Classic examples now use the current AlloyTestApp component as their reference, including its 60-point controls, map modes, adaptive initial colors, tint cycling, enabled-state controls, and explicit cleanup. Standalone navigation uses a Close button. Icon-color button captions match the actual appearance-based values. Setup instructions identify ti.map 7.6.0 as an example dependency.

The updated Alloy source compiled, and a standalone Classic consuming app built with iOS 27, Xcode 27.1 beta and Titanium SDK 13.4.1.GA. No new runtime interactions were exercised for this example-only refresh. The existing 0.1.1 ZIP was refreshed with the new examples/documentation; all 36 native framework files were hash-compared and remained unchanged. See `example-update-results.json`. No app-local or global module installation was replaced.
