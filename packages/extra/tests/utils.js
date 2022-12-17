export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function gotoPage(app, page) {
  let count = 0;

  while (count < 3) {
    try {
      await page.goto(app, { waitUntil: "load" });
      break;
    } catch (e) {
      await sleep(500);
      count++;

      // Last iter log error
      if (count === 2) {
        console.log(e);
      }
    }
  }
}
