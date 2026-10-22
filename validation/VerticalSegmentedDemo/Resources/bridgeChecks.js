exports.run = function (win, module, done) {
  var checks = 0;
  var events = [];
  var base = [
    { id: 'a', title: 'Alpha', systemImage: 'map.fill' },
    { id: 'b', title: 'Beta', systemImage: 'car.fill' },
    { id: 'c', title: 'Gamma', systemImage: 'globe.americas.fill' }
  ];
  var view = module.createView({ selectedIndex: 2, height: Ti.UI.SIZE, width: Ti.UI.SIZE, left: -200, items: base });
  function change(e) { events.push({ index: e.index, id: e.id, reason: e.reason }); }
  view.addEventListener('change', change);
  win.add(view);
  function assert(value, message) {
    checks++;
    if (!value) { throw new Error(message); }
  }
  var timer = setTimeout(function () {
    try {
      assert(module.STYLE_NATIVE === 'native' && module.STYLE_CUSTOM === 'custom', 'module constants');
      assert(view.selectedIndex === 2, 'creation selection is independent of property order');
      assert(view.style === 'native' && view.pointSize === 18 && view.segmentHeight === 60 && view.enabled === true, 'native defaults');
      assert(Math.abs(view.rect.width - 50) < 1 && Math.abs(view.rect.height - 180) < 1, 'Ti.UI.SIZE is 50 by 180');
      view.selectedIndex = 1;
      assert(view.selectedIndex === 1 && events.length === 1 && events[0].id === 'b' && events[0].reason === 'programmatic', 'programmatic selection and event');
      view.selectedIndex = 1;
      assert(events.length === 1, 'same selection emits no change');
      view.selectedIndex = 99;
      assert(view.selectedIndex === 1 && events.length === 1, 'out-of-range selection ignored');
      view.selectedIndex = 1.5;
      assert(view.selectedIndex === 1, 'fractional selection ignored');
      view.items = [base[1], base[0], base[2]];
      assert(view.selectedIndex === 0 && events[events.length - 1].id === 'b', 'items reorder preserves selected identity');
      var accepted = view.items;
      view.items = [base[0], base[0]];
      assert(view.items.length === accepted.length && view.items[0].id === 'b', 'duplicate IDs rejected atomically');
      view.items = [{ id: 'bad', title: 'Invalid', systemImage: 'not.a.real.symbol.12345' }];
      assert(view.items.length === 3, 'invalid symbol rejected atomically');
      view.items = [base[0], base[2]];
      assert(view.selectedIndex === 0 && events[events.length - 1].id === 'a' && events[events.length - 1].reason === 'items', 'removed selection falls back and emits identity change');
      view.style = 'custom';
      view.pointSize = 22;
      view.selectionTintColor = '#66008080';
      view.iconTintColor = '#123456';
      view.enabled = false;
      assert(view.style === 'custom' && view.selectedIndex === 0 && view.pointSize === 22 && view.enabled === false, 'live custom appearance preserves state');
      view.style = 'invalid';
      view.pointSize = -1;
      assert(view.style === 'custom' && view.pointSize === 22, 'invalid appearance ignored');
      view.style = 'native';
      view.enabled = true;
      view.segmentHeight = 70;
      assert(view.style === 'native' && view.segmentHeight === 70 && view.enabled === true, 'native appearance restored');
      view.items = [];
      assert(view.selectedIndex === -1 && view.items.length === 0, 'empty items supported');
      view.items = base;
      assert(view.selectedIndex === 0, 'empty-to-populated selection restored');
      Ti.API.info('[VerticalSC CHECKS] PASS ' + checks);
      done(null, checks);
    } catch (error) {
      Ti.API.error('[VerticalSC CHECKS] FAIL ' + error.message);
      done(error, checks);
    } finally {
      view.removeEventListener('change', change);
      win.remove(view);
      view = null;
    }
  }, 700);
  win.addEventListener('close', function close() {
    clearTimeout(timer);
    win.removeEventListener('close', close);
    if (view) { view.removeEventListener('change', change); win.remove(view); view = null; }
  });
};
