import { Command } from 'commander';

import importAtf from './atf.js';
import importElr from './elr.js';
import { getPackageVersion } from './util.js';

const program = new Command();

program.command('atf <csv>').description('from elr to atf').action(importAtf);

program.command('elr <json>').description('from atf to elr').action(importElr);

program
  .name('flavor-importer')
  .version(getPackageVersion())
  .parse(process.argv);
