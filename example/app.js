// TiVerticalSegmentedControl: Classic counterpart of example/alloy/app/.
// Requires ti.verticalsegmentedcontrol 0.1.1 and ti.map on iOS 27+.
var Vertical = require('ti.verticalsegmentedcontrol');
var MapModule = require('ti.map');
var updatingMode = true;
var closed = false;
var closing = false;
var controlsEnabled = true;
var tintIndex = -1;
var iconPaletteIndex = 0;
var listeners = [];
var items = [
  { id: 'explore', title: 'Explore', systemImage: 'map.fill' },
  { id: 'driving', title: 'Driving', systemImage: 'car.fill' },
  { id: 'satellite', title: 'Satellite', systemImage: 'globe.americas.fill' }
];
var tints = [
  { name: 'blue', color: '#007AFF' },
  { name: 'red', color: '#FF3B30' },
  { name: 'black', color: '#000000' },
  { name: 'white', color: '#FFFFFF' }
];
var light = Ti.UI.userInterfaceStyle === 1;
var textColor = light ? '#24372F' : '#EAF3ED';
var ui = {};
ui.gallery = Ti.UI.createWindow({ title: 'Vertical Segmented Control', backgroundColor: light ? '#F3F6F1' : '#111A17' });
ui.navigation = Ti.UI.createNavigationWindow({ window: ui.gallery, backgroundColor: ui.gallery.backgroundColor });
ui.closeButton = Ti.UI.createButton({ title: 'Close' });
ui.gallery.leftNavButton = ui.closeButton;
ui.scroll = Ti.UI.createScrollView({ layout: 'vertical', contentHeight: Ti.UI.SIZE, contentWidth: Ti.UI.FILL, showVerticalScrollIndicator: true });
ui.gallery.add(ui.scroll);
ui.intro = Ti.UI.createLabel({
  text: 'TiVerticalSegmentedControl · native and customizable glass. Tap or drag a control to change its selection.',
  top: 20, left: 20, right: 20, height: Ti.UI.SIZE, font: { fontSize: 15 }, color: textColor
});
ui.preview = Ti.UI.createView({ top: 20, left: 20, right: 20, height: 260, borderRadius: 20, backgroundColor: light ? '#DCE9DE' : '#263D33' });
ui.map = MapModule.createView({
  top: 0, bottom: 0, left: 0, right: 0, zIndex: 0, borderRadius: 20,
  region: { latitude: 37.334606, longitude: -122.009102, latitudeDelta: 0.012, longitudeDelta: 0.012 },
  mapType: MapModule.NORMAL_TYPE, userLocation: false
});
ui.preview.add(ui.map);
function caption(text, side) {
  var properties = { text: text, zIndex: 1, top: 18, width: 100, height: Ti.UI.SIZE,
    textAlign: 'center', font: { fontSize: 15, fontWeight: 'bold' },
    backgroundColor: '#CCFFFFFF', color: '#24372F', borderRadius: 8, touchEnabled: false };
  properties[side] = 20;
  return Ti.UI.createLabel(properties);
}
ui.nativeCaption = caption('Native', 'left');
ui.customCaption = caption('Custom', 'right');
ui.nativeControl = Vertical.createView({
  left: 45, top: 55, width: 60, height: Ti.UI.SIZE, segmentHeight: 60, pointSize: 18, zIndex: 1,
  items: items, style: Vertical.STYLE_NATIVE, selectedIndex: 0,
  iconTintColor: light ? '#000000' : '#FFFFFF', activeIconTintColor: light ? '#007AFF' : '#FFFFFF'
});
ui.customControl = Vertical.createView({
  right: 45, top: 55, width: 60, height: Ti.UI.SIZE, segmentHeight: 60, pointSize: 18, zIndex: 1,
  items: items, style: Vertical.STYLE_CUSTOM, selectedIndex: 0,
  iconTintColor: light ? '#000000' : '#FFFFFF', activeIconTintColor: light ? '#007AFF' : '#FFFFFF',
  selectionTintColor: light ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'
});
[ui.nativeCaption, ui.customCaption, ui.nativeControl, ui.customControl].forEach(function (view) { ui.preview.add(view); });
function statusLabel() {
  return Ti.UI.createLabel({ top: 14, left: 20, right: 20, height: Ti.UI.SIZE, font: { fontSize: 14 }, color: textColor });
}
function actionButton(title) { return Ti.UI.createButton({ title: title, top: 10, height: 44 }); }
ui.nativeStatus = statusLabel();
ui.customStatus = statusLabel();
ui.nextButton = actionButton('Select next on both');
ui.tintButton = actionButton('Custom tint: default');
ui.iconTintButton = actionButton('Icons: ' + (light ? 'black / blue' : 'white / white'));
ui.enabledButton = actionButton('Controls: enabled');
ui.details = Ti.UI.createLabel({
  text: 'Explore shows the standard map, Driving uses muted roads, and Satellite shows imagery with labels. Both controls follow the same map mode. Close and reopen this component to reset it.',
  top: 20, left: 20, right: 20, bottom: 28, height: Ti.UI.SIZE, font: { fontSize: 13 }, color: textColor
});
[ui.intro, ui.preview, ui.nativeStatus, ui.customStatus, ui.nextButton, ui.tintButton, ui.iconTintButton, ui.enabledButton, ui.details].forEach(function (view) { ui.scroll.add(view); });

function applyMapMode(index, reason) {
	if (closed || updatingMode || index < 0 || index >= items.length) return;
	updatingMode = true;
	try {
		var types = [MapModule.NORMAL_TYPE, MapModule.MUTED_STANDARD_TYPE, MapModule.HYBRID_FLYOVER_TYPE];
		ui.map.mapType = types[index];
		ui.nativeControl.selectedIndex = index;
		ui.customControl.selectedIndex = index;
		ui.nativeStatus.text = 'Native: ' + items[index].title + ' · ' + reason;
		ui.customStatus.text = 'Custom: ' + items[index].title + ' · ' + reason;
	} finally {
		updatingMode = false;
	}
}
function nativeChanged(event) {
	applyMapMode(event.index, event.reason);
}
function customChanged(event) {
	applyMapMode(event.index, event.reason);
}
function selectNext() {
	if (closed) return;
	applyMapMode((ui.nativeControl.selectedIndex + 1) % items.length, 'programmatic');
}
function changeTint() {
	if (closed) return;
	tintIndex = (tintIndex + 1) % tints.length;
	ui.customControl.selectionTintColor = tints[tintIndex].color;
	ui.tintButton.title = 'Custom tint: ' + tints[tintIndex].name;
}
function changeIconColors() {
	if (closed) return;
	iconPaletteIndex = (iconPaletteIndex + 1) % 3;
	var colors = [
		{ normal: Ti.UI.userInterfaceStyle === 1 ? '#000000' : '#FFFFFF', active: Ti.UI.userInterfaceStyle === 1 ? '#007AFF' : '#FFFFFF', title: light ? 'black / blue' : 'white / white' },
		{ normal: '#8E44AD', active: '#008040', title: 'purple / green' },
		{ normal: null, active: null, title: 'system default' }
	][iconPaletteIndex];
	[ui.nativeControl, ui.customControl].forEach(function (control) {
		control.applyProperties({ iconTintColor: colors.normal, activeIconTintColor: colors.active });
	});
	ui.iconTintButton.title = 'Icons: ' + colors.title;
}
function toggleEnabled() {
	if (closed) return;
	controlsEnabled = !controlsEnabled;
	ui.nativeControl.enabled = controlsEnabled;
	ui.customControl.enabled = controlsEnabled;
	ui.enabledButton.title = 'Controls: ' + (controlsEnabled ? 'enabled' : 'disabled');
}
function closeProject() {
	if (closed || closing) return;
	closing = true;
	ui.navigation.close();
}
function onProjectClosed(event) {
  if (event.source !== ui.navigation || closed) return;
  closed = true;
  listeners.forEach(function (listener) { listener.view.removeEventListener(listener.name, listener.callback); });
  listeners = null;
  ui.preview.remove(ui.map);
  Object.keys(ui).forEach(function (key) { ui[key] = null; });
  ui = null;
  items = tints = MapModule = Vertical = null;
}
function listen(view, name, callback) {
  view.addEventListener(name, callback);
  listeners.push({ view: view, name: name, callback: callback });
}
listen(ui.nativeControl, 'change', nativeChanged);
listen(ui.customControl, 'change', customChanged);
listen(ui.nextButton, 'click', selectNext);
listen(ui.tintButton, 'click', changeTint);
listen(ui.iconTintButton, 'click', changeIconColors);
listen(ui.enabledButton, 'click', toggleEnabled);
listen(ui.closeButton, 'click', closeProject);
listen(ui.navigation, 'close', onProjectClosed);
updatingMode = false;
applyMapMode(0, 'initial');
ui.navigation.open();
