export type UIComponentKind =
  | 'accordion'
  | 'alert'
  | 'avatar'
  | 'avatar-group'
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
  | 'animated-text'
  | 'card'
  | 'product-card'
  | 'listing-card'
  | 'switch'
  | 'tooltip';

export type SizeOption = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'bordered' | 'elevated' | 'glass';
export type AnimatedTextVariant = 'typewriter' | 'blur-in' | 'split-entrance' | 'counting-number' | 'decrypt' | 'gradient-sweep' | 'shiny-text' | 'word-rotate' | 'gradual-spacing' | 'letters-pull-up' | 'fade-up' | 'fade-down';
export type AnimatedTextSplitBy = 'char' | 'word' | 'line';
export type AnimatedTextTrigger = 'mount' | 'hover';
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
  dropdownTriggerVariant: 'button' | 'icon';
  dropdownShowItemIcons: boolean;
  dropdownShowSubmenu: boolean;
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
  checkboxLabel: string;
  checkboxCheckedColor: string;
  checkboxBorderColor: string;
  checkboxIndicatorColor: string;
  checkboxCornerRadius: number;
  dialogDefaultOpen: boolean;
  dialogModal: boolean;
  dialogTitleText: string;
  dialogTitleColor: string;
  dialogTitleSize: number;
  dialogTitleWeight: number;
  dialogTitleAlign: FontPosition;
  dialogBodyText: string;
  dialogBodyColor: string;
  dialogBodySize: number;
  dialogBodyWeight: number;
  dialogBodyAlign: FontPosition;
  dialogShowCloseIcon: boolean;
  dialogShowActionButton: boolean;
  dialogActionButtonText: string;
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
  inputAutocompleteBgColor: string;
  inputAutocompleteBorderColor: string;
  inputAutocompleteTextColor: string;
  inputAutocompleteOptionHoverBgColor: string;
  inputAutocompleteOptionHoverTextColor: string;
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
  // Border Beam (Magic UI BorderBeam — conic-gradient beam rotating around border)
  effectBorderBeamEnabled: boolean;
  effectBorderBeamSpeed: number;
  effectBorderBeamSize: number;
  effectBorderBeamColorFrom: string;
  effectBorderBeamColorTo: string;
  // Shine Border (Magic UI ShineBorder — conic-gradient sweep along border)
  effectShineBorderEnabled: boolean;
  effectShineBorderSpeed: number;
  effectShineBorderColor: string;
  effectShineBorderWidth: number;
  // Neon Glow (Magic UI NeonGradientCard — animated box-shadow color cycling)
  effectNeonGlowEnabled: boolean;
  effectNeonGlowSpeed: number;
  effectNeonGlowColor1: string;
  effectNeonGlowColor2: string;
  effectNeonGlowSize: number;
  // Pulse Ring (Animate UI — ::after ring scales out + fades)
  effectPulseRingEnabled: boolean;
  effectPulseRingSpeed: number;
  effectPulseRingColor: string;
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
  accordionCollapsible: boolean;
  accordionAllowMultiple: boolean;
  accordionItemCount: number;
  accordionPaddingH: number;
  accordionPaddingW: number;
  accordionSpacing: number;
  accordionDividerEnabled: boolean;
  accordionDividerColor: string;
  accordionDividerWeight: number;
  // Accordion trigger typography
  accordionTriggerFontFamily: string;
  accordionTriggerFontSize: number;
  accordionTriggerFontWeight: number;
  accordionTriggerFontColor: string;
  accordionTriggerFontItalic: boolean;
  accordionTriggerFontBold: boolean;
  accordionTriggerFontUnderline: boolean;
  // Accordion icons
  accordionShowIcons: boolean;
  accordionIconPosition: 'left' | 'right';
  // Accordion content typography
  accordionContentFontFamily: string;
  accordionContentFontSize: number;
  accordionContentFontWeight: number;
  accordionContentFontColor: string;
  accordionContentFontItalic: boolean;
  accordionContentFontBold: boolean;
  accordionContentFontUnderline: boolean;
  // Avatar
  avatarSrc: string;
  avatarFallbackText: string;
  avatarShape: AvatarShape;
  avatarShowBadge: boolean;
  avatarBadgeColor: string;
  avatarRadius: number;
  avatarCustomSize: number;
  avatarBgColor: string;
  avatarBgColorTo: string;
  avatarBgMode: 'solid' | 'gradient';
  avatarBgOpacity: number;
  avatarStrokeWeight: number;
  avatarStrokeColor: string;
  avatarStrokeOpacity: number;
  avatarImageOpacity: number;
  avatarOverlayColor: string;
  avatarOverlayOpacity: number;
  avatarFontFamily: string;
  avatarFontSize: number;
  avatarFontBold: boolean;
  avatarFontItalic: boolean;
  avatarFontUnderline: boolean;
  avatarFontColor: string;
  // Avatar Group
  avatarGroupEnabled: boolean;
  avatarGroupCount: number;
  avatarGroupSpacing: number;
  // Avatar Popover
  avatarPopoverEnabled: boolean;
  avatarPopoverDelay: number;
  avatarPopoverPadding: number;
  avatarPopoverRadius: number;
  avatarPopoverWidth: number;
  avatarPopoverBgColor: string;
  avatarPopoverBgColorTo: string;
  avatarPopoverBgMode: 'solid' | 'gradient';
  avatarPopoverBgOpacity: number;
  avatarPopoverStrokeWeight: number;
  avatarPopoverStrokeColor: string;
  avatarPopoverStrokeOpacity: number;
  avatarPopoverFontFamily: string;
  avatarPopoverFontSize: number;
  avatarPopoverFontWeight: number;
  avatarPopoverFontBold: boolean;
  avatarPopoverFontItalic: boolean;
  avatarPopoverFontUnderline: boolean;
  avatarPopoverFontColor: string;
  avatarPopoverIconSize: number;
  avatarPopoverIconColor: string;
  // DataTable
  dataTableColumns: number;
  dataTableRows: number;
  dataTableSortable: boolean;
  dataTableStriped: boolean;
  dataTableHeaderBg: string;
  dataTableRowBg: string;
  dataTableStripedBg: string;
  dataTableVariant: 'default' | 'bordered';
  dataTableShowStatusBadge: boolean;
  dataTableBadgeSuccessColor: string;
  dataTableBadgeWarningColor: string;
  dataTableBadgeErrorColor: string;
  dataTableTextColor: string;
  dataTableHeaderTextColor: string;
  dataTableBorderColor: string;
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
  progressTrackColor: string;
  progressIndicatorColor: string;
  progressLabelColor: string;
  progressPlayAnimation: boolean;
  progressCircularSize: number;
  progressCircularStrokeWidth: number;
  // Skeleton
  skeletonVariant: SkeletonVariant;
  skeletonAnimationSpeed: number;
  skeletonLines: number;
  // Alert
  alertVariant: AlertVariant;
  alertDismissible: boolean;
  alertShowIcon: boolean;
  alertCloseHoverEnabled: boolean;
  alertCloseHoverScale: number;
  alertCloseTapEnabled: boolean;
  alertCloseTapScale: number;
  // Card (shared)
  cardVariant: CardVariant;
  cardShowImage: boolean;
  cardShowHeader: boolean;
  cardShowFooter: boolean;
  cardShowDividers: boolean;
  // Card (generic toggles)
  cardShowTitle: boolean;
  cardShowSubtitle: boolean;
  cardShowBody: boolean;
  cardShowButton: boolean;
  cardShowPrice: boolean;
  cardShowToggle: boolean;
  cardToggleText: string;
  cardButtonText: string;
  cardImageSrc: string;
  cardImagePosition: 'top' | 'bottom';
  cardPricePosition: 'top' | 'bottom';
  cardActionsPosition: 'top' | 'bottom';
  cardTitleText: string;
  cardTitleColor: string;
  cardTitleSize: number;
  cardTitleWeight: number;
  cardTitleAlign: FontPosition;
  cardSubtitleText: string;
  cardSubtitleColor: string;
  cardSubtitleSize: number;
  cardSubtitleWeight: number;
  cardSubtitleAlign: FontPosition;
  cardBodyText: string;
  cardBodyColor: string;
  cardBodySize: number;
  cardBodyWeight: number;
  cardBodyAlign: FontPosition;
  cardPriceText: string;
  cardPriceColor: string;
  cardPriceSize: number;
  cardPriceWeight: number;
  cardPriceAlign: FontPosition;
  cardDividerColor: string;
  cardDividerWidth: number;
  // Listing card toggles
  cardShowBadge: boolean;
  cardShowSpecs: boolean;
  cardShowPricing: boolean;
  cardShowCta: boolean;
  cardBadgeText: string;
  cardCtaText: string;
  // Switch
  switchChecked: boolean;
  switchDisabled: boolean;
  switchLabel: string;
  switchTrackColor: string;
  switchTrackActiveColor: string;
  switchThumbColor: string;
  switchThumbActiveColor: string;
  // Advanced Hover Effects (Premium — mouse-tracking interactions)
  motionHoverTiltEnabled: boolean;
  motionHoverTiltStrength: number;
  motionHoverGlareEnabled: boolean;
  motionHoverGlareColor: string;
  motionHoverGlareOpacity: number;
  motionHoverSpotlightEnabled: boolean;
  motionHoverSpotlightColor: string;
  motionHoverSpotlightSize: number;
  // Animated Text
  animatedTextVariant: AnimatedTextVariant;
  animatedTextContent: string;
  animatedTextSpeed: number;
  animatedTextStaggerDelay: number;
  animatedTextSplitBy: AnimatedTextSplitBy;
  animatedTextGradientColor1: string;
  animatedTextGradientColor2: string;
  animatedTextTrigger: AnimatedTextTrigger;
  animatedTextNumberValue: number;

  // ─── Phase 3: Refined Design Options ────────────────────────────
  // Typography
  fontFamily: string;
  fontItalic: boolean;
  fontUnderline: boolean;
  fontBold: boolean;
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
  // Filter (for blur-fade preset)
  motionInitialFilter: string;
  motionAnimateFilter: string;
  // Transform origin (for expand presets)
  motionTransformOrigin: string;
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
