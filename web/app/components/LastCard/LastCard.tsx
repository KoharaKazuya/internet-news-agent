import clsx from "clsx";
import { useUnreadArticleCount } from "~/queries/article";
import { useUserFeeds } from "~/queries/user";
import classes from "./LastCard.module.css";

type Props = {
  top?: boolean;
  /** サイトが未登録かどうかチェックすべきかどうか */
  shouldCheckNoFeed?: boolean;
};

export default function LastCard({ top, shouldCheckNoFeed }: Props) {
  return (
    <div className={clsx("card", classes.host)}>
      {shouldCheckNoFeed ? (
        <WithNoFeedCheck top={top} />
      ) : (
        <WithUpdateCheck top={top} />
      )}
    </div>
  );
}

function WithNoFeedCheck({ top }: { top?: boolean }) {
  const { data: feeds } = useUserFeeds();
  if (feeds.length > 0) return <WithUpdateCheck top={top} />;
  return (
    <p className={classes.message}>
      左上のメニューボタンからメニューを開き「サイト登録」を開いてください。読みたいサイトを登録して新着記事を待ちましょう！
    </p>
  );
}

function WithUpdateCheck({ top }: { top?: boolean }) {
  if (!top) return null;
  return <WithUpdateCheckOnTop />;
}

function WithUpdateCheckOnTop() {
  const { data: count } = useUnreadArticleCount();
  if (count === 0) return <AllRead />;
  return (
    <>
      <p className={classes.message}>新着記事があります。</p>
      <a href="/" className={classes.reloadButton}>
        読み込む
      </a>
    </>
  );
}

function AllRead() {
  return <p className={classes.message}>すべての記事を読みました！</p>;
}
