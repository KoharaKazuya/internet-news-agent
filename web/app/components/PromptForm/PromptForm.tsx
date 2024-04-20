import { useCallback, type FormEventHandler } from "react";
import { maxPromptLength } from "~/config";
import { useUserPrompt, useUserPromptMutation } from "~/queries/user";
import classes from "./PromptForm.module.css";

export default function PromptForm() {
  const { prompt, isPending, onSubmit } = useUserPromptForm();
  return (
    <form className={classes.host} onSubmit={onSubmit}>
      <h1>要約 AI</h1>
      <h2>指示</h2>
      <p>
        AI
        にどのように記事を要約するか指示します。好みに合わせてカスタマイズしてください。未記入でも基本的な要約は機能します。
      </p>
      <p>
        例: 本文中のとくに重要な一文は変更せずに文章をそのまま引用してください。
      </p>
      <div>
        <label htmlFor="prompt">要約 AI への指示:</label>
        <textarea
          id="prompt"
          name="prompt"
          className={classes.prompt}
          defaultValue={prompt}
          maxLength={maxPromptLength}
        />
      </div>
      <button
        type="submit"
        className={classes.submitButton}
        disabled={isPending}
      >
        更新
      </button>
    </form>
  );
}

function useUserPromptForm() {
  const { data: prompt } = useUserPrompt();

  const { mutate, isPending } = useUserPromptMutation();
  const onSubmit = useCallback<FormEventHandler>(
    (event) => {
      event.preventDefault();

      const data = new FormData(event.nativeEvent.target as HTMLFormElement);
      const prompt = data.get("prompt") as string;

      mutate(prompt);
    },
    [mutate]
  );

  return { prompt, isPending, onSubmit };
}
