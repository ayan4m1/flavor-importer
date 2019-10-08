import cosmiconfig from 'cosmiconfig';

const configSearch = cosmiconfig('flavor').searchSync();

if (configSearch === null) {
  throw new Error(
    'Did not find a config file for module name "flavor" - see https://github.com/davidtheclark/cosmiconfig#explorersearch'
  );
}

export default configSearch.config;
