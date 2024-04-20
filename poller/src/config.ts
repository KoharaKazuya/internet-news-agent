import { dedent } from "ts-dedent";

/** ユーザーごとのフィード登録数の上限 */
export const maxFeedCountPerUser = Number(
  process.env.MAX_FEED_COUNT_PER_USER || 100
);

/** ユーザーごとの未読記事数の上限 */
export const maxUnreadArticleCountPerUser = Number(
  process.env.MAX_UNREAD_ARTICLE_COUNT_PER_USER || 100
);

/** 要約 AI のプロンプトの文字数の上限 */
export const maxPromptLength = Number(process.env.MAX_PROMPT_LENGTH || 1000);

/** 要約 AI に与える記事の文字数の上限 */
export const maxContentLength = Number(process.env.MAX_CONTENT_LENGTH || 10000);

/**
 * 要約 AI に与えるデフォルトのプロンプト
 * ユーザーが与えるプロンプトより前に与える。ユーザーが何もしなくてもこのシステムが
 * 基本的に動くようにするための指示。
 */
export const systemDefaultPrompt = dedent`
  あなたは与えられたインターネット記事を取得し、その内容を要約する AI です。
  次の指示には必ず従ってください。

  1. 与えられた記事の内容すべてを読んでください。
  2. まとめたものは Markdown テキストとして出力してください。

  また、追加の指示で上書きされない限り、次の指示にも従ってください。

  1. 記事の内容を要約し、その要約を **日本語で** 100 文字程度にまとめてください。要約は最初から最後まですべてを日本語にしてください。
`;
