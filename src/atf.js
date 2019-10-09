import neatCsv from 'neat-csv';
import puppeteer from 'puppeteer';
import getStream from 'get-stream';
import { createReadStream } from 'fs';

import loggers from './logging';

const log = loggers('app');
const flavorNamePattern = /(.*)\(([A-Z0-9]+)\)/i;
const stashUrlPattern = /https:\/\/alltheflavors.com\/my\/flavors\/([A-Z0-9-]+)\/stash/i;

export default async csv => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();

  try {
    const stream = createReadStream(csv);
    const data = await getStream(stream);
    const flavors = await neatCsv(data, {
      separator: ';'
    });

    await page.goto('https://alltheflavors.com');
    log.info('Waiting for login...');
    await page.waitForSelector('a[href="/recipes?owner=both"]', {
      timeout: 0
    });

    log.info('Logged in successfully!');
    await page.goto('https://alltheflavors.com/flavors', {
      waitUntil: ['load', 'networkidle0']
    });
    for (const flavor of flavors) {
      const $input = await page.$('#name_like');
      const { Flavor: flavorSlug } = flavor;

      let searchTerm = flavorSlug;
      const matchResult = flavorSlug.match(flavorNamePattern);

      if (matchResult) {
        const [, rawName, rawVendor] = matchResult;

        searchTerm = `${rawVendor} ${rawName}`;
      }

      page.evaluate(input => {
        input.value = '';
      }, $input);
      $input.type(searchTerm);
      log.info('Waiting for results...');
      await page.waitForResponse(
        response =>
          response
            .url()
            .startsWith('https://alltheflavors.com/flavors/live_search'),
        { timeout: 0 }
      );
      log.info('Check a box or hit reload to skip...');

      await Promise.race([
        page.waitForResponse(response => stashUrlPattern.test(response.url()), {
          timeout: 0
        }),
        page.waitForNavigation({ timeout: 0, waitUntil: ['load'] })
      ]);
    }
  } catch (error) {
    log.error(error.message, error);

    try {
      await page.close();
      await browser.close();
    } catch (shutdownError) {
      log.error('Error shutting down puppeteer', shutdownError);
    }
  }
};
