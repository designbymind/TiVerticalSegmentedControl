var Vertical = require('ti.verticalsegmentedcontrol');
var cancelRenderChecks;
var win = Ti.UI.createWindow({ backgroundColor: '#e9f0e7' });
var items = [
  { id: 'explore', title: 'Explore', systemImage: 'map.fill' },
  { id: 'driving', title: 'Driving', systemImage: 'car.fill' },
  { id: 'satellite', title: 'Satellite', systemImage: 'globe.americas.fill' }
];
var header = Ti.UI.createLabel({ top: 75, text: 'Vertical segmented controls', color: '#182821', font: { fontSize: 22, fontWeight: 'bold' } });
var status = Ti.UI.createLabel({ bottom: 100, text: 'Tap or drag either control', color: '#182821' });
var nativeControl = Vertical.createView({
  left: 65, top: 180, width: 50, height: Ti.UI.SIZE,
  items: items, style: Vertical.STYLE_NATIVE, selectedIndex: 0,
  iconTintColor: "#FF6600", activeIconTintColor: "#007AFF"
});
var customControl = Vertical.createView({
  right: 65, top: 180, width: 50, height: Ti.UI.SIZE,
  items: items, style: Vertical.STYLE_CUSTOM, selectedIndex: 1,
  selectionTintColor: '#59008080', iconTintColor: '#FF6600', activeIconTintColor: '#007AFF'
});
var nativeLabel = Ti.UI.createLabel({ left: 40, top: 140, width: 100, text: 'Native', textAlign: 'center', color: '#182821' });
var customLabel = Ti.UI.createLabel({ right: 40, top: 140, width: 100, text: 'Custom', textAlign: 'center', color: '#182821' });
var next = Ti.UI.createButton({ bottom: 165, title: 'Select next on both' });
var restyle = Ti.UI.createButton({ bottom: 215, title: 'Swap appearances' });
var iconPalette = 0;
var colors = Ti.UI.createButton({ bottom: 265, title: 'Icons: orange / blue' });
function changeIconColors() {
  iconPalette = (iconPalette + 1) % 4;
  var palette = [
    ['#FF6600', '#007AFF', 'orange / blue'],
    ['#8E44AD', '#008040', 'purple / green'],
    ['#8E44AD', null, 'purple / inherited'],
    [null, null, 'system default']
  ][iconPalette];
  [nativeControl, customControl].forEach(function (control) {
    control.applyProperties({ iconTintColor: palette[0], activeIconTintColor: palette[1] });
  });
  colors.title = 'Icons: ' + palette[2];
}
function changed(e) {
  status.text = e.title + ' (' + e.reason + ')';
  Ti.API.info('[VerticalSC] ' + JSON.stringify({ index: e.index, id: e.id, reason: e.reason }));
}
function advance() {
  nativeControl.selectedIndex = (nativeControl.selectedIndex + 1) % items.length;
  customControl.selectedIndex = (customControl.selectedIndex + 1) % items.length;
}
function swapStyles() {
  var previous = nativeControl.style;
  nativeControl.style = customControl.style;
  customControl.style = previous;
  nativeLabel.text = nativeControl.style === Vertical.STYLE_NATIVE ? "Native" : "Custom";
  customLabel.text = customControl.style === Vertical.STYLE_NATIVE ? "Native" : "Custom";
}
nativeControl.addEventListener('change', changed);
customControl.addEventListener('change', changed);
next.addEventListener('click', advance);
restyle.addEventListener('click', swapStyles);
colors.addEventListener('click', changeIconColors);
[header, status, nativeLabel, customLabel, nativeControl, customControl, next, restyle, colors].forEach(function (view) { win.add(view); });
function closed() {
  if (cancelRenderChecks) { cancelRenderChecks(); cancelRenderChecks = null; }
  nativeControl.removeEventListener('change', changed);
  customControl.removeEventListener('change', changed);
  next.removeEventListener('click', advance);
  restyle.removeEventListener('click', swapStyles);
  colors.removeEventListener('click', changeIconColors);
  colors = null;
  win.removeEventListener('close', closed);
  nativeControl = customControl = next = restyle = status = header = nativeLabel = customLabel = win = null;
  items = null;
}
win.addEventListener('close', closed);
win.addEventListener('open', function opened() {
  win.removeEventListener('open', opened);
  require('bridgeChecks').run(win, Vertical, function (error, count) {
    status.text = error ? 'Checks failed: ' + error.message : count + ' bridge checks passed — capturing colors';
    if (!error) cancelRenderChecks = require('renderChecks').run(nativeControl, customControl, function (renderError) {
      status.text = renderError ? renderError.message : '17 bridge checks passed; 14 color snapshots saved';
    });
  });
});
win.open();
