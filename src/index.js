const fs = require('fs');
const puppeteer = require('puppeteer');
const list = require('./input.json');
const data = {};
for (let i in list) {
    const item = list[i];
    data[item.lang] || (data[item.lang] = [])
    data[item.lang].push(item.content)
}
const result = [];

(async () => {
    for (let lang in data) {
        const browser = await puppeteer.launch({ headless: 1, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        await page.goto(`https://translate.google.com/?hl=zh-TW&sl=auto&tl=${lang}`);
        await page.waitForSelector('textarea', { timeout: 6000 })
        await page.evaluate(() => document.querySelector("textarea").value = "")
        await page.focus("textarea")
        for (let i = 0; i < data[lang].length; i++) {
            const content = data[lang][i]
            await page.keyboard.type(content)
            await page.waitForFunction(`document.querySelector('div[lang]')`);
            const gogo = (await page.evaluate(() => document.querySelector('div[lang]').innerText));
            result.push({ lang, content, gogo })

            await page.evaluate(() => document.querySelector("textarea").value = "")
            await page.keyboard.type(" ")
            await page.keyboard.press('Backspace');
            await page.waitForFunction(`!document.querySelector('div[lang]')`);
        }
        await browser.close();
    }
    // console.log(result)
    fs.writeFileSync(`output.json`,JSON.stringify(result));
})();
