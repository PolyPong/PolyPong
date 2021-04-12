const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto("https://polypong.ca/");
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
        const element = await frame.waitForSelector("html > body > div > main > section > div > div.c31c314fe > div > div > form.c29c8bf29.c3ab72776.c7171e65b");
        await element.evaluate(form => form.submit());
        await promise;
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Username or email address");
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
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const promise = targetPage.waitForNavigation();
        const element = await frame.waitForSelector("aria/My Stats and Leaderboard");
    }
    await browser.close();
})();
