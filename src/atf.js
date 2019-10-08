import neatCsv from 'neat-csv';
import puppeteer from 'puppeteer';
import getStream from 'get-stream';
import { createReadStream } from 'fs';

import loggers from './logging';

const log = loggers('app');

export default async csv => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();

  try {
    const stream = createReadStream(csv);
    const data = getStream(stream);
    const flavors = await neatCsv(data);

    // eslint-disable-next-line
    console.dir(flavors);

    await page.goto('https://alltheflavors.com');
    log.info('Waiting for login...');
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
