module.exports = class PlaywrightDevPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async fillOutDetails() {
    // Home
    await this.page.click("button");

    // List of Credential Issuers
    await this.page.click("input");

    // Search for Users
    await this.page.fill("#name", "KENNETH DECERQUEIRA");
    await this.page.locator("button >> nth=1").click();

    // Select User
    await this.page.locator(".govuk-table__cell a").click();
  }

  async goto() {
    await this.page.goto("http://localhost:8085/");
  }
};
