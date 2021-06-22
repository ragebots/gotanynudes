const path = require("path");
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(process.cwd(), "/pw-browsers");
const CLA = require("./lib/cla");
const GotAnyNudes = require("./lib/gotanynudes");
const fetch = require('node-fetch');
const fs = require("fs");
const Utility = require("./lib/utility");
const PlayWright = require("./lib/playwright");

// default output directory
let outputDir = "outputs";
// input urls
const inputURLs = [];

try {
  const options = CLA.getOptions();
  // console.log(options);
  if(options.help) {
    CLA.printUsage();
    process.exit();
  }

  if(options.output) {
      outputDir = options.output;
  }
  // create output directory if doesn't exists yet
  if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  // concat input urls
  if(options.input && options.input.length > 0) {
    options.input.forEach(url => {
      if(!inputURLs.includes(url.toLowerCase())) {
        inputURLs.push(url.toLowerCase());
      }
    });
  }
  if(inputURLs.length == 0) {
    console.log("You don't have any target urls.");
    process.exit();
  }

} catch(err) {
  console.error(err);
  process.exit();
}

// console.log(inputURLs);

(async() => {

  const browserType = "firefox";
  //const browserOptions = {proxy: proxy};
  const browserOptions = {};
  const contextOptions = {acceptDownloads: true, permissions: ['notifications']};

  const [browser, context, page] = await PlayWright.startPlayWright(browserType, browserOptions, contextOptions);
  if(!browser || !context || !page ) {
    console.log("Error creating browser/context/page");
    if(browser) {
      await PlayWright.closeBrowser(browser);
    }
    return;
  }

  /*
  const fucker = "https://gotanynudes.com/wp-content/uploads/2020/12/Belle-Delphine-Hardcore-Porn-Onlyfans-Christmas-Day-Paid-DM-Videox-2.jpg";
  await Utility.downloadImage(page, fucker, "tiddy2.jpg");
  console.log("test");
  return;
  */

  for(const url of inputURLs) {

    await page.goto(url);
    try {
      await page.waitForSelector("#content", {state: "attached", timeout: 5 * 60 * 1000});
    } catch (err) {
      console.error("Cloudflare browser test failed");
    }
    const contentHTML = await page.content();
    // await PlayWright.quitBrowser(browser);
    // return;

    // const response = await fetch(url);
    // const contentHTML = await response.text();
    // fs.writeFileSync("test.html", contentHTML);

    const links = GotAnyNudes.getLinksForDownload(contentHTML);

    // console.log(links);
    if(links.length == 0) {
      console.log("No links found");
      return;
    }

    const mediaPath = GotAnyNudes.getMediaPath(url);
    // console.log(mediaPath);
    const mediaOutputDir = outputDir +"/"+ mediaPath;
    // create output directory if doesn't exists yet
    if(!fs.existsSync(mediaOutputDir)) {
      fs.mkdirSync(mediaOutputDir, {recursive: true});
    }
    // download media
    for(const link of links) {
      let fileDir = mediaOutputDir + "/video";
      if(link.type == "image") {
        fileDir =  mediaOutputDir + "/images";
      }
      if(!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
      }
      const absolutePath = path.join(fileDir, link.fileName);
      console.log("Downloading "+ link.fileLink +" to "+ absolutePath);
      try {
        if(link.type == "video") {
          await Utility.downloadFile(link.fileLink, absolutePath);
        } else {
          await Utility.downloadImage(page, link.fileLink, absolutePath);
        }
      } catch(err) {
        console.error(err);
      }
    }
  }
  await PlayWright.quitBrowser(browser);
})();
