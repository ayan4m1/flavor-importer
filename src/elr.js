import puppeteer from 'puppeteer';
import { readFile } from 'jsonfile';

import loggers from './logging';

const log = loggers('app');

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

const getOptions = waitUntil => ({
  timeout: 0,
  waitUntil
});

export default async json => {
  const { browser, page } = await setup();

  try {
    const flavors = await readFile(json);

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
    await page.goto(
      'https://e-liquid-recipes.com/stash',
      getOptions(['load', 'networkidle2'])
    );

    log.info('Navigated to stash, starting add...');
    for (const flavor of flavors) {
      const { vendor_abbreviation: vendor, name } = flavor;
      const flavorSlug = `${name} ${vendor}`;
      const $addText = await page.$('#fladd');

      log.info(`Adding ${flavorSlug}`);
      $addText.type(flavorSlug);
      let result = await Promise.race([
        page.waitForSelector('.ui-autocomplete', { visible: true }),
        page.waitForNavigation(getOptions(['load']))
      ]);

      log.info('Pick a flavor or refresh the page to skip...');
      result = await Promise.race([
        page.waitForSelector('.ui-autocomplete', { hidden: true }),
        page.waitForNavigation(getOptions(['load']))
      ]);

      if (result && typeof result.executionContext === 'function') {
        const [, $addButton] = await page.$$('.btn[type="submit"]');

        await Promise.all([
          page.waitForNavigation(getOptions(['load', 'networkidle2'])),
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
