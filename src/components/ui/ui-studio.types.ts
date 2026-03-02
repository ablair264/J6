export type UIComponentKind =
  | 'accordion'
  | 'alert'
  | 'avatar'
  | 'badge'
  | 'button'
  | 'checkbox'
  | 'data-table'
  | 'dialog'
  | 'drawer'
  | 'dropdown'
  | 'label'
  | 'input'
  | 'navigation-menu'
  | 'popover'
  | 'progress'
  | 'skeleton'
  | 'slider'
  | 'tabs'
  | 'tooltip';

export type SizeOption = 'sm' | 'md' | 'lg';
export type FillMode = 'solid' | 'gradient';
export type FontPosition = 'left' | 'center' | 'right';
export type MotionPresetId = 'none' | 'rainbow' | 'shimmer';
export type IconOptionId = 'none' | 'search' | 'lightning' | 'heart' | 'figma' | 'star' | 'cog' | 'spinner';
export type PrimitiveSide = 'top' | 'right' | 'bottom' | 'left';
export type PrimitiveAlign = 'start' | 'center' | 'end';
export type MotionTransitionType = 'tween' | 'spring';
export type MotionEaseOption = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'anticipate' | 'backIn' | 'backOut' | 'backInOut' | 'circIn' | 'circOut' | 'circInOut' | 'cubicBezier';
export type ButtonPreviewState = 'default' | 'hover' | 'active' | 'disabled';
export type GradientSlideDirection = 'left' | 'right' | 'top' | 'bottom';
export type LoaderOutcome = 'success' | 'failure' | 'warning';
export type CheckboxSelectionIcon = 'tick' | 'cross' | 'solid';
export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'bordered' | 'ghost';
export type TabsVariant = 'default' | 'line';
export type SkeletonVariant = 'text' | 'avatar' | 'card' | 'custom';
export type AvatarShape = 'circle' | 'rounded';
export type ProgressVariant = 'linear' | 'circular';
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type NavMenuOrientation = 'horizontal' | 'vertical';
export type BorderStyleOption = 'solid' | 'dashed' | 'dotted';
export type TextTransformOption = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type StaggerDirection = 'forward' | 'reverse';

export interface ComponentInfo {
  kind: UIComponentKind;
  label: string;
  file: string;
  summary: string;
}

export interface ComponentStyleConfig {
  size: SizeOption;
  cornerRadius: number;
  strokeColor: string;
  strokeWeight: number;
  strokeOpacity: number;
  fillMode: FillMode;
  fillColor: string;
  fillColorTo: string;
  fillWeight: number;
  fillOpacity: number;
  fontSize: number;
  fontWeight: number;
  fontPosition: FontPosition;
  fontColor: string;
  fontOpacity: number;
  effectDropShadow: boolean;
  dropShadowStrength: number;
  dropShadowX: number;
  dropShadowY: number;
  dropShadowBlur: number;
  dropShadowSpread: number;
  effectInnerShadow: boolean;
  innerShadowStrength: number;
  innerShadowX: number;
  innerShadowY: number;
  innerShadowBlur: number;
  innerShadowSpread: number;
  effectBlur: boolean;
  blurAmount: number;
  effectGlass: boolean;
  glassOpacity: number;
  customWidth: number;
  customHeight: number;
  dropdownHoverFill: string;
  dropdownHoverFillOpacity: number;
  dropdownHoverText: string;
  panelFillColor: string;
  panelFillOpacity: number;
  panelStrokeColor: string;
  panelStrokeWeight: number;
  panelStrokeOpacity: number;
  panelFontColor: string;
  panelFontOpacity: number;
  panelFontSize: number;
  panelFontWeight: number;
  panelCornerRadius: number;
  panelCustomWidth: number;
  panelCustomHeight: number;
  panelEffectDropShadow: boolean;
  panelDropShadowX: number;
  panelDropShadowY: number;
  panelDropShadowBlur: number;
  panelDropShadowSpread: number;
  panelEffectBlur: boolean;
  panelBlurAmount: number;
  buttonPreviewState: ButtonPreviewState;
  buttonHoverFillMode: FillMode;
  buttonHoverFillColor: string;
  buttonHoverFillColorTo: string;
  buttonHoverFillWeight: number;
  buttonHoverFillOpacity: number;
  buttonHoverFontColor: string;
  buttonHoverFontOpacity: number;
  buttonHoverFontSize: number;
  buttonHoverFontWeight: number;
  buttonHoverFontPosition: FontPosition;
  buttonHoverStrokeColor: string;
  buttonHoverStrokeOpacity: number;
  buttonHoverStrokeWeight: number;
  buttonActiveFillMode: FillMode;
  buttonActiveFillColor: string;
  buttonActiveFillColorTo: string;
  buttonActiveFillWeight: number;
  buttonActiveFillOpacity: number;
  buttonActiveFontColor: string;
  buttonActiveFontOpacity: number;
  buttonActiveFontSize: number;
  buttonActiveFontWeight: number;
  buttonActiveFontPosition: FontPosition;
  buttonActiveStrokeColor: string;
  buttonActiveStrokeOpacity: number;
  buttonActiveStrokeWeight: number;
  buttonDisabledFillMode: FillMode;
  buttonDisabledFillColor: string;
  buttonDisabledFillColorTo: string;
  buttonDisabledFillWeight: number;
  buttonDisabledFillOpacity: number;
  buttonDisabledFontColor: string;
  buttonDisabledFontOpacity: number;
  buttonDisabledFontSize: number;
  buttonDisabledFontWeight: number;
  buttonDisabledFontPosition: FontPosition;
  buttonDisabledStrokeColor: string;
  buttonDisabledStrokeOpacity: number;
  buttonDisabledStrokeWeight: number;
  badgeShowText: boolean;
  buttonShowText: boolean;
  icon: IconOptionId;
  iconSize: number;
  iconPosition: 'left' | 'right';
  componentPreset: string;
  motionPreset: MotionPresetId;
  motionSpeed: number;
  rainbowColor1: string;
  rainbowColor2: string;
  rainbowColor3: string;
  rainbowColor4: string;
  rainbowColor5: string;
  shimmerColor: string;
  checkboxState: 'checked' | 'unchecked' | 'indeterminate';
  checkboxDisabled: boolean;
  checkboxRequired: boolean;
  checkboxName: string;
  checkboxValue: string;
  dialogDefaultOpen: boolean;
  dialogModal: boolean;
  dropdownSide: PrimitiveSide;
  dropdownAlign: PrimitiveAlign;
  dropdownSideOffset: number;
  dropdownAlignOffset: number;
  labelFor: string;
  labelText: string;
  labelShowField: boolean;
  tooltipSide: PrimitiveSide;
  tooltipAlign: PrimitiveAlign;
  tooltipSideOffset: number;
  tooltipDelay: number;
  tooltipArrow: boolean;
  motionComponentEnabled: boolean;
  motionEntryEnabled: boolean;
  motionExitEnabled: boolean;
  motionHoverEnabled: boolean;
  motionTapEnabled: boolean;
  motionInitialOpacity: number;
  motionAnimateOpacity: number;
  motionInitialX: number;
  motionInitialY: number;
  motionAnimateX: number;
  motionAnimateY: number;
  motionAnimateRotate: number;
  motionHoverScale: number;
  motionHoverX: number;
  motionHoverY: number;
  motionHoverRotate: number;
  motionHoverOpacity: number;
  motionTapScale: number;
  motionTapX: number;
  motionTapY: number;
  motionTapRotate: number;
  motionTapOpacity: number;
  motionHoverTransitionType: MotionTransitionType;
  motionHoverEase: MotionEaseOption;
  motionHoverDuration: number;
  motionHoverDelay: number;
  motionHoverStiffness: number;
  motionHoverDamping: number;
  motionHoverMass: number;
  motionTapTransitionType: MotionTransitionType;
  motionTapEase: MotionEaseOption;
  motionTapDuration: number;
  motionTapDelay: number;
  motionTapStiffness: number;
  motionTapDamping: number;
  motionTapMass: number;
  motionTransitionType: MotionTransitionType;
  motionEase: MotionEaseOption;
  motionDuration: number;
  motionDelay: number;
  motionStiffness: number;
  motionDamping: number;
  motionMass: number;
  effectGradientSlideEnabled: boolean;
  effectGradientSlideDirection: GradientSlideDirection;
  effectGradientSlideFillMode: FillMode;
  effectGradientSlideColor: string;
  effectGradientSlideColorTo: string;
  effectGradientSlideSpeed: number;
  effectAnimatedBorderEnabled: boolean;
  effectAnimatedBorderSpeed: number;
  effectAnimatedBorderColorCount: number;
  effectAnimatedBorderColor1: string;
  effectAnimatedBorderColor2: string;
  effectAnimatedBorderColor3: string;
  effectAnimatedBorderColor4: string;
  effectAnimatedBorderColor5: string;
  effectAnimatedBorderStateDefault: boolean;
  effectAnimatedBorderStateHover: boolean;
  effectAnimatedBorderStateActive: boolean;
  effectAnimatedBorderStateDisabled: boolean;
  effectRippleFillEnabled: boolean;
  effectRippleFillColor: string;
  effectRippleFillSpeed: number;
  effectLoadingActiveEnabled: boolean;
  effectLoadingBadgeDefaultEnabled: boolean;
  effectLoadingPosition: 'left' | 'right';
  effectLoadingOutcome: LoaderOutcome;
  effectSweepEnabled: boolean;
  effectSweepColor: string;
  effectSweepOpacity: number;
  effectSweepWidth: number;
  effectSweepSpeed: number;
  effectSweepStateDefault: boolean;
  effectSweepStateHover: boolean;
  effectSweepStateActive: boolean;
  effectSweepStateDisabled: boolean;
  tooltipBodyMotionPresetId: string;
  tooltipTextMotionPresetId: string;
  dialogBodyMotionPresetId: string;
  dialogTextMotionPresetId: string;
  popoverBodyMotionPresetId: string;
  popoverTextMotionPresetId: string;
  dropdownBodyMotionPresetId: string;
  dropdownOptionHoverEnabled: boolean;
  dropdownOptionHoverScale: number;
  dropdownOptionHoverY: number;
  dropdownOptionTapEnabled: boolean;
  dropdownOptionTapScale: number;
  dropdownOptionTapY: number;
  inputAutocompleteEnabled: boolean;
  inputAutocompleteBodyMotionPresetId: string;
  tabsVariant: TabsVariant;
  tabsCount: number;
  tabsListBg: string;
  tabsActiveBg: string;
  tabsUnderlineMotionEnabled: boolean;
  tabsBodyMotionPresetId: string;
  tabsTextMotionPresetId: string;
  checkboxHoverEnabled: boolean;
  checkboxHoverScale: number;
  checkboxTapEnabled: boolean;
  checkboxTapScale: number;
  checkboxSelectionIcon: CheckboxSelectionIcon;
  checkboxSelectionAnimationSpeed: number;
  sliderThumbHoverScale: number;
  sliderThumbTapBounce: number;
  sliderBarFillSpeed: number;
  sliderBarScale: number;
  sliderBarBounce: number;

  // ─── Phase 2: New Component Properties ──────────────────────────
  // Accordion
  accordionType: AccordionType;
  accordionCollapsible: boolean;
  accordionItemCount: number;
  accordionVariant: AccordionVariant;
  accordionDividerColor: string;
  // Avatar
  avatarSrc: string;
  avatarFallbackText: string;
  avatarShape: AvatarShape;
  avatarShowBadge: boolean;
  avatarBadgeColor: string;
  // DataTable
  dataTableColumns: number;
  dataTableRows: number;
  dataTableSortable: boolean;
  dataTableStriped: boolean;
  dataTableHeaderBg: string;
  dataTableStripedBg: string;
  // Drawer
  drawerSide: DrawerSide;
  drawerWidth: number;
  drawerOverlayBlur: number;
  drawerBodyMotionPresetId: string;
  // Navigation Menu
  navMenuOrientation: NavMenuOrientation;
  navMenuActiveIndicator: boolean;
  navMenuItemCount: number;
  // Progress
  progressValue: number;
  progressVariant: ProgressVariant;
  progressShowLabel: boolean;
  progressAnimateValue: boolean;
  // Skeleton
  skeletonVariant: SkeletonVariant;
  skeletonAnimationSpeed: number;
  skeletonLines: number;
  // Alert
  alertVariant: AlertVariant;
  alertDismissible: boolean;
  alertShowIcon: boolean;

  // ─── Phase 3: Refined Design Options ────────────────────────────
  // Typography
  letterSpacing: number;
  lineHeight: number;
  textTransform: TextTransformOption;
  // Border Style
  borderStyle: BorderStyleOption;
  // Text Shadow
  effectTextShadow: boolean;
  textShadowColor: string;
  textShadowBlur: number;
  textShadowX: number;
  textShadowY: number;
  // Outline Glow
  effectOutlineGlow: boolean;
  outlineGlowColor: string;
  outlineGlowSize: number;
  // Enhanced Glass
  effectGlassmorphism: boolean;
  glassmorphismBlur: number;
  glassmorphismOpacity: number;
  glassmorphismBorderOpacity: number;

  // ─── Phase 4: Motion Refinements ────────────────────────────────
  // Entry scale
  motionInitialScale: number;
  motionAnimateScale: number;
  // Custom bezier
  motionCustomBezier: [number, number, number, number];
  // Stagger
  motionStaggerEnabled: boolean;
  motionStaggerDelay: number;
  motionStaggerDirection: StaggerDirection;
}

export interface ComponentInstance {
  id: string;
  kind: UIComponentKind;
  name: string;
  style: ComponentStyleConfig;
}

export interface StylePreset {
  id: string;
  label: string;
  description: string;
  values: Partial<ComponentStyleConfig>;
}

export interface ComponentVisualPreset {
  id: string;
  label: string;
  description: string;
  kind: UIComponentKind;
  className?: string;
  autoMotionPreset?: MotionPresetId;
  values: Partial<ComponentStyleConfig>;
}
