# Compositor and Metal Analysis

This document traces Liquid Glass below the public view APIs, using three evidence tiers:

1. Public Apple documentation and WWDC transcripts.
2. Local macOS 26.4.1 system resources and exported symbols.
3. Explicit inference where Apple does not publish implementation details.

The important correction to the original lab is this: CoreMaterial recipes are not the bottom of the stack. They are parameter bundles that feed Core Animation backdrop/filter machinery, which then renders through QuartzCore's Metal renderer and the WindowServer/SkyLight composition path.

## Observed Host

Local system inspected:

```text
ProductVersion: 26.4.1
BuildVersion: 25E253
Darwin: 25.4.0 arm64
```

Relevant frameworks found on disk or in the dyld shared cache:

- `/System/Library/PrivateFrameworks/CoreMaterial.framework`
- `/System/Library/PrivateFrameworks/MaterialKit.framework`
- `/System/Library/PrivateFrameworks/CompositorNonUI.framework`
- `/System/Library/PrivateFrameworks/SkyLight.framework`
- `/System/Library/Frameworks/QuartzCore.framework`
- `/System/Library/Frameworks/AppKit.framework`
- `/System/Library/Frameworks/Metal.framework`
- `/System/Library/Frameworks/CompositorServices.framework`

## Public API Layer

Apple exposes Liquid Glass through framework views and modifiers:

- SwiftUI: `glassEffect(_:in:)`, `GlassEffectContainer`, `glassEffectTransition(_:)`.
- AppKit: `NSGlassEffectView`, `NSGlassEffectContainerView`, `NSGlassView`.
- UIKit: new Liquid Glass appearances for bars, controls, presentations, and custom elements.

Public documentation describes the effect as adaptive, lensing, light-bending, morphing, and accessibility-aware. Public APIs intentionally do not expose the compositor shader graph.

## Material Recipe Layer

`CoreMaterial.framework` contains XML plist resources such as:

- `platformContentGlass.materialrecipe`
- `platformChromeLight.materialrecipe`
- `toolbarButtonBackground.materialrecipe`
- `dockLight.materialrecipe`
- `platters.materialrecipe`
- `modulesBackground.materialrecipe`
- reduce-transparency variants and descendant recipes

Representative recipe fields observed:

```text
platformContentGlass:
  blurRadius = 45
  colorMatrix = 4x5 matrix

platformChromeLight:
  backdropScale = 0.25
  blurAtEnd = true
  blurRadius = 22.5
  brightness = 0.1
  luminanceAmount = 0.75
  luminanceValues = [0.8, 0.9, 1.1, 0.825]
  saturation = 1.1
  styles.fill = platformChromeFillLight
  styles.stroke = platformStrokeLight

toolbarButtonBackground:
  backdropScale = 0.25
  blurAtEnd = true
  blurRadius = 15
  luminanceAmount = 0.5
  luminanceValues = [0.24, 0.24, 0.3, 0.39]
  saturation = 1.1
```

CoreMaterial exported symbols confirm that these recipes are converted into Core Animation filter/style dictionaries:

- `MTMaterialSettingsForRecipe`
- `MTMaterialCreateDictionaryRepresentation`
- `MTComposedFilterCreateDictionaryRepresentation`
- `MTTintingFilteringSettingsCreateDictionaryRepresentation`
- `MTCAColorMatrixCreateDictionaryRepresentation`
- `MTIOSurfaceCreate`
- `MTMaterialLayer`
- `MTRecipeMaterialSettings`
- `MTTintingFilteringMaterialSettings`
- `MTVisualStylingLayer`

Conclusion: CoreMaterial owns reusable material constants and dictionary conversion. It does not contain the full lens/refraction shader implementation.

## AppKit Adapter Layer

AppKit exports new glass view classes and internal state surfaces:

- `NSGlassEffectView`
- `NSGlassEffectContainerView`
- `NSGlassView`
- `NSGlassContainerView`
- `_NSGlassEffectViewMaterialContext`

Relevant exported property names observed from AppKit:

- `variant`
- `style`
- `subvariant`
- `interactionState`
- `contentLensing`
- `adaptiveAppearance`
- `scrimState`
- `subduedState`
- `groupIdentifier`
- `tintColor`
- `cornerRadius`
- `path`
- `useReducedShadowRadius`
- `Legibility.standard`
- `Legibility.increased`

Conclusion: AppKit is not simply applying a blur. It tracks geometry, grouping, interactivity, lensing state, appearance adaptation, scrim/subdued state, and legibility, then translates those into lower-level layers and filters.

## Core Animation Backdrop Layer

QuartzCore exports the key primitives that bridge material recipes to the compositor:

- `CABackdropLayer`
- `CAFilter`
- `CACFLayerSetBackgroundFilters`
- `CACFLayerSetCompositingFilter`
- `CARenderBackdropCollect`
- `CARenderUpdateGetBackdropLayerCount`
- `CARenderUpdateGetBackdropLayerInfo`
- `CARenderUpdateInvalidateBackdrops`
- `CARenderUpdateSetRegionAndInvalidateBackdrops`
- `CARenderUpdateSetFlattenBackdrops`
- `CAIOSurfaceCreate`
- `CAImageQueueRegisterIOSurfaceBuffer`
- `CAImageQueueCopyDisplayedIOSurface`

QuartzCore also exports glass-specific filter constants:

- `kCAFilterGlassBackground`
- `kCAFilterGlassForeground`
- `kCAFilterGaussianBlur`
- `kCAFilterAverageColor`
- `kCAFilterColorMatrix`
- `kCAFilterCurves`
- `kCAFilterCompressLuminance`
- `kCAFilterChromaticAberration`
- `kCAFilterChromaticAberrationMap`
- `kCAFilterDisplacementMap`

And glass-specific input keys:

- `kCAFilterInputRefractionAmount`
- `kCAFilterInputRefractionHeight`
- `kCAFilterInputRefractionOffset`
- `kCAFilterInputInnerRefractionAmount`
- `kCAFilterInputInnerRefractionHeight`
- `kCAFilterInputOuterRefractionAmount`
- `kCAFilterInputOuterRefractionHeight`
- `kCAFilterInputAberrationAmount`
- `kCAFilterInputBleedAmount`
- `kCAFilterInputBleedBlurRadius`
- `kCAFilterInputShadowAmount`
- `kCAFilterInputShadowOpacity`
- `kCAFilterInputShadowVibrancyContribution`
- `kCAFilterInputBackdropAware`
- `kCAFilterInputAdaptive`

Conclusion: the missing layer is a Core Animation backdrop/filter graph. Liquid Glass uses signed-distance/shape information, backdrop sampling, blur, refraction, aberration, bleed, shadow, tint, and foreground highlight filters.

## QuartzCore Metal Shader Layer

QuartzCore ships a Metal library:

```text
/System/Library/Frameworks/QuartzCore.framework/Versions/A/Resources/default.metallib
```

The library contains Apple GPU slices and AIR metadata. Strings inside the library expose shader function and uniform names, including:

- `glass_background_lpf`
- `glass_background_lph`
- `glass_background_no_bleed_lpf`
- `glass_background_no_bleed_lph`
- `glass_background_sdf_lpf`
- `glass_background_sdf_lph`
- `glass_background_sdf_no_bleed_lpf`
- `glass_background_sdf_no_bleed_lph`
- `glass_foreground_lpf`
- `glass_foreground_lph`
- `glass_foreground_sdf_lpf`
- `glass_foreground_sdf_lph`
- `chromatic_aberration_lpf`
- `chromatic_aberration_lph`
- `chromatic_aberration_map_lpf`
- `chromatic_aberration_map_lph`
- `displacement_map_lpf`
- `displacement_map_lph`
- `compute_average_luma`
- `tile_average_luma`
- `variable_blur_downsample_compute`
- `variable_blur_downsample_compute_agx2`
- `variable_blur_copy_base_mip_compute`
- `resolve_blur_weight_frag_lpf`
- `resolve_blur_weight_frag_lph`

Observed uniform structures and fields:

```text
GlassBackgroundUniforms
GlassBackgroundUniformsSdf
GlassForegroundUniforms
GlassForegroundSdfUniforms
SdfFragmentUniforms
ChromaticAberrationUniforms
DisplacementMapUniforms
ResolveBlurWeightUniforms
CA::OGL::Metal::SIMDBlurUniforms
CA::OGL::Metal::VariableBlurDownsampleComputeUniforms

inner_refraction_amount
inner_refraction_inv_height
outer_refraction_amount
outer_refraction_inv_height
refraction_threshold0
refraction_threshold1
refraction_opacity
complex_refraction
blur_radius
blur_alpha0..4
blur_dist0..4
edge_bleed_amount
edge_bleed_blur_radius
edge_bleed_opacity
shadow_amount
shadow_opacity
shadow_blur_radius
face_cm0..2
bleed_cm0..2
shadow_cm0..2
displacement_mat
sdf_displacement
sdf_highlight
sdf_shadow
sdf_fill
sdf_gradient
sdf_gradient_contour
```

QuartzCore exports Metal renderer control points:

- `CARenderMTLCompileShader`
- `CARenderMTLLoadPipeline`
- `CARenderMTLSetState`
- `CARenderMTLGetState`
- `CARenderMTLSetDestinationTextures`

Conclusion: the real implementation is a QuartzCore Metal shader set, not CSS blur. It includes SDF shape evaluation, variable blur, average luminance, refraction, chromatic aberration, displacement maps, edge bleed, adaptive shadows, and foreground highlights.

## WindowServer and SkyLight Layer

AppKit links against SkyLight. SkyLight links against:

- `Metal.framework`
- `QuartzCore.framework`
- `IOSurface.framework`
- `CoreDisplay.framework`
- `IOMobileFramebuffer.framework`
- `IOAccelerator.framework`
- `MetalPerformanceShaders.framework`
- `CoreVideo.framework`
- `CoreGraphics.framework`

SkyLight exports many `SLS*` and `CGS*`-family window/display/space management entry points. This is the user-space API surface around WindowServer and system window management.

Inference: App processes commit layer trees and IOSurface-backed content through Core Animation render contexts. WindowServer/SkyLight owns global window ordering, display timing, backing surfaces, backdrop availability across windows, and final screen composition. When a glass/backdrop layer samples "behind", that cannot be solved inside a normal app view tree alone; it requires compositor knowledge of the layers/windows behind that region, or an equivalent backdrop namespace managed by Core Animation/WindowServer.

## CompositorServices and CompositorNonUI

`CompositorServices.framework` and `CompositorNonUI.framework` are not the normal AppKit toolbar path, but they reveal Apple's lower compositor model for direct Metal rendering.

`CompositorNonUI.framework` exports:

- `cp_layer_renderer_create`
- `cp_layer_renderer_get_device`
- `cp_layer_renderer_get_mtl4_command_queue`
- `cp_layer_renderer_query_next_frame`
- `cp_frame_query_drawables`
- `cp_drawable_get_color_texture`
- `cp_drawable_get_depth_texture`
- `cp_drawable_add_mtl4_render_context`
- `cp_drawable_mtl4_encode_present`
- foveation, rasterization-rate-map, tracking-area, frame timing, and remote compositor fields

Its dependencies include:

- `CoreComposite`
- `CoreImage`
- `IOSurface`
- `Metal`

CompositorServices ships its own Metal libraries with shader names around video input/output streams, tracking areas, hover glow, foveation, and texture atlas sampling.

Conclusion: CompositorServices proves the lower compositor architecture is Metal texture/drawable/frame based. It is separate from AppKit Liquid Glass, but the design pattern is consistent: the system compositor provides textures, timing, tracking metadata, and final presentation; client code or framework shaders encode Metal work against those resources.

## Likely End-to-End Liquid Glass Pipeline

The most defensible end-to-end model is:

1. SwiftUI/AppKit/UIKit view declares glass.
2. Framework adapter computes shape, corner/path, grouping, style, interaction, adaptive appearance, legibility, and accessibility state.
3. CoreMaterial resolves recipe constants and visual styles.
4. AppKit/SwiftUI lowers the result to Core Animation layers, especially `CABackdropLayer` plus `CAFilter` chains.
5. Core Animation commits a layer tree/render context with backdrop/filter metadata.
6. WindowServer/SkyLight tracks window order, surfaces, spaces, display state, and backdrop namespaces.
7. QuartzCore CARender collects backdrop layers and invalidates affected backdrop regions.
8. IOSurface-backed textures carry app/window/backdrop content.
9. QuartzCore's Metal renderer runs shader passes:
   - collect/sample backdrop
   - downsample/variable blur
   - average luminance or color
   - apply recipe color matrices, saturation, brightness, tint, and luminance curves
   - evaluate SDF/supercircle/shape masks
   - apply inner/outer refraction and displacement
   - add chromatic aberration
   - add edge bleed and adaptive shadow
   - render foreground/rim/highlight layer
10. CARender/WindowServer composites the result into the display frame with proper color management, EDR/HDR handling, and vsync timing.

## What the Web Lab Misses

The current web lab correctly captures:

- CoreMaterial recipe values for common materials.
- Luminance/color-matrix style processing.
- Reduced transparency and high contrast branches.
- Component grouping/morphing semantics.
- A visual approximation of blur, tint, displacement, and live backdrop sampling.

It does not implement:

- `CABackdropLayer` semantics.
- WindowServer-aware backdrop sampling across windows.
- QuartzCore `glass_background` / `glass_foreground` Metal shaders.
- SDF-driven inner/outer refraction.
- Edge bleed and adaptive shadow shader fields.
- Chromatic aberration map pipeline.
- Variable blur compute/downsample path.
- IOSurface-backed compositor handoff.
- Display timing, HDR/EDR, foveation, or compositor invalidation regions.

## Native Prototype Requirements

To go beyond the web approximation, the next artifact needs to be native macOS:

- An AppKit sample with `NSGlassEffectView` and `NSGlassEffectContainerView`.
- A diagnostic mode that snapshots the layer tree with `CAEncodeLayerTree`/Quartz Debug-style tools.
- Instruments traces: Core Animation, Metal System Trace, GPU counters.
- A separate educational Metal renderer that reproduces the inferred shader stages using public Metal APIs.

Shipping an app that calls private `CAFilter` or `CABackdropLayer` symbols directly is not App Store safe. The correct production path is public `NSGlassEffectView`/SwiftUI `glassEffect`; the correct research path is measurement and a separate public-API Metal approximation.

## Bottom Line

Liquid Glass bottoms out in QuartzCore's Metal-backed compositor path. CoreMaterial supplies recipes; AppKit/SwiftUI supply view semantics; Core Animation supplies `CABackdropLayer` and glass filters; QuartzCore's `default.metallib` supplies the glass/refraction/blur/SDF shaders; SkyLight/WindowServer supplies global surface ordering and presentation.

