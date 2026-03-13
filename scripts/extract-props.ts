/**
 * extract-props.ts
 * Extracts TypeScript interface props from component files and writes them
 * to src/registry/generated-props.ts
 *
 * Strategy:
 *   - For named interfaces: extract ONLY the "own" properties declared directly
 *     in that interface (not inherited from HTML / Radix base types).
 *   - For inline function params (no named interface): extract ONLY props
 *     that are declared in the intersection's custom type literal members.
 *   - CVA VariantProps: resolved by reading the cva() call in the same file.
 *
 * Run with: pnpm run extract-props
 */

import {
  Project,
  InterfaceDeclaration,
  Node,
  SyntaxKind,
  TypeAliasDeclaration,
  FunctionDeclaration,
  ArrowFunction,
  FunctionExpression,
  ObjectBindingPattern,
  SourceFile,
} from "ts-morph";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "src/registry/generated-props.ts");

export interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Target map
// ---------------------------------------------------------------------------

type ComponentTarget = {
  file: string;
  /** Named interfaces whose OWN properties we extract */
  interfaces?: string[];
  /**
   * For inline-param components: the function whose parameter destructuring
   * we inspect. We collect props only from the CUSTOM intersection members.
   * Supports array for multiple components in same file (props are merged).
   */
  primaryExport?: string;
};

const TARGETS: Record<string, ComponentTarget> = {
  accordion: {
    file: "src/components/ui/accordion.tsx",
    interfaces: ["AccordionProps"],
  },
  alert: {
    file: "src/components/ui/alert.tsx",
    interfaces: ["AlertProps"],
  },
  "animated-text": {
    file: "src/components/ui/animated-text.tsx",
    interfaces: ["AnimatedTextProps"],
  },
  avatar: {
    file: "src/components/ui/avatar.tsx",
    interfaces: ["AvatarProps"],
  },
  badge: {
    file: "src/components/ui/badge.tsx",
    primaryExport: "Badge",
  },
  button: {
    file: "src/components/ui/button.tsx",
    primaryExport: "Button",
  },
  card: {
    file: "src/components/ui/card.tsx",
    interfaces: ["CardProps"],
  },
  checkbox: {
    file: "src/components/ui/checkbox.tsx",
    primaryExport: "Checkbox",
  },
  "data-table": {
    file: "src/components/ui/data-table.tsx",
    interfaces: ["DataTableProps", "DataTableColumn"],
  },
  dialog: {
    file: "src/components/ui/dialog.tsx",
    interfaces: ["DialogHeaderProps", "DialogBodyProps"],
  },
  drawer: {
    file: "src/components/ui/drawer.tsx",
    interfaces: ["DrawerContentProps"],
    primaryExport: "DrawerContent",
  },
  "dropdown-menu": {
    file: "src/components/ui/dropdown-menu.tsx",
    primaryExport: "DropdownMenuContent",
  },
  input: {
    file: "src/components/ui/input.tsx",
    primaryExport: "Input",
  },
  "navigation-menu": {
    file: "src/components/ui/navigation-menu.tsx",
    primaryExport: "NavigationMenu",
  },
  popover: {
    file: "src/components/ui/popover.tsx",
    primaryExport: "PopoverContent",
  },
  progress: {
    file: "src/components/ui/progress.tsx",
    interfaces: ["ProgressProps"],
  },
  slider: {
    file: "src/components/ui/slider.tsx",
    primaryExport: "Slider",
  },
  switch: {
    file: "src/components/ui/switch.tsx",
    primaryExport: "Switch",
  },
  tabs: {
    file: "src/components/ui/tabs.tsx",
    primaryExport: "TabsList",
  },
  tooltip: {
    file: "src/components/ui/tooltip.tsx",
    interfaces: ["TooltipContentProps"],
  },
  "stateful-button": {
    file: "src/components/ui/stateful-button.tsx",
    interfaces: ["StatefulButtonProps"],
  },
};

// ---------------------------------------------------------------------------
// ts-morph project setup
// ---------------------------------------------------------------------------

const project = new Project({
  tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
  addFilesFromTsConfig: false,
  skipAddingFilesFromTsConfig: true,
  compilerOptions: {
    skipLibCheck: true,
    noEmit: true,
  },
});

// ---------------------------------------------------------------------------
// Helpers: JSDoc, type cleaning
// ---------------------------------------------------------------------------

function cleanType(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

function getJsDocComment(node: Node): string | undefined {
  const jsDoc = node.getChildrenOfKind(SyntaxKind.JSDoc);
  if (jsDoc.length === 0) return undefined;
  const comment = jsDoc[jsDoc.length - 1].getComment();
  if (typeof comment === "string") return comment.trim() || undefined;
  if (Array.isArray(comment)) {
    const text = comment.map((c) => (typeof c === "string" ? c : c.getText())).join("").trim();
    return text || undefined;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// CVA variant extraction
// Reads `const xyzVariants = cva(base, { variants: { foo: { a: ..., b: ... } } })`
// and returns prop definitions like { name: "foo", type: '"a" | "b" | undefined', required: false }
// ---------------------------------------------------------------------------

function extractCvaProps(
  sourceFile: SourceFile,
  cvaVariableName: string,
  defaults: Map<string, string>
): RegistryProp[] {
  const props: RegistryProp[] = [];

  const varDecl = sourceFile.getVariableDeclaration(cvaVariableName);
  if (!varDecl) return props;

  const init = varDecl.getInitializer();
  if (!init || !Node.isCallExpression(init)) return props;

  const args = init.getArguments();
  // cva(base, { variants: { ... }, defaultVariants: { ... } })
  const optionsArg = args[1];
  if (!optionsArg || !Node.isObjectLiteralExpression(optionsArg)) return props;

  const variantsProp = optionsArg.getProperty("variants");
  if (!variantsProp || !Node.isPropertyAssignment(variantsProp)) return props;

  const variantsInit = variantsProp.getInitializer();
  if (!variantsInit || !Node.isObjectLiteralExpression(variantsInit)) return props;

  const defaultVariantsProp = optionsArg.getProperty("defaultVariants");
  const defaultVariantsMap = new Map<string, string>();
  if (defaultVariantsProp && Node.isPropertyAssignment(defaultVariantsProp)) {
    const dvInit = defaultVariantsProp.getInitializer();
    if (dvInit && Node.isObjectLiteralExpression(dvInit)) {
      for (const prop of dvInit.getProperties()) {
        if (Node.isPropertyAssignment(prop)) {
          const key = prop.getName();
          const val = prop.getInitializer()?.getText() ?? "";
          defaultVariantsMap.set(key, val.replace(/^["']|["']$/g, ""));
        }
      }
    }
  }

  for (const variantEntry of variantsInit.getProperties()) {
    if (!Node.isPropertyAssignment(variantEntry)) continue;
    const variantName = variantEntry.getName();
    const variantValues = variantEntry.getInitializer();
    if (!variantValues || !Node.isObjectLiteralExpression(variantValues)) continue;

    const keys: string[] = [];
    for (const kv of variantValues.getProperties()) {
      if (Node.isPropertyAssignment(kv)) {
        keys.push(kv.getName().replace(/^["']|["']$/g, ""));
      }
    }

    if (keys.length === 0) continue;

    const typeStr = keys.map((k) => JSON.stringify(k)).join(" | ");
    const defaultVal = defaults.get(variantName) ?? defaultVariantsMap.get(variantName);

    props.push({
      name: variantName,
      type: typeStr,
      required: false,
      defaultValue: defaultVal ? JSON.stringify(defaultVal).replace(/^"|"$/g, "") : undefined,
    });
  }

  return props;
}

// ---------------------------------------------------------------------------
// Find VariantProps references in an intersection type and resolve them
// ---------------------------------------------------------------------------

function resolveVariantProps(
  sourceFile: SourceFile,
  typeText: string,
  defaults: Map<string, string>
): RegistryProp[] {
  const props: RegistryProp[] = [];

  // Match: VariantProps<typeof someVariableName>
  const matches = typeText.matchAll(/VariantProps<\s*typeof\s+(\w+)\s*>/g);
  for (const match of matches) {
    const varName = match[1];
    props.push(...extractCvaProps(sourceFile, varName, defaults));
  }

  return props;
}

// ---------------------------------------------------------------------------
// Skip patterns for base/inherited types we don't want to expand
// ---------------------------------------------------------------------------

const SKIP_EXTENDS_PATTERNS = [
  /^React\./,
  /^HTML/,
  /^SVG/,
  /ComponentProps/,
  /ButtonHTMLAttributes/,
  /InputHTMLAttributes/,
  /TextareaHTMLAttributes/,
  /^Omit</,
  /^Pick</,
  /^HeadingProps/,
  /^TextProps/,
  /^TooltipPrimitiveProps/,
  /^TooltipTriggerPrimitive/,
];

function shouldSkipExtends(text: string): boolean {
  return SKIP_EXTENDS_PATTERNS.some((re) => re.test(text));
}

// ---------------------------------------------------------------------------
// Interface extraction: own members + same-file extensions
// ---------------------------------------------------------------------------

function getOwnInterfaceProps(
  decl: InterfaceDeclaration,
  defaults: Map<string, string>,
  visited = new Set<string>()
): RegistryProp[] {
  if (visited.has(decl.getName())) return [];
  visited.add(decl.getName());

  const sourceFile = decl.getSourceFile();
  const props: RegistryProp[] = [];

  for (const prop of decl.getProperties()) {
    const name = prop.getName();
    if (!name || name.startsWith("[")) continue;
    const typeText = cleanType(prop.getTypeNode()?.getText() ?? prop.getType().getText());
    const required = !prop.hasQuestionToken();
    const description = getJsDocComment(prop);
    const defaultValue = defaults.get(name);
    props.push({ name, type: typeText, required, defaultValue, description });
  }

  for (const base of decl.getExtends()) {
    const extendsText = base.getText();

    // Resolve VariantProps<typeof ...>
    if (extendsText.includes("VariantProps")) {
      props.push(...resolveVariantProps(sourceFile, extendsText, defaults));
      continue;
    }

    const extendsName = base.getExpression().getText();
    if (shouldSkipExtends(extendsName)) continue;

    const baseIf = sourceFile.getInterface(extendsName);
    if (baseIf) {
      props.push(...getOwnInterfaceProps(baseIf, defaults, visited));
    }
  }

  return props;
}

// ---------------------------------------------------------------------------
// Type alias extraction (intersection with type literals and VariantProps)
// ---------------------------------------------------------------------------

function getTypeAliasCustomProps(
  decl: TypeAliasDeclaration,
  defaults: Map<string, string>
): RegistryProp[] {
  const props: RegistryProp[] = [];
  const typeNode = decl.getTypeNode();
  if (!typeNode) return props;

  const sourceFile = decl.getSourceFile();

  function processTypeLiteral(node: Node) {
    if (!Node.isTypeLiteral(node)) return;
    for (const prop of node.getProperties()) {
      if (!Node.isPropertySignature(prop)) continue;
      const name = prop.getName();
      if (!name || name.startsWith("[")) continue;
      const typeText = cleanType(prop.getTypeNode()?.getText() ?? "unknown");
      const required = !prop.hasQuestionToken();
      const description = getJsDocComment(prop);
      const defaultValue = defaults.get(name);
      props.push({ name, type: typeText, required, defaultValue, description });
    }
  }

  function processIntersectionMember(member: Node) {
    const text = member.getText();

    if (Node.isTypeLiteral(member)) {
      processTypeLiteral(member);
      return;
    }

    if (text.includes("VariantProps")) {
      props.push(...resolveVariantProps(sourceFile, text, defaults));
      return;
    }

    // Resolve local interface reference
    const typeName = text.replace(/^typeof\s+/, "").split("<")[0].trim();
    if (!shouldSkipExtends(typeName)) {
      const baseIf = sourceFile.getInterface(typeName);
      if (baseIf) {
        const fnName = decl.getName().replace(/Props$/, "");
        props.push(...getOwnInterfaceProps(baseIf, defaults, new Set()));
      }
    }
  }

  if (Node.isIntersectionTypeNode(typeNode)) {
    for (const member of typeNode.getTypeNodes()) {
      processIntersectionMember(member);
    }
  } else {
    processTypeLiteral(typeNode);
  }

  return props;
}

// ---------------------------------------------------------------------------
// Default value extraction from function parameter destructuring
// ---------------------------------------------------------------------------

function getFunctionNode(
  file: SourceFile,
  fnName: string
): FunctionDeclaration | ArrowFunction | FunctionExpression | undefined {
  const fn = file.getFunction(fnName);
  if (fn) return fn;

  const varDecl = file.getVariableDeclaration(fnName);
  if (!varDecl) return undefined;
  const init = varDecl.getInitializer();
  if (!init) return undefined;
  if (Node.isArrowFunction(init) || Node.isFunctionExpression(init)) return init;
  return undefined;
}

function extractDefaultsFromFunction(file: SourceFile, fnName: string): Map<string, string> {
  const defaults = new Map<string, string>();
  const fn = getFunctionNode(file, fnName);
  if (!fn) return defaults;

  const params =
    Node.isFunctionDeclaration(fn) || Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)
      ? fn.getParameters()
      : [];

  for (const param of params) {
    const nameNode = param.getNameNode();
    if (!Node.isObjectBindingPattern(nameNode)) continue;
    const obp = nameNode as ObjectBindingPattern;
    for (const el of obp.getElements()) {
      const propName = el.getPropertyNameNode()?.getText() ?? el.getNameNode().getText();
      const initializer = el.getInitializer();
      if (initializer) {
        defaults.set(propName, initializer.getText());
      }
    }
  }

  return defaults;
}

// ---------------------------------------------------------------------------
// Inline props extraction (for components without named interfaces)
// Collects from `& { ... }` type literals and VariantProps in the first param
// ---------------------------------------------------------------------------

function extractCustomInlineProps(
  file: SourceFile,
  fnName: string,
  defaults: Map<string, string>
): RegistryProp[] {
  const fn = getFunctionNode(file, fnName);
  if (!fn) return [];

  const params =
    Node.isFunctionDeclaration(fn) || Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)
      ? fn.getParameters()
      : [];
  if (params.length === 0) return [];

  const firstParam = params[0];
  const typeNode = firstParam.getTypeNode();
  if (!typeNode) return [];

  const props: RegistryProp[] = [];
  const seen = new Set<string>();

  function addFromTypeLiteral(node: Node) {
    if (!Node.isTypeLiteral(node)) return;
    for (const prop of node.getProperties()) {
      if (!Node.isPropertySignature(prop)) continue;
      const name = prop.getName();
      if (!name || name.startsWith("[") || seen.has(name)) continue;
      seen.add(name);
      const typeText = cleanType(prop.getTypeNode()?.getText() ?? "unknown");
      const required = !prop.hasQuestionToken();
      const description = getJsDocComment(prop);
      const defaultValue = defaults.get(name);
      props.push({ name, type: typeText, required, defaultValue, description });
    }
  }

  function processIntersectionMember(member: Node) {
    const text = member.getText();

    if (Node.isTypeLiteral(member)) {
      addFromTypeLiteral(member);
      return;
    }

    if (text.includes("VariantProps")) {
      const resolved = resolveVariantProps(file, text, defaults);
      for (const p of resolved) {
        if (!seen.has(p.name)) {
          seen.add(p.name);
          props.push(p);
        }
      }
      return;
    }
  }

  if (Node.isIntersectionTypeNode(typeNode)) {
    for (const member of typeNode.getTypeNodes()) {
      processIntersectionMember(member);
    }
  } else {
    addFromTypeLiteral(typeNode);
  }

  return props;
}

// ---------------------------------------------------------------------------
// Main extraction
// ---------------------------------------------------------------------------

const result: Record<string, RegistryProp[]> = {};
const errors: string[] = [];
let successCount = 0;

for (const [componentKey, target] of Object.entries(TARGETS)) {
  const filePath = path.join(ROOT, target.file);
  if (!fs.existsSync(filePath)) {
    errors.push(`[${componentKey}] File not found: ${target.file}`);
    continue;
  }

  try {
    const sourceFile = project.addSourceFileAtPath(filePath);
    const allProps: RegistryProp[] = [];

    // ── Named interfaces ───────────────────────────────────────────────────
    if (target.interfaces && target.interfaces.length > 0) {
      for (const ifName of target.interfaces) {
        const fnName = ifName.replace(/Props$/, "");
        const fnDefaults = extractDefaultsFromFunction(sourceFile, fnName);

        const ifDecl = sourceFile.getInterface(ifName);
        if (ifDecl) {
          allProps.push(...getOwnInterfaceProps(ifDecl, fnDefaults));
          continue;
        }

        const typeDecl = sourceFile.getTypeAlias(ifName);
        if (typeDecl) {
          allProps.push(...getTypeAliasCustomProps(typeDecl, fnDefaults));
          continue;
        }

        errors.push(`[${componentKey}] Interface/type "${ifName}" not found in ${target.file}`);
      }
    }

    // ── Inline (primary export function) ──────────────────────────────────
    if (target.primaryExport) {
      const fnDefaults = extractDefaultsFromFunction(sourceFile, target.primaryExport);
      const inlineProps = extractCustomInlineProps(sourceFile, target.primaryExport, fnDefaults);
      if (inlineProps.length > 0) {
        // Merge (avoid duplicates from interface + inline on same target like drawer)
        const existingNames = new Set(allProps.map((p) => p.name));
        for (const p of inlineProps) {
          if (!existingNames.has(p.name)) {
            allProps.push(p);
          }
        }
      }
    }

    result[componentKey] = allProps;
    successCount++;

    if (allProps.length > 0) {
      console.log(`  ✓ ${componentKey}: ${allProps.length} props`);
    } else {
      console.log(`  - ${componentKey}: 0 custom props (passthrough component)`);
    }
  } catch (err) {
    errors.push(`[${componentKey}] Error: ${String(err)}`);
  }
}

// ---------------------------------------------------------------------------
// Write output file
// ---------------------------------------------------------------------------

const lines: string[] = [];
lines.push("// AUTO-GENERATED by scripts/extract-props.ts — do not edit manually");
lines.push(`// Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("export interface RegistryProp {");
lines.push("  name: string;");
lines.push("  type: string;");
lines.push("  required: boolean;");
lines.push("  defaultValue?: string;");
lines.push("  description?: string;");
lines.push("}");
lines.push("");
lines.push("export const generatedProps: Record<string, RegistryProp[]> = {");

for (const [componentKey, props] of Object.entries(result)) {
  if (props.length === 0) {
    lines.push(`  "${componentKey}": [],`);
    continue;
  }
  lines.push(`  "${componentKey}": [`);
  for (const prop of props) {
    const parts: string[] = [
      `name: ${JSON.stringify(prop.name)}`,
      `type: ${JSON.stringify(prop.type)}`,
      `required: ${prop.required}`,
    ];
    if (prop.defaultValue !== undefined) {
      parts.push(`defaultValue: ${JSON.stringify(prop.defaultValue)}`);
    }
    if (prop.description !== undefined) {
      parts.push(`description: ${JSON.stringify(prop.description)}`);
    }
    lines.push(`    { ${parts.join(", ")} },`);
  }
  lines.push("  ],");
}

lines.push("};");
lines.push("");

fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf-8");

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log("");
console.log(`Extraction complete:`);
console.log(`  Components processed: ${successCount} / ${Object.keys(TARGETS).length}`);
console.log(`  Output written to: src/registry/generated-props.ts`);

if (errors.length > 0) {
  console.log("");
  console.log("Warnings/errors:");
  for (const e of errors) {
    console.log(`  - ${e}`);
  }
}
