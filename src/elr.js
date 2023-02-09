import puppeteer from 'puppeteer';
import jsonfile from 'jsonfile';

import loggers from './logging.js';

const { readFile } = jsonfile;
const log = loggers('elr');

const setup = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });

    try {
      const page = await browser.newPage();

      return { browser, page };
    } catch (error) {
      log.error('Error initializing page context', error);

      try {
        browser.close();
      } catch (closeError) {
        log.error('Error closing browser', closeError);
      }
    }
  } catch (error) {
    log.error('Error initializing puppeteer', error);
  }
};

const getOptions = (options = {}) => ({
  timeout: 0,
  waitUntil: ['load'],
  ...options
});

export default async (json) => {
  const { browser, page } = await setup();

  try {
    const flavors = await readFile(json);

    await page.goto('https://e-liquid-recipes.com/login');
    log.info('Priming login form...');
    await page.waitForSelector(
      '.qc-cmp2-summary-buttons',
      getOptions({ visible: true })
    );
    const $acceptCookie = await page.$(
      '.qc-cmp2-summary-buttons button[mode="primary"]'
    );
    const $email = await page.$('input[name="email"]');

    await $acceptCookie.click();
    await $email.click();

    log.info('Waiting for login...');
    await page.waitForNavigation(getOptions());
    if (!page.url().endsWith('/mine')) {
      throw new Error('Login failed.');
    }

    log.info('Logged in successfully');
    await page.goto('https://e-liquid-recipes.com/stash', getOptions());

    log.info('Navigated to stash, starting add...');
    for (const flavor of flavors) {
      const { vendor_abbreviation: rawVendorCode, name } = flavor;

      let vendorCode;

      switch (rawVendorCode) {
        case 'DFS':
          vendorCode = 'DIYFS';
          break;
        case 'VT':
          vendorCode = 'VTA';
          break;
        default:
          vendorCode = rawVendorCode;
      }

      let vendor, vendorAbbreviation;

      switch (vendorCode) {
        case 'INW':
          vendor = 'Inawera';
          break;
        case 'FLV':
          vendor = 'Flavorah';
          break;
        case 'MB':
          vendor = 'Molinberry';
          break;
        case 'JF':
          vendor = 'Jungle Flavors';
          break;
        case 'RF':
          vendor = 'Real Flavors';
          vendorAbbreviation = 'SC) (Real Flavors';
          break;
        case 'HS':
          vendor = 'Hangsen';
          break;
        case 'PUR':
          vendor = 'Purilum';
          break;
        case 'NR':
          vendor = 'Nicotine River';
          break;
        case 'SM':
          vendor = 'Stixx Mixx';
          break;
        case 'LA':
          vendor = 'LorAnn';
          vendorAbbreviation = 'LA';
          break;
        case 'OOO':
          vendor = 'One on One';
          break;
        case 'VTA':
          vendor = 'VT';
          vendorAbbreviation = 'VTA';
          break;
        default:
          vendor = vendorCode;
      }

      // set abbreviation to vendor or code, preferring a vendor slug if one
      // is available
      if (!vendorAbbreviation) {
        vendorAbbreviation = vendor !== vendorCode ? vendor : vendorCode;
      }

      const flavorSlug = `${name} ${vendor}`;
      const exactName = `${name} (${vendorAbbreviation})`.toLowerCase();
      const $addText = await page.$('#fladd');
      const $exactMatch = await page.$$eval(
        'a.fname',
        (elements, text) =>
          elements.find((el) => el?.innerText?.toLowerCase() === text),
        exactName
      );

      log.info(`Looking for flavor with name ${exactName}`);
      if ($exactMatch) {
        log.info(
          `Found exact match for ${exactName} already in stash, skipping...`
        );

        continue;
      }

      log.info(`Adding ${flavorSlug}`);
      $addText.type(flavorSlug);
      let result = await Promise.race([
        page.waitForSelector('.ui-autocomplete', getOptions({ visible: true })),
        page.waitForNavigation(getOptions())
      ]);

      const $menuItems = await page.$$('.ui-autocomplete .ui-menu-item');

      if (Array.isArray($menuItems) && $menuItems.length === 1) {
        log.info('Only one result, selecting it...');

        const [$menuItem] = $menuItems;
        const [, $addButton] = await page.$$('.btn[type="submit"]');

        $menuItem.click();
        $addButton.click();
        await page.waitForNavigation(getOptions());
        continue;
      }

      log.info('Pick a flavor or refresh the page to skip...');
      result = await Promise.race([
        page.waitForSelector('.ui-autocomplete', getOptions({ hidden: true })),
        page.waitForNavigation(getOptions())
      ]);

      if (result && typeof result.executionContext === 'function') {
        const [, $addButton] = await page.$$('.btn[type="submit"]');

        await Promise.all([
          page.waitForNavigation(getOptions()),
          $addButton.click()
        ]);
      }
    }

    log.info('done importing!');
    await page.close();
    await browser.close();
  } catch (error) {
    log.error('Failed during execution: ', error);

    try {
      await page.close();
      await browser.close();
    } catch (shutdownError) {
      log.error('Error shutting down puppeteer', shutdownError);
    }
  }
};
