import { resolve } from 'path';
import { readFileSync } from 'jsonfile';

export const getPackageVersion = () => {
  const packageInfo = readFileSync(resolve(__dirname, '..', 'package.json'));

  return packageInfo && packageInfo.version;
};
