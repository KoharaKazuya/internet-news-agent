import crypto from "node:crypto";
import OpenAI from "openai";
import { dedent } from "ts-dedent";
import { maxContentLength, systemDefaultPrompt } from "./config.js";
import { L005, L006, log } from "./log.js";

const openai = new OpenAI();

const separatorToken = crypto.randomUUID();

/**
 * 潜在的に有害なコンテンツが含まれている場合にスローされるエラー
 */
export class ModerationError extends Error {
  static {
    this.prototype.name = "ModerationError";
  }
}

// インターネット記事を要約する
export async function summarizeArticle(
  content: { html: string; text: string },
  options: { userPrompt?: string }
): Promise<string> {
  const tooLong = isTooLongContent(content.html);
  const command = tooLong
    ? commandForText(content.text)
    : commandForHTML(content.html);

  log(L005, "INFO", "Summarize article", {
    options,
    html: content.html.length,
    text: content.text.length,
    command: command.length,
    tooLong,
  });

  // ユーザー入力が潜在的に有害そうであれば中断する
  const moderations = await openai.moderations.create({
    input: [...(options.userPrompt ? [options.userPrompt] : []), command],
  });
  for (const result of moderations.results) {
    if (result.flagged)
      throw new ModerationError("Potentially harmful content");
  }

  // OpenAI で記事を要約する
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemDefaultPrompt },
      ...(options.userPrompt
        ? [{ role: "user" as const, content: options.userPrompt }]
        : []),
      { role: "system", content: command },
    ],
  });

  log(L006, "INFO", "OpenAI chat completion response", { chatCompletion });

  const result = chatCompletion.choices[0]?.message.content;
  if (!result) throw new Error(`No chat completion result`);
  return result;
}

function isTooLongContent(content: string): boolean {
  return content.length > maxContentLength;
}

function commandForHTML(html: string): string {
  return dedent`
    以下の記事の HTML を解釈し、読んでまとめてください。HTML は次の \`${separatorToken}\` 以降から始まり、その後の \`${separatorToken}\` の直前まで続きます。
    
    ${separatorToken}
    ${html.substring(0, maxContentLength)}
    ${separatorToken}
  `;
}

function commandForText(text: string): string {
  return dedent`
    以下の記事の HTML からテキスト部分のみを抽出したものを読んでまとめてください。抽出したテキストは次の \`${separatorToken}\` 以降から始まり、その後の \`${separatorToken}\` の直前まで続きます。
    
    ${separatorToken}
    ${text.substring(0, maxContentLength)}
    ${separatorToken}
  `;
}
