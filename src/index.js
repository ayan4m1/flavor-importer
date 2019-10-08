import puppeteer from 'puppeteer';
import { readFile } from 'jsonfile';

import loggers from './logging';

const log = loggers('app');

const importFlavors = async () => {
  const flavors = await readFile('./flavors.json');
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  await page.goto('https://e-liquid-recipes.com/login');
  log.info('Waiting for login...');
  await page.waitForNavigation();

  if (!page.url().endsWith('/mine')) {
    log.error('Login failed.');
    return;
  }

  log.info('Logged in successfully');
  await page.goto('https://e-liquid-recipes.com/stash');

  for (const flavor of flavors) {
    const { vendor_abbreviation: vendor, name } = flavor;
    const flavorSlug = `${name} ${vendor}`;
    const $addText = await page.$('input[name="fladd"]');
    const $addButton = await page.$('btn.submit');

    $addText.type(flavorSlug);
    await page.waitForSelector('.ui-autocomplete', { visible: true });
    log.info('Pick a flavor...');
    await page.waitForSelector('.ui-autocomplete', { hidden: true });
    await page.waitFor(1000);
    $addButton.click();
    await page.waitForNavigation();
  }
};

importFlavors();
