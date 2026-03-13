#!/usr/bin/env node
import { Command } from 'commander';
import { add } from './commands/add.js';

const program = new Command()
  .name('ui-studio')
  .description('Install UI Studio components into your project')
  .version('0.1.0');

program
  .command('add')
  .description('Add a component to your project')
  .argument('<components...>', 'Component names to install')
  .option('-d, --dir <dir>', 'Target directory', 'src')
  .option('-o, --overwrite', 'Overwrite existing files', false)
  .option('--dry-run', 'Show what would be installed without writing files', false)
  .action(add);

program.parse();
