var projectArgs = arguments[0] || {};
var MapModule = require('ti.map');
var updatingMode = true;
var closed = false;
var closing = false;
var controlsEnabled = true;
var tintIndex = -1;
var iconPaletteIndex = 0;
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
$.gallery.backgroundColor = light ? '#F3F6F1' : '#111A17';
$.navigation.backgroundColor = $.gallery.backgroundColor;
$.preview.backgroundColor = light ? '#DCE9DE' : '#263D33';
[$.intro, $.nativeStatus, $.customStatus, $.details].forEach(function (label) {
	label.color = textColor;
});
$.map.applyProperties({
	region: { latitude: 37.334606, longitude: -122.009102, latitudeDelta: 0.012, longitudeDelta: 0.012 },
	mapType: MapModule.NORMAL_TYPE,
	userLocation: false
});
$.nativeControl.applyProperties({ items: items, style: 'native', iconTintColor: Ti.UI.userInterfaceStyle === 1 ? '#000000' : '#FFFFFF', activeIconTintColor: Ti.UI.userInterfaceStyle === 1 ? '#007AFF' : '#FFFFFF', selectedIndex: 0 });
$.customControl.applyProperties({ items: items, style: 'custom', iconTintColor: Ti.UI.userInterfaceStyle === 1 ? '#000000' : '#FFFFFF', activeIconTintColor: Ti.UI.userInterfaceStyle === 1 ? '#007AFF' : '#FFFFFF', selectionTintColor: Ti.UI.userInterfaceStyle === 1 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)', selectedIndex: 0 });
$.iconTintButton.title = 'Icons: ' + (light ? 'black / blue' : 'white / white');
updatingMode = false;
applyMapMode(0, 'initial');

function applyMapMode(index, reason) {
	if (closed || updatingMode || index < 0 || index >= items.length) return;
	updatingMode = true;
	try {
		var types = [MapModule.NORMAL_TYPE, MapModule.MUTED_STANDARD_TYPE, MapModule.HYBRID_FLYOVER_TYPE];
		$.map.mapType = types[index];
		$.nativeControl.selectedIndex = index;
		$.customControl.selectedIndex = index;
		$.nativeStatus.text = 'Native: ' + items[index].title + ' · ' + reason;
		$.customStatus.text = 'Custom: ' + items[index].title + ' · ' + reason;
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
	applyMapMode(($.nativeControl.selectedIndex + 1) % items.length, 'programmatic');
}
function changeTint() {
	if (closed) return;
	tintIndex = (tintIndex + 1) % tints.length;
	$.customControl.selectionTintColor = tints[tintIndex].color;
	$.tintButton.title = 'Custom tint: ' + tints[tintIndex].name;
}
function changeIconColors() {
	if (closed) return;
	iconPaletteIndex = (iconPaletteIndex + 1) % 3;
	var colors = [
		{ normal: Ti.UI.userInterfaceStyle === 1 ? '#000000' : '#FFFFFF', active: Ti.UI.userInterfaceStyle === 1 ? '#007AFF' : '#FFFFFF', title: light ? 'black / blue' : 'white / white' },
		{ normal: '#8E44AD', active: '#008040', title: 'purple / green' },
		{ normal: null, active: null, title: 'system default' }
	][iconPaletteIndex];
	[$.nativeControl, $.customControl].forEach(function (control) {
		control.applyProperties({ iconTintColor: colors.normal, activeIconTintColor: colors.active });
	});
	$.iconTintButton.title = 'Icons: ' + colors.title;
}
function toggleEnabled() {
	if (closed) return;
	controlsEnabled = !controlsEnabled;
	$.nativeControl.enabled = controlsEnabled;
	$.customControl.enabled = controlsEnabled;
	$.enabledButton.title = 'Controls: ' + (controlsEnabled ? 'enabled' : 'disabled');
}
function closeProject() {
	if (closed || closing) return;
	closing = true;
	$.navigation.close();
}
function onProjectClosed(event) {
	if (event.source !== $.navigation || closed) return;
	closed = true;
	$.removeListener();
	$.destroy();
	$.off();
	$.preview.remove($.map);
	$.map = null;
	delete $.__views.map;
	items = tints = MapModule = null;
	var onClose = projectArgs.onClose;
	projectArgs = null;
	if (onClose) onClose();
}
$.navigation.open();
