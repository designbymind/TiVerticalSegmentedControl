// Snapshot the actual rendered native controls, not just their JS properties.
exports.run = function (nativeControl, customControl, done) {
  var directory = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'tint-validation');
  directory.createDirectory();
  var stages = [
    { name: 'creation', normal: '#FF6600', active: '#007AFF' },
    { name: 'live', normal: '#8E44AD', active: '#008040' },
    { name: 'inheritance', normal: '#8E44AD', active: null },
    { name: 'reset', normal: null, active: null },
    { name: 'active-only', normal: null, active: '#007AFF' },
    { name: 'selection', normal: '#FF6600', active: '#007AFF', select: true },
    { name: 'style-change', normal: '#FF6600', active: '#007AFF', swap: true }
  ];
  var index = 0;
  var timer;
  var cancelled = false;
  function capture() {
    if (cancelled) return;
    var stage = stages[index];
    try {
      [nativeControl, customControl].forEach(function (control, position) {
        var file = Ti.Filesystem.getFile(directory.nativePath, stage.name + '-' + position + '.png');
        file.write(control.toImage());
      });
      index++;
      if (index === stages.length) {
        Ti.Filesystem.getFile(directory.nativePath, 'complete.json').write(JSON.stringify({ stages: stages, snapshots: index * 2 }));
        done(null);
      } else {
        apply();
      }
    } catch (error) { done(error); }
  }
  function apply() {
    if (cancelled) return;
    var stage = stages[index];
    // Stage zero deliberately captures values supplied at view creation.
    if (index > 0) {
      [nativeControl, customControl].forEach(function (control) {
        control.applyProperties({ iconTintColor: stage.normal, activeIconTintColor: stage.active });
      });
    }
    if (stage.select) { nativeControl.selectedIndex = 2; customControl.selectedIndex = 0; }
    if (stage.swap) { nativeControl.style = 'custom'; customControl.style = 'native'; }
    timer = setTimeout(capture, 600);
  }
  apply();
  return function () { cancelled = true; clearTimeout(timer); nativeControl = customControl = null; };
};
