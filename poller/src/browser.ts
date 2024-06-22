import DOMPurify from "isomorphic-dompurify";
import { Page, chromium } from "playwright";
import { maxContentLength } from "./config.js";
import { L000, L008, log } from "./log.js";

export async function runInBrowser(
  fn: (deps: {
    fetchWebPageContent(url: string): Promise<{
      html: string;
      text: string;
      image?: string;
    }>;
  }) => Promise<void>
): Promise<void> {
  const browser = await chromium.launch();

  const runInNewContext = async <T>(
    fn: (deps: { page: Page }) => Promise<T>
  ) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const ret = await fn({ page });
    await context.close();
    return ret;
  };

  await fn({
    async fetchWebPageContent(url) {
      log(L008, "INFO", "Fetch web page content", { url });
      const content = await runInNewContext(async ({ page }) => {
        await page.goto(url);
        return await getMainContent(page);
      });
      log(L000, "DEBUG", "Fetched web page content", { url, content });
      return content;
    },
  });

  await browser.close();
}

/**
 * メインコンテンツ部分のみを取得します
 */
async function getMainContent(
  page: Page
): Promise<{ html: string; text: string; image?: string }> {
  let raw: { html: string; text: string };

  const mainLocator = page.getByRole("main");
  if ((await mainLocator.count()) > 0) {
    raw = await mainLocator.first().evaluate(async (main) => {
      return {
        html: main.innerHTML,
        text: main.textContent ?? "",
      };
    });
  } else {
    raw = await page.evaluate(async (maxContentLength) => {
      // セレクターが見つからない場合、最も長いテキストブロックを持つ要素を探す
      let target: Element | undefined;
      document
        .querySelectorAll("div, section, article, p")
        .forEach((element) => {
          if (
            (element.textContent?.length ?? 0) >
            (target?.textContent?.length ?? 0)
          )
            target = element;
        });
      target = document.documentElement;

      // 文字数が多すぎない範囲で最も浅い先祖要素を取得する
      while (
        (target!.parentElement?.textContent?.length ?? Infinity) <
        maxContentLength / 2
      )
        target = target?.parentElement!;

      return {
        html: target.innerHTML,
        text: target.textContent ?? "",
      };
    }, maxContentLength);
  }

  const clean = DOMPurify.sanitize(raw.html, {
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_ATTR: ["role"],
    KEEP_CONTENT: true,
  });

  // サムネイル画像を取得する
  let image: string | undefined;
  const imageLocator = page.locator('meta[property="og:image"]');
  if ((await imageLocator.count()) > 0) {
    image = await imageLocator.evaluate(
      (meta: HTMLMetaElement) => meta.content
    );
  }

  return { html: clean, text: raw.text, image };
}
