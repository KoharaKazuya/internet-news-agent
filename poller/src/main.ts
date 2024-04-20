import "dotenv/config";

import { ModerationError, summarizeArticle } from "./ai.js";
import { runInBrowser } from "./browser.js";
import {
  maxFeedCountPerUser,
  maxPromptLength,
  maxUnreadArticleCountPerUser,
} from "./config.js";
import {
  countUnreadArticles,
  getUser,
  hasSummarizedArticle,
  isBannedUser,
  notifyBan,
  notifyUnreadArticleLimit,
  saveBannedUser,
  saveErrorArticle,
  saveSummarizedArticle,
} from "./db.js";
import { fetchLatestArticles } from "./feed.js";
import { L001, L002, L003, L007, L009, L010, log } from "./log.js";

async function main() {
  // タスクの対象となるユーザーの ID を取得する
  const userId = getTargetUserId();

  log(L001, "INFO", "Start task", { userId });

  // ユーザーが BAN 対象かどうかチェックする
  if (await isBannedUser(userId)) {
    log(L010, "INFO", "Skip task for banned user", { userId });
    return;
  }

  // ユーザー情報を取得する
  const user = await getUser(userId);
  let unreadArticleCount = await countUnreadArticles(userId);

  // ユーザーが登録しているフィードから最新の記事一覧を取得する
  const articles = await getLatestArticlesInFeeds(
    (user.feeds ?? []).slice(0, maxFeedCountPerUser)
  );

  await runInBrowser(async ({ fetchWebPageContent }) => {
    // 記事ごとに処理する
    for (const article of articles) {
      // すでに要約を生成済みの記事はスキップする
      if (await hasSummarizedArticle(userId, article.url)) continue;

      // 未読記事数上限に達した場合は処理を中断しユーザーに通知する
      if (unreadArticleCount >= maxUnreadArticleCountPerUser) {
        await notifyUnreadArticleLimit(userId);
        break;
      }
      unreadArticleCount += 1;

      try {
        // 記事を要約する
        const { summary, image } = await summarize({
          url: article.url,
          prompt: user.prompt?.substring(0, maxPromptLength),
        });
        // フィードに画像が設定されていない場合は、サイトから取得する
        if (!article.thumbnail && image) article.thumbnail = image;

        // 要約を保存する
        await saveSummarizedArticle(userId, article, summary);
      } catch (error) {
        // 有害なコンテンツを検知した場合は中断し、ユーザーを BAN する
        if (error instanceof ModerationError) {
          await banUser(userId);
          break;
        }

        // 要約に失敗した場合はログを残しつつ、エラー記事として保存する
        log(L007, "WARNING", "Failed to summarize article", {
          article,
          error: String(error),
        });
        await saveErrorArticle(userId, article, error);
      }
    }

    async function summarize({
      url,
      prompt,
    }: {
      url: string;
      prompt?: string;
    }) {
      const content = await fetchWebPageContent(url);
      const summary = await summarizeArticle(content, { userPrompt: prompt });
      return { summary, image: content.image };
    }
  });

  log(L002, "INFO", "End task", { userId });
}

function getTargetUserId() {
  const targetUsers = (process.env.TARGET_USERS || undefined)?.split("/") ?? [];
  const taskIndex = Number(process.env.CLOUD_RUN_TASK_INDEX || NaN);
  const userId = targetUsers[taskIndex];
  if (!userId) {
    throw new Error(
      `No such user (size: ${targetUsers.length}, index: ${taskIndex})`
    );
  }
  return userId;
}

async function getLatestArticlesInFeeds(feeds: { url: string }[]) {
  const articles = [];
  for (const feed of feeds) {
    const latestArticles = await fetchLatestArticles(feed.url);
    articles.push(...latestArticles);
  }
  return articles.sort((a, b) => a.date.getTime() - b.date.getTime());
}

async function banUser(userId: string): Promise<void> {
  log(L009, "WARNING", "Ban user", { userId });
  await saveBannedUser(userId);
  await notifyBan(userId);
}

main().catch((error) => {
  log(L003, "ERROR", "Failed task", { error: String(error) });
  process.exit(1);
});
