import { useCallback, useEffect, useState, type FormEventHandler } from "react";
import { maxFeedCountPerUser } from "~/config";
import { useUserFeeds, useUserFeedsMutation } from "~/queries/user";
import classes from "./FeedForm.module.css";
import minusSolid from "./minus-solid.svg?inline";
import plusSolid from "./plus-solid.svg?inline";

export default function FeedForm() {
  const { feeds, isPending, add, remove, onSubmit } = useFeedsForm();
  return (
    <form className={classes.host} onSubmit={onSubmit}>
      <h1>サイト登録</h1>
      <h2>フィード</h2>
      <p>
        サイトのフィードを登録します。フィードはサイトの新着記事を取得するために使用されます。新着記事の取得は毎日早朝の時間帯に行われます。
      </p>
      <ul className={classes.list}>
        {feeds.map((feed) => (
          <li key={feed.key} className={classes.listItem}>
            <input
              name="url"
              className={classes.input}
              defaultValue={feed.url}
            />
            <button
              type="button"
              className={classes.removeButton}
              onClick={() => remove(feed.key)}
            >
              <img width={16} src={minusSolid} alt="サイトを削除する" />
            </button>
          </li>
        ))}
      </ul>
      <div className={classes.listFooter}>
        <button
          type="button"
          className={classes.addButton}
          disabled={feeds.length >= maxFeedCountPerUser}
          onClick={add}
        >
          <img width={16} src={plusSolid} alt="サイトを追加する" />
        </button>
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

let nextKey = 0;

function useFeedsForm() {
  const [feeds, setFeeds] = useState<{ key: number; url: string }[]>([]);

  const { data: remoteFeeds } = useUserFeeds();
  useEffect(() => {
    setFeeds(remoteFeeds.map((feed) => ({ key: nextKey++, url: feed.url })));
  }, [remoteFeeds]);

  const add = useCallback(
    () => setFeeds((feeds) => [...feeds, { key: nextKey++, url: "" }]),
    []
  );
  const remove = useCallback(
    (key: number) =>
      setFeeds((feeds) => feeds.filter((feed) => feed.key !== key)),
    []
  );

  const { mutate, isPending } = useUserFeedsMutation();
  const onSubmit = useCallback<FormEventHandler>(
    (event) => {
      event.preventDefault();

      const data = new FormData(event.nativeEvent.target as HTMLFormElement);
      const feeds = Array.from(new Set(data.getAll("url"))).map((url) => ({
        url: String(url),
      }));

      mutate(feeds);
    },
    [mutate]
  );

  return { feeds, isPending, add, remove, onSubmit };
}
