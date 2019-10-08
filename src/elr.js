import puppeteer from 'puppeteer';
import { readFile } from 'jsonfile';

import loggers from './logging';

const log = loggers('app');

export default async json => {
  const flavors = await readFile(json);
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();

  await page.goto('https://e-liquid-recipes.com/login');
  log.info('Priming login form...');
  await page.waitForSelector('#gdpr-cookie-accept', { visible: true });
  const $acceptCookie = await page.$('#gdpr-cookie-accept');
  const $email = await page.$('input[name="email"]');

  $acceptCookie.click();
  $email.click();

  log.info('Waiting for login...');
  await page.waitForNavigation({ timeout: 0 });
  if (!page.url().endsWith('/mine')) {
    throw new Error('Login failed.');
  }

  log.info('Logged in successfully');
  await page.goto('https://e-liquid-recipes.com/stash', {
    waitUntil: ['load', 'networkidle2']
  });

  log.info('Navigated to stash, starting add...');
  try {
    for (const flavor of flavors) {
      const { vendor_abbreviation: vendor, name } = flavor;
      const flavorSlug = `${name} ${vendor}`;
      const $addText = await page.$('input[name="fladd"]');
      const [, $addButton] = await page.$$('.btn[type="submit"]');

      log.info(`Adding ${flavorSlug}`);
      $addText.type(flavorSlug);
      await page.waitForSelector('.ui-autocomplete', { visible: true });
      log.info('Pick a flavor...');
      await page.waitForSelector('.ui-autocomplete', { hidden: true });
      $addButton.click();
      await page.waitForNavigation({
        timeout: 0,
        waitUntil: ['load', 'networkidle2']
      });
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
