import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { resolveComponent, resolveDependencies } from '../registry.js';

interface AddOptions {
  dir: string;
  overwrite: boolean;
  dryRun: boolean;
}

export async function add(components: string[], options: AddOptions) {
  const spinner = ora('Resolving components...').start();

  const toInstall = new Set<string>();
  for (const name of components) {
    toInstall.add(name);
    const deps = await resolveDependencies(name);
    deps.forEach((d) => toInstall.add(d));
  }

  spinner.text = `Installing ${toInstall.size} component(s)...`;

  const allNpmDeps: Record<string, string> = {};
  const written: string[] = [];
  const skipped: string[] = [];

  for (const name of toInstall) {
    const component = await resolveComponent(name);
    if (!component) {
      spinner.warn(chalk.yellow(`Component "${name}" not found in registry`));
      continue;
    }

    if (component.npmDependencies) {
      Object.assign(allNpmDeps, component.npmDependencies);
    }

    for (const file of component.files) {
      const targetPath = resolve(process.cwd(), options.dir, file.target);

      if (existsSync(targetPath) && !options.overwrite) {
        skipped.push(file.target);
        continue;
      }

      if (!options.dryRun) {
        await fse.ensureDir(dirname(targetPath));
        await fse.writeFile(targetPath, file.content);
      }
      written.push(file.target);
    }
  }

  spinner.succeed('Done!');

  if (written.length > 0) {
    console.log(chalk.green(`\n  Created ${written.length} file(s):`));
    written.forEach((f) => console.log(chalk.dim(`    ${f}`)));
  }
  if (skipped.length > 0) {
    console.log(chalk.yellow(`\n  Skipped ${skipped.length} existing file(s) (use --overwrite):`));
    skipped.forEach((f) => console.log(chalk.dim(`    ${f}`)));
  }

  const depsToInstall = Object.entries(allNpmDeps);
  if (depsToInstall.length > 0) {
    console.log(chalk.cyan('\n  Required dependencies:'));
    const installCmd = depsToInstall.map(([pkg, ver]) => `${pkg}@${ver}`).join(' ');
    console.log(chalk.dim(`    pnpm add ${installCmd}\n`));
  }
}
