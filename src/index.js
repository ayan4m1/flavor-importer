import commander from 'commander';

import importAtf from './atf';
import importElr from './elr';
import { getPackageVersion } from './util';

const program = new commander.Command();

program
  .command('atf <csv>')
  .description('from elr to atf')
  .action(importAtf);

program
  .command('elr <json>')
  .description('from atf to elr')
  .action(importElr);

program
  .name('flavor-importer')
  .version(getPackageVersion())
  .parse(process.argv);
