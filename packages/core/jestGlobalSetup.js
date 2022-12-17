import puppeteer from "puppeteer";
import { gotoPage } from "./tests/utils.js";

// Address app
const appTestGraphBrowser = "http://localhost:3000/demo/html-data-table.html";

// Options to browser create
const options = {
  defaultViewport: null,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080"],
};

// Setup Jest

let browser;

beforeAll(async () => {
  // Setting browser
  browser = await puppeteer.launch({
    ...options,
  });
});

beforeEach(async () => {
  // New page
  global.page = await browser.newPage();
  // Going to app url
  await gotoPage(appTestGraphBrowser, global.page);
});

afterEach(async () => {
  // Close page
  await global.page.close();
});

afterAll(async () => {
  // Close browser
  await browser.close();
});
