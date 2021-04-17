const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://polypong.ca/");
  // LOGIN TEST
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Sign Up/Log In");
    await element.click();
    await promise;
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector(
      "aria/Continue with GitHub"
    );
    await element.click();
    await promise;
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector(
      "aria/Username or email address"
    );
    await element.type("polypongca");
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Password");
    await element.type("$S!7q%aoMgutZwAs$CS$Zczp8i&LBZ%x*Yap6eT2");
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Sign in");
    await element.click();
    await promise;
  }
  // LEADERBOARD TEST
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector(
      "aria/My Stats and Leaderboard"
    );
    await element.click();
    await promise;
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("label#top_worldwide");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Home");
    await element.click();
    await promise;
  }
  // SETTINGS TEST
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Settings");
    await element.click();
    await promise;
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/White");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Home");
    await element.click();
    await promise;
  }
  // CREATE PRIVATE LOBBY TEST
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Create Private Game");
    await element.click();
    await promise;
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector(
      "aria/Copy Link to Clipboard to Invite Friends"
    );
    await element.click();
  }
  {
    const context = await browser.defaultBrowserContext();
    await context.overridePermissions("https://polypong.ca", [
      "clipboard-read",
    ]);
    const copiedText = await page.evaluate(
      `(async () => await navigator.clipboard.readText())()`
    );
    console.log(copiedText);
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bigger Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bigger Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bigger Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Smaller Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Smaller Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Smaller Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bumpy Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bumpy Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bumpy Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Curved Inwards");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Curved Inwards");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Curved Inwards");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Curved Outwards");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Curved Outwards");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Curved Outwards");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Invisible Paddle, Self");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Invisible Paddle, Self");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Invisible Paddle, Self");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector(
      "aria/Invisible Paddle, Others"
    );
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector(
      "aria/Invisible Paddle, Others"
    );
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector(
      "aria/Invisible Paddle, Others"
    );
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Invisible Ball");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Invisible Ball");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Invisible Ball");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Add Ball");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Add Ball");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Add Ball");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Distracting Background");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Distracting Background");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Distracting Background");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Trace Ball Path");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Trace Ball Path");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Trace Ball Path");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bigger Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Smaller Paddle");
    await element.click();
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const element = await frame.waitForSelector("aria/Bumpy Paddle");
    await element.click();
  }
  await page.goto("https://polypong.ca/");
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Join Public Game");
    await element.click();
    await promise;
  }
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/DICE");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Solarium");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Cameron");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/SUB");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/CCIS");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Windsor");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/ECERF");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Telus");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Tory");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Butterdome");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Quad");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Lister");
    await element.click();
    await promise;
  }
  await page.goBack();
  {
    const targetPage = page;
    const frame = targetPage.mainFrame();
    const promise = targetPage.waitForNavigation();
    const element = await frame.waitForSelector("aria/Home");
    await element.click();
    await promise;
  }

  await browser.close();
})();
