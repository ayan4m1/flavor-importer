import jsonfile from 'jsonfile';

const { readFileSync } = jsonfile;

export const getPackageVersion = () =>
  readFileSync(new URL('../package.json', import.meta.url))?.version;
