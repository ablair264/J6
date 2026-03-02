import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Dialog as RadixDialogPrimitive } from 'radix-ui';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Checkbox as AnimatedCheckbox,
    CheckboxIndicator as AnimatedCheckboxIndicator,
} from '@/components/animate-ui/primitives/radix/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownItem,
    DropdownKeyboard,
    DropdownLabel,
} from '@/components/ui/dropdown';
import { ListBox } from 'react-aria-components';
import { cn } from '@/lib/utils';
import type { ComponentInstance, ComponentStyleConfig, UIComponentKind } from '@/components/ui/ui-studio.types';
import type { StudioTokenSet } from '@/components/ui/token-sets';
import {
    BUTTON_STATE_CLASS_NAME,
    PRESET_CHECKBOX_INDICATOR_SIZE,
    normalizeStyleConfig,
    SIZE_SCALE,
    mapSizeOptionToButtonSize,
    buildButtonPreviewStateClass,
} from '../constants';
import {
    buildPanelStyle,
    buildDropdownMenuPositionStyle,
    buildPrimitivePlacement,
    buildExtractedEffectsClassName,
    buildMotionClassName,
    buildPreviewPresentation,
    buildComponentWrapperStyle,
    extractTextStyle,
    getComponentVisualPreset,
    iconSnippet,
    renderConfiguredIcon,
    renderLoadingStateIcon,
    renderCheckboxSelectionIndicator,
    withIcon,
    styleToCode,
    buildSnippetStyleAttr,
    buildSnippetStyleBindings,
    buildSnippetClassNameAttr,
    buildSnippetClassNameVarAttr,
    buildExportClassBinding,
} from '../utilities';
import {
    buildEntryPresetMotionConfig,
    buildMotionTransition,
    renderEntryMotion,
    renderStaggeredChildren,
    renderWithMotionControls,
} from '../motion';
import { AlertPreview } from './alert-preview';
import { DrawerPreview } from './drawer-preview';
import { InteractiveDropdownPreview } from './dropdown-preview';
import { NavigationMenuPreview } from './navigation-menu-preview';
import type { ExportStyleMode } from '../utilities';

const MotionTooltipTrigger = motion.create(TooltipTrigger);

export function componentSnippet(
    instance: ComponentInstance,
    previewStyle: CSSProperties,
    _motionClassName?: string,
    styleMode: ExportStyleMode = 'inline',
    tokenSet?: StudioTokenSet,
): string {
    const previewBindings = buildSnippetStyleBindings(previewStyle, styleMode, 'preview', tokenSet);
    const panelBindings = buildSnippetStyleBindings(buildPanelStyle(instance.style), styleMode, 'content', tokenSet);
    const previewStyleSnippet = buildSnippetStyleAttr(previewBindings.styleVarName);
    const previewClassNameVar = styleMode === 'tailwind' ? previewBindings.classVarName : undefined;
    const contentStyleSnippet = buildSnippetStyleAttr(panelBindings.styleVarName);
    const contentClassNameVar = styleMode === 'tailwind' ? panelBindings.classVarName : undefined;
    const componentClassName = cn(
        getComponentVisualPreset(instance.kind, instance.style.componentPreset)?.className,
        buildMotionClassName(instance.kind, instance.style.motionPreset),
    );
    const effectClassName = buildExtractedEffectsClassName(instance.kind, instance.style);
    const rootClassBinding = buildExportClassBinding('root', {
        componentClassName,
        effectClassName,
        styleClassVarName: previewClassNameVar,
    });
    const buttonClassBinding = buildExportClassBinding('button', {
        componentClassName,
        effectClassName,
        extraClassNames: [BUTTON_STATE_CLASS_NAME],
        styleClassVarName: previewClassNameVar,
    });
    const animatedCheckboxClassBinding = buildExportClassBinding('animatedCheckbox', {
        componentClassName,
        effectClassName,
        extraClassNames: ['inline-flex items-center justify-center leading-none'],
        styleClassVarName: previewClassNameVar,
    });
    const checkboxClassBinding = buildExportClassBinding('checkbox', {
        componentClassName,
        effectClassName,
        styleClassVarName: previewClassNameVar,
    });
    const sliderClassBinding = buildExportClassBinding('slider', {
        componentClassName,
        effectClassName,
    });
    const classNameSnippet = buildSnippetClassNameVarAttr(rootClassBinding.classNameVar);
    const buttonClassNameSnippet = buildSnippetClassNameVarAttr(buttonClassBinding.classNameVar);
    const animatedCheckboxClassNameSnippet = buildSnippetClassNameVarAttr(animatedCheckboxClassBinding.classNameVar);
    const checkboxClassNameSnippet = buildSnippetClassNameVarAttr(checkboxClassBinding.classNameVar);
    const sliderClassNameSnippet = buildSnippetClassNameVarAttr(sliderClassBinding.classNameVar);

    const badgeText = instance.style.badgeShowText ? 'Badge token' : '';
    const buttonText = instance.style.buttonShowText ? 'Primary action' : '';
    const icon = iconSnippet(instance.style);
    const iconLeft = icon ? `${icon} ` : '';
    const iconRight = icon ? ` ${icon}` : '';
    const dropdownPositionStyleCode = styleToCode(buildDropdownMenuPositionStyle(instance.style));
    const tooltipPlacement = buildPrimitivePlacement(instance.style.tooltipSide, instance.style.tooltipAlign);
    const checkboxDefaultChecked =
        instance.style.checkboxState === 'indeterminate'
            ? "'indeterminate'"
            : instance.style.checkboxState === 'checked'
                ? 'true'
                : 'false';
    const animatedCheckboxCheckedSnippet =
        instance.style.checkboxState === 'indeterminate' ? `\n    checked="indeterminate"` : '';
    const animatedCheckboxDefaultCheckedSnippet =
        instance.style.checkboxState === 'indeterminate'
            ? ''
            : `\n    defaultChecked={${instance.style.checkboxState === 'checked' ? 'true' : 'false'}}`;
    const labelFor = instance.style.labelFor.trim() || 'field-id';
    const safeLabelText = instance.style.labelText.replace(/'/g, "\\'");
    const safeCheckboxName = instance.style.checkboxName.replace(/'/g, "\\'");
    const safeCheckboxValue = instance.style.checkboxValue.replace(/'/g, "\\'");
    const dropdownHoverClass =
        'data-[hovered]:!bg-[var(--ui-dropdown-hover-bg)] data-[focused]:!bg-[var(--ui-dropdown-hover-bg)] data-[hovered]:!text-[var(--ui-dropdown-hover-fg)] data-[focused]:!text-[var(--ui-dropdown-hover-fg)]';

    switch (instance.kind) {
        case 'accordion': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const accProps = [
                `type="${instance.style.accordionType}"`,
                instance.style.accordionType === 'single' ? `collapsible={${String(instance.style.accordionCollapsible)}}` : '',
                instance.style.accordionVariant !== 'default' ? `variant="${instance.style.accordionVariant}"` : '',
                instance.style.accordionDividerColor ? `dividerColor="${instance.style.accordionDividerColor}"` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<Accordion\n  ${accProps}${previewStyleSnippet}\n>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Section 1</AccordionTrigger>\n    <AccordionContent>Content for section 1.</AccordionContent>\n  </AccordionItem>\n</Accordion>`;
        }
        case 'alert': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Alert variant="${instance.style.alertVariant}" dismissible={${String(instance.style.alertDismissible)}}${classNameSnippet}${previewStyleSnippet}>\n  <AlertTitle>Alert Title</AlertTitle>\n  <AlertDescription>This is an alert message.</AlertDescription>\n</Alert>`;
        }
        case 'avatar': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Avatar shape="${instance.style.avatarShape}"${instance.style.avatarShowBadge ? ` badge badgeColor="${instance.style.avatarBadgeColor}"` : ''}${classNameSnippet}${previewStyleSnippet}>\n  ${instance.style.avatarSrc ? `<AvatarImage src="${instance.style.avatarSrc}" alt="User" />` : ''}\n  <AvatarFallback>${instance.style.avatarFallbackText}</AvatarFallback>\n</Avatar>`;
        }
        case 'badge': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Badge${classNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}${badgeText}${instance.style.iconPosition === 'right' ? iconRight : ''}</Badge>`;
        }
        case 'button': {
            const declarations = [previewBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Button intent="primary" size="md"${buttonClassNameSnippet}${previewStyleSnippet}>\n  ${instance.style.iconPosition === 'left' ? `${iconLeft}` : ''}${buttonText}${instance.style.iconPosition === 'right' ? `${iconRight}` : ''}\n</Button>`;
        }
        case 'checkbox':
            if (instance.style.componentPreset === 'checkbox-preset') {
                const declarations = [previewBindings.declarations, animatedCheckboxClassBinding.declarations].filter(Boolean).join('\n');
                return `${declarations ? `${declarations}\n\n` : ''}<div className="flex items-center gap-2">\n  <AnimatedCheckbox\n    id="checkbox-demo"${animatedCheckboxDefaultCheckedSnippet}${animatedCheckboxCheckedSnippet}\n    disabled={${String(instance.style.checkboxDisabled)}}\n    required={${String(instance.style.checkboxRequired)}}\n    name="${safeCheckboxName}"\n    value="${safeCheckboxValue}"\n    ${animatedCheckboxClassNameSnippet.trim()}${previewStyleSnippet}\n  >\n    <AnimatedCheckboxIndicator className="${PRESET_CHECKBOX_INDICATOR_SIZE[instance.style.size]} block shrink-0" />\n  </AnimatedCheckbox>\n  <Label htmlFor="checkbox-demo">Enable notifications</Label>\n</div>`;
            }
            {
                const declarations = [previewBindings.declarations, checkboxClassBinding.declarations].filter(Boolean).join('\n');
                return `${declarations ? `${declarations}\n\n` : ''}<div className="flex items-center gap-2">\n  <Checkbox\n    id="checkbox-demo"\n    defaultChecked={${checkboxDefaultChecked}}\n    disabled={${String(instance.style.checkboxDisabled)}}\n    required={${String(instance.style.checkboxRequired)}}\n    name="${safeCheckboxName}"\n    value="${safeCheckboxValue}"\n    ${checkboxClassNameSnippet.trim()}${previewStyleSnippet}\n  />\n  <Label htmlFor="checkbox-demo">Enable notifications</Label>\n</div>`;
            }
        case 'dialog': {
            const dialogDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${dialogDeclarations ? `${dialogDeclarations}\n\n` : ''}<DialogTriggerPrimitive defaultOpen={${String(instance.style.dialogDefaultOpen)}}>\n  <Button intent="primary"${buttonClassNameSnippet}${previewStyleSnippet}>Open dialog</Button>\n  <ModalOverlay isDismissable={${String(!instance.style.dialogModal)}}>\n    <Modal>\n      <Dialog${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>...</Dialog>\n    </Modal>\n  </ModalOverlay>\n</DialogTriggerPrimitive>`;
        }
        case 'dropdown': {
            const dropdownDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations, `const dropdownPositionStyle = ${dropdownPositionStyleCode};`]
                .filter(Boolean)
                .join('\n');
            const dropdownListClassNameSnippet = buildSnippetClassNameAttr(
                'grid min-w-[220px] grid-cols-[auto_1fr] gap-y-1 rounded-xl p-1',
                contentClassNameVar,
            );
            return `${dropdownDeclarations}\n\n<div className="flex w-full justify-center py-14">\n  <div className="relative inline-flex">\n    <Button intent="secondary" size="sm"${buttonClassNameSnippet}${previewStyleSnippet}>Menu trigger</Button>\n    <div style={dropdownPositionStyle}>\n      <ListBox aria-label="Dropdown preview"${dropdownListClassNameSnippet}${contentStyleSnippet}>\n        <DropdownItem id="edit" className="${dropdownHoverClass}">\n          <DropdownLabel>${instance.style.iconPosition === 'left' ? iconLeft : ''}Edit component${instance.style.iconPosition === 'right' ? iconRight : ''}</DropdownLabel>\n          <DropdownKeyboard>⌘E</DropdownKeyboard>\n        </DropdownItem>\n      </ListBox>\n    </div>\n  </div>\n</div>`;
        }
        case 'popover': {
            const popoverDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${popoverDeclarations}\n\n<Popover>\n  <PopoverTrigger${buttonClassNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Toggle popover${instance.style.iconPosition === 'right' ? iconRight : ''}</PopoverTrigger>\n  <PopoverContent${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>...</PopoverContent>\n</Popover>`;
        }
        case 'label':
            {
                const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
                return `${declarations ? `${declarations}\n\n` : ''}<div className="flex items-center justify-center">\n  <Label htmlFor="${labelFor}"${classNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}${safeLabelText}${instance.style.iconPosition === 'right' ? iconRight : ''}</Label>\n  ${instance.style.labelShowField ? `<Input id="${labelFor}" placeholder="Linked field" />` : `<div id="${labelFor}" />`}\n</div>`;
            }
        case 'input': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Input${classNameSnippet}${previewStyleSnippet} placeholder="Type here..." />`;
        }
        case 'tabs': {
            const tabDeclarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const listProps = [
                instance.style.tabsVariant !== 'default' ? `variant="${instance.style.tabsVariant}"` : '',
                instance.style.tabsListBg ? `listBg="${instance.style.tabsListBg}"` : '',
            ].filter(Boolean).join(' ');
            const listAttr = listProps ? ` ${listProps}` : '';
            const activeBgAttr = instance.style.tabsActiveBg ? ` activeBg="${instance.style.tabsActiveBg}"` : '';
            return `${tabDeclarations ? `${tabDeclarations}\n\n` : ''}<Tabs defaultValue="tab-1">\n  <TabsList${listAttr}>\n    <TabsTrigger value="tab-1"${activeBgAttr}${classNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Tab 1${instance.style.iconPosition === 'right' ? iconRight : ''}</TabsTrigger>\n    <TabsTrigger value="tab-2"${activeBgAttr}${classNameSnippet}${previewStyleSnippet}>Tab 2</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab-1">Tab content</TabsContent>\n</Tabs>`;
        }
        case 'tooltip': {
            const tooltipDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${tooltipDeclarations}\n\n<Tooltip delay={${instance.style.tooltipDelay}}>\n  <TooltipTrigger${buttonClassNameSnippet}${previewStyleSnippet}>${instance.style.iconPosition === 'left' ? iconLeft : ''}Hover for tooltip${instance.style.iconPosition === 'right' ? iconRight : ''}</TooltipTrigger>\n  <TooltipContent arrow={${String(instance.style.tooltipArrow)}} placement="${tooltipPlacement}" offset={${instance.style.tooltipSideOffset}}${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>Tooltip copy</TooltipContent>\n</Tooltip>`;
        }
        case 'data-table': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            const dtProps = [
                `columns={[{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }, { key: 'role', label: 'Role' }]}`,
                `data={[{ name: 'Alice', status: 'Active', role: 'Admin' }]}`,
                `sortable={${String(instance.style.dataTableSortable)}}`,
                `striped={${String(instance.style.dataTableStriped)}}`,
                `size="${instance.style.size}"`,
                instance.style.dataTableHeaderBg ? `headerBg="${instance.style.dataTableHeaderBg}"` : '',
                instance.style.dataTableStripedBg ? `stripedBg="${instance.style.dataTableStripedBg}"` : '',
                classNameSnippet.trim(),
            ].filter(Boolean).join('\n  ');
            return `${declarations ? `${declarations}\n\n` : ''}<DataTable\n  ${dtProps}${previewStyleSnippet}\n/>`;
        }
        case 'drawer': {
            const drawerDeclarations = [previewBindings.declarations, panelBindings.declarations, buttonClassBinding.declarations].filter(Boolean).join('\n');
            return `${drawerDeclarations ? `${drawerDeclarations}\n\n` : ''}<Drawer>\n  <DrawerTrigger asChild>\n    <Button${buttonClassNameSnippet}${previewStyleSnippet}>Open drawer</Button>\n  </DrawerTrigger>\n  <DrawerContent side="${instance.style.drawerSide}"${buildSnippetClassNameAttr(undefined, contentClassNameVar)}${contentStyleSnippet}>\n    <DrawerHeader>\n      <DrawerTitle>Drawer</DrawerTitle>\n      <DrawerDescription>Drawer panel content.</DrawerDescription>\n    </DrawerHeader>\n  </DrawerContent>\n</Drawer>`;
        }
        case 'navigation-menu': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<NavigationMenu orientation="${instance.style.navMenuOrientation}"${classNameSnippet}${previewStyleSnippet}>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuLink active>Home</NavigationMenuLink>\n    </NavigationMenuItem>\n    <NavigationMenuItem>\n      <NavigationMenuLink>About</NavigationMenuLink>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>`;
        }
        case 'progress': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<Progress\n  value={${instance.style.progressValue}}\n  variant="${instance.style.progressVariant}"\n  showLabel={${String(instance.style.progressShowLabel)}}\n  ${classNameSnippet.trim()}${previewStyleSnippet}\n/>`;
        }
        case 'skeleton': {
            const declarations = [previewBindings.declarations, rootClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<div className="space-y-2">\n  <Skeleton variant="${instance.style.skeletonVariant}"${classNameSnippet}${previewStyleSnippet} />\n  ${instance.style.skeletonLines > 1 ? `<Skeleton variant="text" />\n  ` : ''}${instance.style.skeletonLines > 2 ? '<Skeleton variant="text" className="w-3/4" />' : ''}\n</div>`;
        }
        case 'slider': {
            const declarations = [previewBindings.declarations, sliderClassBinding.declarations].filter(Boolean).join('\n');
            return `${declarations ? `${declarations}\n\n` : ''}<div${buildSnippetClassNameAttr(undefined, previewClassNameVar)}${previewStyleSnippet}>\n  <Slider${sliderClassNameSnippet} defaultValue={[55]} max={100} step={1} />\n</div>`;
        }
        default:
            return '';
    }
}

export function renderPreview(
    instance: ComponentInstance,
    style: CSSProperties,
    motionClassName?: string,
    options?: { pinOverlayOpen?: boolean },
) {
    const pinOverlayOpen = options?.pinOverlayOpen === true;
    const panelStyle = buildPanelStyle(instance.style);
    const dropdownMenuPositionStyle = buildDropdownMenuPositionStyle(instance.style);
    const tooltipPlacement = buildPrimitivePlacement(instance.style.tooltipSide, instance.style.tooltipAlign);
    const checkboxDefaultChecked =
        instance.style.checkboxState === 'indeterminate'
            ? 'indeterminate'
            : instance.style.checkboxState === 'checked'
                ? true
                : false;
    const animatedCheckboxChecked =
        instance.style.checkboxState === 'indeterminate' ? ('indeterminate' as const) : undefined;
    const animatedCheckboxDefaultChecked = instance.style.checkboxState === 'checked';
    const labelFor = instance.style.labelFor.trim() || `${instance.id}-label-field`;
    const labelText = instance.style.labelText.trim() || 'Monthly rental';
    const badgeText = instance.style.badgeShowText ? 'Badge token' : '';
    const buttonText = instance.style.buttonShowText ? 'Primary action' : '';
    const icon = renderConfiguredIcon(instance.style, 'shrink-0');
    const loadingStateIcon = renderLoadingStateIcon(instance.style, instance.kind);
    const previewIcon = loadingStateIcon ?? icon;
    const dropdownHoverClass =
        'data-[hovered]:!bg-[var(--ui-dropdown-hover-bg)] data-[focused]:!bg-[var(--ui-dropdown-hover-bg)] data-[hovered]:!text-[var(--ui-dropdown-hover-fg)] data-[focused]:!text-[var(--ui-dropdown-hover-fg)]';
    const scaledControl = {
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        minHeight:
            instance.style.customHeight > 0
                ? `${instance.style.customHeight}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        minWidth:
            instance.style.customWidth > 0
                ? `${instance.style.customWidth}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        width:
            instance.style.customWidth > 0
                ? `${instance.style.customWidth}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        height:
            instance.style.customHeight > 0
                ? `${instance.style.customHeight}px`
                : `${Math.round(22 * SIZE_SCALE[instance.style.size])}px`,
        paddingInline: 0,
    } satisfies CSSProperties;
    const buttonPreviewStateClass = buildButtonPreviewStateClass(instance.style.buttonPreviewState);

    switch (instance.kind) {
        case 'badge':
            return (
                <Badge style={style} className={cn('max-w-full overflow-hidden', motionClassName)}>
                    {withIcon(badgeText, previewIcon, instance.style.iconPosition)}
                </Badge>
            );

        case 'button': {
            return (
                <Button
                    variant="default"
                    size={mapSizeOptionToButtonSize(instance.style.size)}
                    disabled={instance.style.buttonPreviewState === 'disabled'}
                    style={style}
                    className={cn('max-w-full overflow-hidden', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                >
                    {withIcon(buttonText, previewIcon, instance.style.iconPosition)}
                </Button>
            );
        }

        case 'checkbox': {
            const checkboxId = `${instance.id}-checkbox`;
            const checkboxMotionConfig = normalizeStyleConfig({
                ...instance.style,
                motionEntryEnabled: false,
                motionHoverEnabled: instance.style.checkboxHoverEnabled,
                motionTapEnabled: instance.style.checkboxTapEnabled,
                motionHoverScale: instance.style.checkboxHoverScale,
                motionTapScale: instance.style.checkboxTapScale,
            });
            return (
                <div
                    className="flex items-center gap-3"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    {renderWithMotionControls(
                        <AnimatedCheckbox
                            id={checkboxId}
                            defaultChecked={animatedCheckboxDefaultChecked}
                            checked={animatedCheckboxChecked}
                            disabled={instance.style.checkboxDisabled}
                            required={instance.style.checkboxRequired}
                            name={instance.style.checkboxName}
                            value={instance.style.checkboxValue}
                            style={scaledControl}
                            className={cn('inline-flex items-center justify-center leading-none', motionClassName)}
                        >
                            <AnimatedCheckboxIndicator
                                className={cn(
                                    PRESET_CHECKBOX_INDICATOR_SIZE[instance.style.size],
                                    'ui-studio-checkbox-indicator block shrink-0',
                                )}
                            >
                                {renderCheckboxSelectionIndicator(instance.style)}
                            </AnimatedCheckboxIndicator>
                        </AnimatedCheckbox>,
                        checkboxMotionConfig,
                        false,
                        true,
                    )}
                    <Label htmlFor={checkboxId} style={{ color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight }}>
                        Enable notifications
                    </Label>
                </div>
            );
        }

        case 'dialog':
            {
                const dialogBodyMotion = buildEntryPresetMotionConfig('dialog', instance.style, instance.style.dialogBodyMotionPresetId);
                const dialogTextMotion = buildEntryPresetMotionConfig('dialog', instance.style, instance.style.dialogTextMotionPresetId);
                const dialogBody = renderEntryMotion(
                    <div className="space-y-3 p-5">
                        {renderEntryMotion(
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold">Dialog preview</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Styled with your current controls.</p>
                                    </div>
                                    {pinOverlayOpen ? (
                                        <button
                                            type="button"
                                            className="inline-flex size-7 items-center justify-center rounded-md border border-white/15 text-sm text-[#d9e5f7]"
                                            aria-label="Close dialog"
                                            tabIndex={-1}
                                        >
                                            ×
                                        </button>
                                    ) : (
                                        <RadixDialogPrimitive.Close asChild>
                                            <button
                                                type="button"
                                                className="inline-flex size-7 items-center justify-center rounded-md border border-white/15 text-sm text-[#d9e5f7] transition hover:bg-white/10"
                                                aria-label="Close dialog"
                                            >
                                                ×
                                            </button>
                                        </RadixDialogPrimitive.Close>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">Use this to test border, fill, font, and effect settings.</p>
                            </div>,
                            dialogTextMotion,
                        )}
                        <div className="flex justify-end">
                            {pinOverlayOpen ? (
                                <Button variant="outline" size="sm" tabIndex={-1}>
                                    Close
                                </Button>
                            ) : (
                                <RadixDialogPrimitive.Close asChild>
                                    <Button variant="outline" size="sm">
                                        Close
                                    </Button>
                                </RadixDialogPrimitive.Close>
                            )}
                        </div>
                    </div>,
                    dialogBodyMotion,
                );

                if (pinOverlayOpen) {
                    return (
                        <div
                            className="relative flex min-h-[360px] w-[min(100%,760px)] items-center justify-center overflow-hidden rounded-[28px]"
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                        >
                            <div
                                className={cn(
                                    'absolute inset-0',
                                    instance.style.dialogModal ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-black/10 backdrop-blur-none',
                                )}
                            />
                            <div className="relative z-10 h-fit w-[min(92vw,430px)] overflow-hidden rounded-xl shadow-2xl outline-none" style={panelStyle}>
                                {dialogBody}
                            </div>
                        </div>
                    );
                }

                return (
                    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                        <RadixDialogPrimitive.Root defaultOpen={instance.style.dialogDefaultOpen} modal={instance.style.dialogModal}>
                            <RadixDialogPrimitive.Trigger asChild>
                                {renderWithMotionControls(
                                    <Button
                                        variant="default"
                                        size={mapSizeOptionToButtonSize(instance.style.size)}
                                        disabled={instance.style.buttonPreviewState === 'disabled'}
                                        style={style}
                                        className={cn('max-w-full overflow-hidden', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                                    >
                                        {withIcon('Open dialog', icon, instance.style.iconPosition)}
                                    </Button>,
                                    instance.style,
                                    false,
                                    true,
                                )}
                            </RadixDialogPrimitive.Trigger>
                            <RadixDialogPrimitive.Portal>
                                <RadixDialogPrimitive.Overlay
                                    className={cn(
                                        'fixed inset-0 z-50',
                                        instance.style.dialogModal ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-black/10 backdrop-blur-none',
                                    )}
                                />
                                <RadixDialogPrimitive.Content className="fixed inset-0 z-50 m-auto h-fit w-[min(92vw,430px)] overflow-hidden rounded-xl shadow-2xl outline-none" style={panelStyle}>
                                    {dialogBody}
                                </RadixDialogPrimitive.Content>
                            </RadixDialogPrimitive.Portal>
                        </RadixDialogPrimitive.Root>
                    </div>
                );
            }

        case 'dropdown':
            return (
                <InteractiveDropdownPreview
                    instanceId={instance.id}
                    triggerStyle={style}
                    triggerClassName={motionClassName}
                    panelStyle={panelStyle}
                    menuStyle={dropdownMenuPositionStyle}
                    motionConfig={instance.style}
                    iconNode={icon}
                    iconPosition={instance.style.iconPosition}
                    dropdownHoverClass={dropdownHoverClass}
                    pinnedOpen={pinOverlayOpen}
                />
            );

        case 'popover':
            {
                const popoverBodyMotion = buildEntryPresetMotionConfig('popover', instance.style, instance.style.popoverBodyMotionPresetId);
                const popoverTextMotion = buildEntryPresetMotionConfig('popover', instance.style, instance.style.popoverTextMotionPresetId);
                return (
                    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                        <Popover open={pinOverlayOpen ? true : undefined}>
                            <PopoverTrigger asChild>
                                {renderWithMotionControls(
                                    <Button
                                        variant="default"
                                        size={instance.style.size === 'sm' ? 'sm' : instance.style.size === 'lg' ? 'lg' : 'default'}
                                        disabled={instance.style.buttonPreviewState === 'disabled'}
                                        style={style}
                                        className={cn('max-w-full overflow-hidden', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass, motionClassName)}
                                    >
                                        {withIcon('Toggle popover', icon, instance.style.iconPosition)}
                                    </Button>,
                                    instance.style,
                                    false,
                                    true,
                                )}
                            </PopoverTrigger>
                            <PopoverContent className="w-72" style={panelStyle}>
                                {renderEntryMotion(
                                    <div className="space-y-2">
                                        {renderEntryMotion(
                                            <div className="space-y-2">
                                                <PopoverHeader>
                                                    <PopoverTitle>Popover preview</PopoverTitle>
                                                    <PopoverDescription>Styled from the side controls.</PopoverDescription>
                                                </PopoverHeader>
                                                <p className="text-sm text-muted-foreground">Update fill, stroke, and effects to see this change in real time.</p>
                                            </div>,
                                            popoverTextMotion,
                                        )}
                                    </div>,
                                    popoverBodyMotion,
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            }

        case 'label':
            return (
                <div className="flex w-full items-center justify-center">
                    <div className="flex max-w-full items-center gap-3">
                        {instance.style.labelShowField ? (
                            <Input id={labelFor} placeholder="Linked field" className="w-[180px]" />
                        ) : (
                            <div id={labelFor} className="size-3 rounded-full bg-primary/30" />
                        )}
                        <Label style={style} className="inline-flex max-w-full items-center overflow-hidden">
                            {withIcon(labelText, icon, instance.style.iconPosition)}
                        </Label>
                    </div>
                </div>
            );

        case 'input':
            {
                const autocompleteMotion = buildEntryPresetMotionConfig('input', instance.style, instance.style.inputAutocompleteBodyMotionPresetId);
                return (
                    <div className="w-full max-w-sm space-y-2">
                        <div className="relative w-full">
                            <Input style={style} placeholder="Type here..." className={cn('max-w-sm', motionClassName)} />
                            {loadingStateIcon ? (
                                <span
                                    className={cn(
                                        'pointer-events-none absolute top-1/2 -translate-y-1/2 text-current',
                                        instance.style.effectLoadingPosition === 'left' ? 'left-3' : 'right-3',
                                    )}
                                >
                                    {loadingStateIcon}
                                </span>
                            ) : null}
                        </div>
                        {instance.style.inputAutocompleteEnabled ? (
                            renderEntryMotion(
                                <div className="rounded-lg border border-white/10 bg-[#0f172a]/90 px-2 py-1.5 text-[11px] text-[#dbe7f8] shadow-lg">
                                    <div className="rounded px-1.5 py-1 hover:bg-white/8">Autocomplete option</div>
                                    <div className="rounded px-1.5 py-1 hover:bg-white/8">Another result</div>
                                </div>,
                                autocompleteMotion,
                            )
                        ) : null}
                    </div>
                );
            }

        case 'tabs': {
            const triggerStyle = {
                ...extractTextStyle(style),
                borderRadius: style.borderRadius,
                minHeight: `${Math.round(32 * SIZE_SCALE[instance.style.size])}px`,
            } satisfies CSSProperties;
            const tabsBodyMotion = buildEntryPresetMotionConfig('tabs', instance.style, instance.style.tabsBodyMotionPresetId);
            const tabsTextMotion = buildEntryPresetMotionConfig('tabs', instance.style, instance.style.tabsTextMotionPresetId);
            const tabLabels = ['Style', 'Effects', 'Layout', 'Tokens', 'Export'];
            const tabCount = instance.style.tabsCount;

            return (
                <Tabs defaultValue="tab-0" className="w-full max-w-md">
                    <TabsList
                        variant={instance.style.tabsVariant}
                        listBg={instance.style.tabsListBg || undefined}
                        className={cn(instance.style.tabsUnderlineMotionEnabled && 'ui-studio-tabs-underline')}
                        style={{ borderRadius: style.borderRadius, boxShadow: style.boxShadow }}
                    >
                        {Array.from({ length: tabCount }, (_, i) => (
                            <TabsTrigger
                                key={i}
                                value={`tab-${i}`}
                                style={triggerStyle}
                                activeBg={instance.style.tabsActiveBg || undefined}
                                className={cn('max-w-full overflow-hidden', instance.style.tabsUnderlineMotionEnabled && 'ui-studio-tabs-underline-trigger')}
                            >
                                {i === 0
                                    ? renderWithMotionControls(withIcon(tabLabels[i] ?? `Tab ${i + 1}`, icon, instance.style.iconPosition), instance.style, false, true)
                                    : renderWithMotionControls(tabLabels[i] ?? `Tab ${i + 1}`, instance.style, false, true)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {Array.from({ length: tabCount }, (_, i) => (
                        <TabsContent key={i} value={`tab-${i}`} className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                            {renderEntryMotion(
                                renderEntryMotion(<span>{tabLabels[i] ?? `Tab ${i + 1}`} tab body</span>, tabsTextMotion),
                                tabsBodyMotion,
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            );
        }

        case 'tooltip':
            {
                const tooltipBodyMotion = buildEntryPresetMotionConfig('tooltip', instance.style, instance.style.tooltipBodyMotionPresetId);
                const tooltipTextMotion = buildEntryPresetMotionConfig('tooltip', instance.style, instance.style.tooltipTextMotionPresetId);
                const tooltipTriggerHover = instance.style.motionHoverEnabled
                    ? {
                        scale: instance.style.motionHoverScale / 100,
                        x: instance.style.motionHoverX,
                        y: instance.style.motionHoverY,
                        rotate: instance.style.motionHoverRotate,
                        opacity: instance.style.motionHoverOpacity / 100,
                        transition: buildMotionTransition(instance.style, 'hover'),
                    }
                    : undefined;
                const tooltipTriggerTap = instance.style.motionTapEnabled
                    ? {
                        scale: instance.style.motionTapScale / 100,
                        x: instance.style.motionTapX,
                        y: instance.style.motionTapY,
                        rotate: instance.style.motionTapRotate,
                        opacity: instance.style.motionTapOpacity / 100,
                        transition: buildMotionTransition(instance.style, 'tap'),
                    }
                    : undefined;
                return (
                    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                        <Tooltip delay={instance.style.tooltipDelay} isOpen={pinOverlayOpen ? true : undefined}>
                            <MotionTooltipTrigger
                                style={style}
                                className={cn(
                                    'inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-lg border border-border px-3 py-2',
                                    BUTTON_STATE_CLASS_NAME,
                                    buttonPreviewStateClass,
                                    motionClassName,
                                )}
                                whileHover={tooltipTriggerHover}
                                whileTap={tooltipTriggerTap}
                            >
                                <span className="inline-flex min-w-0 max-w-full items-center overflow-hidden">
                                    {withIcon('Hover for tooltip', icon, instance.style.iconPosition)}
                                </span>
                            </MotionTooltipTrigger>
                            <TooltipContent arrow={instance.style.tooltipArrow} placement={tooltipPlacement as never} offset={instance.style.tooltipSideOffset} style={panelStyle}>
                                {renderEntryMotion(
                                    renderEntryMotion(<span>Adjustable tooltip content</span>, tooltipTextMotion),
                                    tooltipBodyMotion,
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            }

        case 'slider':
            return (
                <div className={cn('w-full max-w-sm rounded-xl p-4', BUTTON_STATE_CLASS_NAME, buttonPreviewStateClass)} style={buildComponentWrapperStyle(style, 'slider')}>
                    <div className="flex items-center gap-2">
                        {instance.style.componentPreset === 'slider-elastic' ? <span className="text-sm text-muted-foreground">-</span> : null}
                        <Slider className={cn('ui-studio-slider-motion', motionClassName)} defaultValue={[55]} max={100} step={1} />
                        {instance.style.componentPreset === 'slider-elastic' ? <span className="text-sm text-muted-foreground">+</span> : null}
                    </div>
                </div>
            );

        case 'accordion': {
            const items = Array.from({ length: instance.style.accordionItemCount }, (_, i) => i + 1);
            const accordionProps = instance.style.accordionType === 'single'
                ? { type: 'single' as const, collapsible: instance.style.accordionCollapsible }
                : { type: 'multiple' as const };
            const accordionItems = items.map((n) => (
                <AccordionItem key={n} value={`item-${n}`}>
                    <AccordionTrigger>Section {n}</AccordionTrigger>
                    <AccordionContent>Content for section {n}.</AccordionContent>
                </AccordionItem>
            ));
            const staggeredItems = renderStaggeredChildren(accordionItems, instance.style);
            return (
                <div className="w-full max-w-md" style={buildComponentWrapperStyle(style, 'accordion')}>
                    <Accordion
                        {...accordionProps}
                        variant={instance.style.accordionVariant}
                        dividerColor={instance.style.accordionDividerColor || undefined}
                        className={cn(motionClassName)}
                    >
                        {staggeredItems}
                    </Accordion>
                </div>
            );
        }

        case 'alert':
            return (
                <AlertPreview
                    alertVariant={instance.style.alertVariant}
                    alertDismissible={instance.style.alertDismissible}
                    alertShowIcon={instance.style.alertShowIcon}
                    style={style}
                    motionClassName={motionClassName}
                />
            );

        case 'avatar':
            return (
                <div className="relative inline-flex">
                    <Avatar
                        shape={instance.style.avatarShape}
                        size={instance.style.size}
                        style={buildComponentWrapperStyle(style, 'avatar')}
                        className={cn(motionClassName)}
                    >
                        {instance.style.avatarSrc ? (
                            <AvatarImage src={instance.style.avatarSrc} alt="User" />
                        ) : null}
                        <AvatarFallback>{instance.style.avatarFallbackText}</AvatarFallback>
                    </Avatar>
                    {instance.style.avatarShowBadge && (
                        <span
                            className={cn(
                                'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
                                instance.style.size === 'sm' ? 'size-2' : instance.style.size === 'lg' ? 'size-3.5' : 'size-2.5',
                            )}
                            style={{ backgroundColor: instance.style.avatarBadgeColor }}
                        />
                    )}
                </div>
            );

        case 'data-table': {
            const columns = Array.from({ length: instance.style.dataTableColumns }, (_, i) => ({
                key: `col${i}`,
                label: ['Name', 'Status', 'Role', 'Email', 'Department'][i] ?? `Column ${i + 1}`,
            }));
            const sampleRows = [
                ['Alice', 'Active', 'Admin', 'alice@co.com', 'Engineering'],
                ['Bob', 'Inactive', 'User', 'bob@co.com', 'Design'],
                ['Carol', 'Active', 'Editor', 'carol@co.com', 'Marketing'],
                ['Dave', 'Pending', 'Viewer', 'dave@co.com', 'Sales'],
                ['Eve', 'Active', 'Admin', 'eve@co.com', 'Product'],
            ];
            const data = Array.from({ length: instance.style.dataTableRows }, (_, rowIdx) =>
                Object.fromEntries(columns.map((col, colIdx) => [col.key, sampleRows[rowIdx % 5]?.[colIdx] ?? `R${rowIdx + 1}`]))
            );
            return (
                <div className="w-full max-w-lg overflow-auto" style={buildComponentWrapperStyle(style, 'data-table')}>
                    <DataTable
                        columns={columns}
                        data={data}
                        sortable={instance.style.dataTableSortable}
                        striped={instance.style.dataTableStriped}
                        size={instance.style.size}
                        headerBg={instance.style.dataTableHeaderBg || undefined}
                        stripedBg={instance.style.dataTableStripedBg || undefined}
                        className={cn(motionClassName)}
                    />
                </div>
            );
        }

        case 'drawer':
            return (
                <DrawerPreview
                    instanceStyle={instance.style}
                    triggerStyle={style}
                    panelStyle={panelStyle}
                    motionClassName={motionClassName}
                    pinnedOpen={pinOverlayOpen}
                />
            );

        case 'navigation-menu':
            return (
                <NavigationMenuPreview
                    instanceStyle={instance.style}
                    style={style}
                    motionClassName={motionClassName}
                />
            );

        case 'progress':
            return (
                <div className="w-full max-w-sm" style={buildComponentWrapperStyle(style, 'progress')}>
                    <Progress
                        value={instance.style.progressValue}
                        variant={instance.style.progressVariant}
                        size={instance.style.size}
                        showLabel={instance.style.progressShowLabel}
                        className={cn(motionClassName)}
                        style={{ borderRadius: style.borderRadius, boxShadow: style.boxShadow }}
                    />
                </div>
            );

        case 'skeleton': {
            const animSpeed = instance.style.skeletonAnimationSpeed <= 0.75 ? 'fast' as const
                : instance.style.skeletonAnimationSpeed >= 1.5 ? 'slow' as const
                : 'normal' as const;
            const skeletonPassthrough = { borderRadius: style.borderRadius, boxShadow: style.boxShadow };
            return (
                <div className="w-full max-w-sm space-y-2" style={buildComponentWrapperStyle(style, 'skeleton')}>
                    <Skeleton
                        variant={instance.style.skeletonVariant}
                        animationSpeed={animSpeed}
                        className={cn(motionClassName)}
                        style={skeletonPassthrough}
                    />
                    {instance.style.skeletonLines > 1 && <Skeleton variant="text" animationSpeed={animSpeed} style={skeletonPassthrough} />}
                    {instance.style.skeletonLines > 2 && <Skeleton variant="text" animationSpeed={animSpeed} className="w-3/4" style={skeletonPassthrough} />}
                </div>
            );
        }

        default:
            return null;
    }
}

export { buildPreviewPresentation };
