// UIKit implementation inspired by Kavsoft's VerticalSC demonstration.
// Copyright (c) 2026 DesignByMind LLC. See LICENSE and NOTICE.md.
import TitaniumKit
import UIKit

// Keep the upstream track-removal workaround in one place. This uses public
// UIView APIs, but depends on UIKit's undocumented internal view arrangement.
// The native style never alters the control's internal subviews.
private final class VerticalSegments: UISegmentedControl {
  var hidesTrack = false
  override func layoutSubviews() {
    super.layoutSubviews()
    guard hidesTrack else { return }
    for child in subviews where child is UIImageView && child !== subviews.last {
      child.alpha = 0
    }
  }
}

@objc(TiVerticalsegmentedcontrolViewProxy)
class TiVerticalsegmentedcontrolViewProxy: TiViewProxy {
  override func newView() -> TiUIView! { TiVerticalsegmentedcontrolView(frame: .zero) }
  override func contentWidth(forWidth width: CGFloat) -> CGFloat {
    var result: CGFloat = 50
    TiThreadPerformOnMainThread({ result = self.view.contentWidth(forWidth: width) }, true)
    return result
  }
  override func contentHeight(forWidth width: CGFloat) -> CGFloat {
    var result: CGFloat = 0
    TiThreadPerformOnMainThread({ result = self.view.contentHeight(forWidth: width) }, true)
    return result
  }
  override func windowDidClose() {
    if viewAttached(), let native = view as? TiVerticalsegmentedcontrolView {
      native.cancelAnimations()
    }
    super.windowDidClose()
  }
}

@objc(TiVerticalsegmentedcontrolView)
class TiVerticalsegmentedcontrolView: TiUIView {
  private let glass = UIVisualEffectView(effect: nil)
  private var segments = VerticalSegments(items: [])
  private var items: [[String: Any]] = []
  private var selectedIndex = -1
  private var requestedIndex = 0
  private var configured = false
  private var style = "native"
  private var pointSize: CGFloat = 18
  private var segmentHeight: CGFloat = 60
  private var selectionTint: UIColor?
  private var iconTint: UIColor?
  private var activeIconTint: UIColor?
  private var enabled = true

  override func initializeState() {
    super.initializeState()
    addSubview(glass)
    installControl()
    registerForTraitChanges([UITraitUserInterfaceStyle.self, UITraitDisplayScale.self, UITraitAccessibilityContrast.self]) {
      (view: TiVerticalsegmentedcontrolView, _: UITraitCollection) in
      view.rebuildSegments()
      view.updateAppearance()
    }
  }

  override func configurationSet() {
    super.configurationSet()
    guard !configured else { return }
    configured = true
    selectedIndex = validIndex(requestedIndex) ? requestedIndex : (items.isEmpty ? -1 : 0)
    syncSelection()
    proxy.replaceValue(items, forKey: "items", notification: false)
    proxy.replaceValue(style, forKey: "style", notification: false)
    proxy.replaceValue(pointSize, forKey: "pointSize", notification: false)
    proxy.replaceValue(segmentHeight, forKey: "segmentHeight", notification: false)
    proxy.replaceValue(enabled, forKey: "enabled", notification: false)
    updateAppearance()
  }

  override func frameSizeChanged(_ frame: CGRect, bounds: CGRect) {
    super.frameSizeChanged(frame, bounds: bounds)
    setNeedsLayout()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    glass.frame = bounds
    glass.layer.cornerRadius = min(bounds.width, bounds.height) / 2
    // Set bounds + center instead of frame on a transformed view. Rotation
    // maps segment zero to the top and the last segment to the bottom.
    segments.bounds = CGRect(x: 0, y: 0, width: bounds.height, height: bounds.width)
    segments.center = CGPoint(x: bounds.midX, y: bounds.midY)
  }

  override func contentWidth(forWidth width: CGFloat) -> CGFloat { 50 }
  override func contentHeight(forWidth width: CGFloat) -> CGFloat { CGFloat(items.count) * segmentHeight }

  private func installControl() {
    segments.removeTarget(self, action: #selector(valueChanged(_:)), for: .valueChanged)
    segments.removeFromSuperview()
    segments = VerticalSegments(items: [])
    segments.hidesTrack = style == "custom"
    segments.semanticContentAttribute = .forceLeftToRight
    segments.transform = CGAffineTransform(rotationAngle: .pi / 2)
    segments.addTarget(self, action: #selector(valueChanged(_:)), for: .valueChanged)
    // Glass wraps the control rather than covering or intercepting its touches.
    glass.contentView.addSubview(segments)
    rebuildSegments()
    updateAppearance()
    setNeedsLayout()
  }

  private func symbol(_ name: String, selected: Bool = false) -> UIImage? {
    let configuration = UIImage.SymbolConfiguration(pointSize: pointSize)
    guard let cgImage = UIImage(systemName: name, withConfiguration: configuration)?.cgImage else { return nil }
    let image = UIImage(cgImage: cgImage, scale: max(1, traitCollection.displayScale), orientation: .left)
    // UISegmentedControl applies its own colors to template images. Explicit
    // colors must be part of an original image to survive that appearance pass.
    if let color = selected ? (activeIconTint ?? iconTint) : iconTint {
      return image.withTintColor(color.resolvedColor(with: traitCollection), renderingMode: .alwaysOriginal)
    }
    return image.withRenderingMode(.alwaysTemplate)
  }

  private func rebuildSegments() {
    segments.removeAllSegments()
    for (index, item) in items.enumerated() {
      let image = symbol(item["systemImage"] as! String, selected: index == selectedIndex)
      // UIAction's title supplies the accessible name while its image is shown.
      let action = UIAction(title: item["title"] as! String, image: image,
                            identifier: UIAction.Identifier(item["id"] as! String)) { _ in }
      segments.insertSegment(action: action, at: index, animated: false)
    }
    segments.selectedSegmentIndex = selectedIndex
    setNeedsLayout()
  }

  private func updateIconImages() {
    // Preserve the control, its segments and its current selection animation.
    for (index, item) in items.enumerated() {
      segments.setImage(symbol(item["systemImage"] as! String, selected: index == selectedIndex), forSegmentAt: index)
    }
  }

  private func updateAppearance() {
    let effect = UIGlassEffect(style: .regular)
    effect.isInteractive = style == "custom"
    glass.effect = effect
    glass.clipsToBounds = true
    segments.isEnabled = enabled
    segments.tintColor = iconTint ?? .label
    segments.selectedSegmentTintColor = style == "custom"
      ? (selectionTint ?? UIColor { traits in
        (traits.userInterfaceStyle == .dark ? UIColor.black : UIColor.gray).withAlphaComponent(0.35)
      }) : nil
    segments.setNeedsLayout()
  }

  private func validIndex(_ index: Int) -> Bool { items.indices.contains(index) }

  private func syncSelection() {
    segments.selectedSegmentIndex = selectedIndex
    updateIconImages()
    proxy.replaceValue(selectedIndex, forKey: "selectedIndex", notification: false)
  }

  private func notifyChange(previousIndex: Int, reason: String) {
    guard configured, previousIndex != selectedIndex else { return }
    var event: [String: Any] = ["index": selectedIndex, "previousIndex": previousIndex, "reason": reason]
    if validIndex(selectedIndex) {
      event["id"] = items[selectedIndex]["id"]
      event["title"] = items[selectedIndex]["title"]
    } else {
      event["id"] = NSNull()
      event["title"] = NSNull()
    }
    proxy.fireEvent("change", with: event)
  }

  @objc private func valueChanged(_ sender: UISegmentedControl) {
    guard validIndex(sender.selectedSegmentIndex) else { return }
    let previous = selectedIndex
    selectedIndex = sender.selectedSegmentIndex
    syncSelection()
    notifyChange(previousIndex: previous, reason: "user")
  }

  @objc(setItems_:)
  func setItems_(_ value: Any?) {
    guard let values = value as? [[String: Any]] else {
      reject("items must be an array of dictionaries", key: "items", value: items)
      return
    }
    var identifiers = Set<String>()
    for item in values {
      guard let id = item["id"] as? String, !id.isEmpty, identifiers.insert(id).inserted,
            let title = item["title"] as? String, !title.isEmpty,
            let name = item["systemImage"] as? String, symbol(name) != nil else {
        reject("Each item needs a unique nonempty id, a nonempty title and a valid SF Symbol systemImage", key: "items", value: items)
        return
      }
    }
    let previousIndex = selectedIndex
    let previousId = validIndex(selectedIndex) ? items[selectedIndex]["id"] as? String : nil
    items = values
    if configured {
      selectedIndex = items.firstIndex { $0["id"] as? String == previousId } ?? (items.isEmpty ? -1 : 0)
    }
    rebuildSegments()
    if configured { syncSelection() }
    (proxy as? TiViewProxy)?.contentsWillChange()
    // Replacing/reordering items may change the selected identity even if its
    // index remains zero. Report that change once, after synchronizing state.
    if configured {
      let newId = validIndex(selectedIndex) ? items[selectedIndex]["id"] as? String : nil
      if previousIndex != selectedIndex {
        notifyChange(previousIndex: previousIndex, reason: "items")
      } else if previousId != newId {
        proxy.fireEvent("change", with: ["index": selectedIndex, "previousIndex": previousIndex,
          "id": newId as Any? ?? NSNull(),
          "title": validIndex(selectedIndex) ? items[selectedIndex]["title"]! : NSNull(), "reason": "items"])
      }
    }
  }

  @objc(setSelectedIndex_:)
  func setSelectedIndex_(_ value: Any?) {
    guard let number = value as? NSNumber, number.doubleValue.isFinite,
          number.doubleValue.rounded() == number.doubleValue,
          number.doubleValue >= -1, number.doubleValue <= Double(Int32.max) else {
      reject("selectedIndex must be an integer index", key: "selectedIndex", value: configured ? selectedIndex : requestedIndex)
      return
    }
    let next = number.intValue
    guard configured else { requestedIndex = next; return }
    guard validIndex(next) || (items.isEmpty && next == -1) else {
      reject("selectedIndex is out of range", key: "selectedIndex", value: selectedIndex)
      return
    }
    let previous = selectedIndex
    selectedIndex = next
    syncSelection()
    notifyChange(previousIndex: previous, reason: "programmatic")
  }

  @objc(setStyle_:)
  func setStyle_(_ value: Any?) {
    guard let next = value as? String, next == "native" || next == "custom" else {
      reject("style must be native or custom", key: "style", value: style)
      return
    }
    guard next != style else { return }
    style = next
    // Recreate only on style changes so hidden native track views are restored.
    cancelAnimations()
    installControl()
  }

  @objc(setPointSize_:)
  func setPointSize_(_ value: Any?) {
    guard let size = positiveNumber(value) else {
      reject("pointSize must be finite and greater than zero", key: "pointSize", value: pointSize)
      return
    }
    pointSize = size
    rebuildSegments()
  }

  @objc(setSegmentHeight_:)
  func setSegmentHeight_(_ value: Any?) {
    guard let height = positiveNumber(value) else {
      reject("segmentHeight must be finite and greater than zero", key: "segmentHeight", value: segmentHeight)
      return
    }
    segmentHeight = height
    (proxy as? TiViewProxy)?.contentsWillChange()
  }

  @objc(setSelectionTintColor_:)
  func setSelectionTintColor_(_ value: Any?) {
    selectionTint = TiUtils.colorValue(value)?.color
    updateAppearance()
  }

  @objc(setIconTintColor_:)
  func setIconTintColor_(_ value: Any?) {
    iconTint = TiUtils.colorValue(value)?.color
    updateIconImages()
    updateAppearance()
  }

  @objc(setActiveIconTintColor_:)
  func setActiveIconTintColor_(_ value: Any?) {
    activeIconTint = TiUtils.colorValue(value)?.color
    updateIconImages()
  }

  @objc(setEnabled_:)
  func setEnabled_(_ value: Any?) {
    enabled = TiUtils.boolValue(value, def: true)
    segments.isEnabled = enabled
  }

  private func positiveNumber(_ value: Any?) -> CGFloat? {
    guard let number = value as? NSNumber, number.doubleValue.isFinite, number.doubleValue > 0 else { return nil }
    return CGFloat(number.doubleValue)
  }

  private func reject(_ message: String, key: String, value: Any) {
    NSLog("[TiVerticalSegmentedControl] %@; update ignored", message)
    proxy.replaceValue(value, forKey: key, notification: false)
  }

  func cancelAnimations() {
    layer.removeAllAnimations()
    glass.layer.removeAllAnimations()
    segments.layer.removeAllAnimations()
  }
}
