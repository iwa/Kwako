/**
 * Image generation function
 * @packageDocumentation
 * @module ImGenerator
 * @category Utils
 */
import * as puppeteer from 'puppeteer';
/** @desc Chromium browser */
const browser = puppeteer.launch();

/**
 * @param width - Width of the screenshot (in pixels)
 * @param height - Height of the screenshot (in pixels)
 * @param content - HTML content, written in one string
 * @param tag - UID of the user
 * @param prefix - Prefix to define the type of image generated
 * @returns Link to the generated file
 */
export default async function imGenerator(width: number, height: number, content: string, tag: string, prefix: string) {
    const page = await (await browser).newPage();
    await page.setViewport({ width: width, height: height, deviceScaleFactor: 2 })
    await page.setContent(content, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `image/${prefix}-${tag}.jpg`, type: 'jpeg', quality: 100 });
    await page.close();
    return `image/${prefix}-${tag}.jpg`
}
