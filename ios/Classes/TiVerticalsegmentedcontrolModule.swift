import TitaniumKit

@objc(TiVerticalsegmentedcontrolModule)
class TiVerticalsegmentedcontrolModule: TiModule {
  func moduleGUID() -> String { "98cc7a95-d470-4411-a754-49cec3cadac5" }
  override func moduleId() -> String! { "ti.verticalsegmentedcontrol" }
  @objc var STYLE_NATIVE: String { "native" }
  @objc var STYLE_CUSTOM: String { "custom" }
}
