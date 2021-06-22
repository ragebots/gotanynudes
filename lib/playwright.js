// const playwright = require('playwright');
const { firefox } = require('playwright-firefox');
/*
starts a browser instance of type @browserType using @proxy with given @options
returns the browser instance
*/


const startBrowser = async (browserType, options) => {
  let browser;
  try {
    let proxy;
    if(options.proxy) {
      proxy = options.proxy;
      delete options.proxy;
    }

    options = {headless: true, timeout: 0, ...options};
    if(proxy) {
      const proxyArr = proxy.split(":");
      let proxyObj;
      if(proxyArr.length == 4) {
        proxyObj = {server: proxyArr[0] +":"+ proxyArr[1], username: proxyArr[2], password: proxyArr[3]};
      } else if(proxyArr.length == 2) {
        proxyObj = {server: proxy};
      }
      if(proxyObj) {
        options.proxy = proxyObj;
      }
    }
    // console.log(options);
    // browser = await playwright[browserType].launch(options);
    // we are using only firefox
    browser = await firefox.launch(options);
  } catch(err) {
    console.error(err);
  }
  return browser;
}
/*
accepts browser instance
quits the browser
*/
const closeBrowser = async (browser) => {
  try {
    await browser.close();
  } catch(err) {

  }
}
/*
same as Function closeBrowser
*/
const quitBrowser = async (browser) => {
  await closeBrowser(browser);
}
/*
starts a new browser context/session
returns the context
*/
const startBrowserContext = async (browser, options) => {
  let context;
  try {
    context = await browser.newContext(options);
  } catch(err) {
    console.error(err);
  }
  return context;
}
/*
starts a new page in a browser context
returns the page
*/
const startContextPage = async (context, options) => {
  let page;
  try {
    page = await context.newPage(options);
  } catch(err) {
    console.error(err);
  }
  return page;
}
/*
accepts browserType, browserOptions, contextOptions and pageOptions
starts browser, context and page
returns browser instance, context instance and page instance
*/
const startPlayWright = async (browserType, browserOptions, contextOptions, pageOptions) => {
  let browser, context, page;
  browser = await startBrowser(browserType, browserOptions);
  if(browser) {
    context = await startBrowserContext(browser, contextOptions);
  }
  if(context) {
    page = await startContextPage(context, pageOptions);
  }
  return [browser, context, page];
}

module.exports = {
  startBrowser,
  closeBrowser,
  quitBrowser,
  startBrowserContext,
  startContextPage,
  startPlayWright
}
