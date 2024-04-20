import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import clsx from "clsx";
import classes from "./ErrorCard.module.css";

export default function ErrorCard() {
  const error = useRouteError();
  return (
    <div className={clsx("card", classes.host)}>
      {isRouteErrorResponse(error) ? (
        error.status === 404 ? (
          <Content
            title="ページが見つかりません。"
            message="お探しのページが見つかりませんでした。"
          />
        ) : (
          <Content
            title="サーバーでエラーが発生しました。"
            message={`${error.status} ${error.statusText}`}
          />
        )
      ) : (
        <Content
          title="不明なエラーが発生しました。"
          message={error instanceof Error ? error.message : "Unknown Error"}
        />
      )}
    </div>
  );
}

function Content({ title, message }: { title: string; message: string }) {
  return (
    <>
      <h1>{title}</h1>
      <p>{message}</p>
      <div>
        <a className={classes.link} href="/">
          トップページに戻る
        </a>
      </div>
    </>
  );
}
