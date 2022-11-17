describe("Table Actions Suite", () => {
  test("Ordering table click in first th", async () => {
    // Query button by xpath element and text
    const th = (await page.$x("//th[text()='ID']"))[0];
    await th.click();
    await th.click();

    const datasetRowId = await page.evaluate(
      () => document.querySelector("tbody>tr").dataset.rowId
    );
    expect(datasetRowId).toBe("11");
  });

  test("Checking all rows table and interact", async () => {
    // Query button by xpath
    const th = (await page.$x("//th//input"))[0];
    await th.click();

    await page.click(".interact");

    const message = await page.evaluate(
      () => document.querySelector("#result>span").innerText
    );
    expect(message).toBe("1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11");
  });

  test("Checking first and third rows table and interact", async () => {
    // Query button by xpath
    let th = (await page.$x("//tr//td//input"))[0];
    await th.click();
    th = (await page.$x("//tr//td//input"))[2];
    await th.click();

    await page.click(".interact");

    const message = await page.evaluate(
      () => document.querySelector("#result>span").innerText
    );
    expect(message).toBe("1, 3");
  });

  test("Paginate table forward", async () => {
    await page.click(".forward-page");

    const datasetRowId = await page.evaluate(
      () => document.querySelector("tbody>tr").dataset.rowId
    );
    expect(datasetRowId).toBe("11");
  });

  test("Paginate table back", async () => {
    await page.click(".forward-page");
    await page.click(".backward-page");

    const datasetRowId = await page.evaluate(
      () => document.querySelector("tbody>tr").dataset.rowId
    );
    expect(datasetRowId).toBe("1");
  });

  test("Search table", async () => {
    await page.type(".ta-search-container>input", "árlindo", { delay: 300 });

    const rowLength = await page.evaluate(
      () => document.querySelectorAll(".ta tbody tr").length
    );
    expect(rowLength).toBe(1);
  });

  test("Search table unexisting row value", async () => {
    await page.type(".ta-search-container>input", "000xxx", { delay: 300 });

    const rowLength = await page.evaluate(
      () => document.querySelectorAll(".ta tbody tr").length
    );
    expect(rowLength).toBe(1);

    const row = await page.evaluate(() =>
      document
        .querySelector(".ta tbody tr td")
        .classList.contains("ta-td-message")
    );
    expect(row).toBe(true);
  });
});
