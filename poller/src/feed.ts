import FeedParser from "feedparser";
import fetch from "node-fetch";
import { L004, log } from "./log.js";

export interface ArticleMeta {
  website: string;
  url: string;
  date: Date;
  title: string;
  thumbnail?: string;
}

// 最新記事を取得する
export async function fetchLatestArticles(
  feedurl: string
): Promise<ArticleMeta[]> {
  log(L004, "INFO", "Fetch latest articles", { feedurl });

  const response = await fetch(feedurl);
  if (!response.ok)
    throw new Error(`Failed to fetch ${feedurl}: ${response.status}`);
  if (!response.body) throw new Error(`No body in response from ${feedurl}`);

  const [meta, feeds] = await new Promise<any[]>((resolve, reject) => {
    const feedparser = new FeedParser({ feedurl });
    let meta: any;
    const articles: any[] = [];

    feedparser.on("error", (err: unknown) => {
      reject(err);
    });

    feedparser.on("readable", function (this: any) {
      meta = this.meta;

      let item;
      while ((item = this.read())) articles.push(item);
    });

    feedparser.on("end", function () {
      resolve([meta, articles]);
    });

    response.body?.pipe(feedparser);
  });

  return feeds.map((feed: any): ArticleMeta => {
    const thumbnail =
      feed.image?.url ||
      feed.enclosures?.find(({ type }: any) =>
        String(type).startsWith("image/")
      )?.url;
    return {
      website: meta.title,
      url: feed.link,
      date: feed.pubdate,
      title: feed.title,
      ...(thumbnail ? { thumbnail } : {}),
    };
  });
}
