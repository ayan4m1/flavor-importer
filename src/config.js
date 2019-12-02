import { cosmiconfigSync } from 'cosmiconfig';

const configSearch = cosmiconfigSync('flavor').search();

if (configSearch === null) {
  throw new Error(
    'Did not find a config file for module name "flavor" - see https://github.com/davidtheclark/cosmiconfig#explorersearch'
  );
}

export default configSearch.config;
