import clsx from "clsx";
import DOMPurify from "dompurify";
import "github-markdown-css";
import { Marked } from "marked";
import QuickLRU from "quick-lru";
import { Suspense, type ReactNode } from "react";
import LoadingCard from "~/components/LoadingCard";
import { useArticle } from "~/queries/article";
import classes from "./ArticleCard.module.css";

/** 画像読み込み待ちのタイムアウト (ms) */
const imgLoadTimeout = 10000;

const marked = new Marked();

type Props = {
  id: string;
  noSuspend?: boolean;
};

export default function ArticleCard(props: Props) {
  return (
    <Wrapper noSuspend={props.noSuspend}>
      <Content {...props} />
    </Wrapper>
  );
}

function Wrapper({
  noSuspend,
  children,
}: {
  noSuspend?: boolean;
  children?: ReactNode;
}) {
  if (noSuspend) return <>{children}</>;
  return <Suspense fallback={<LoadingCard />}>{children}</Suspense>;
}

function Content({ id }: Props) {
  const { data: article } = useArticle(id);

  const thumbnailUrl = article.meta.thumbnail;
  const { aspectRatio } = useThumbnail(thumbnailUrl);
  const isCinema = aspectRatio > 16 / 9;

  return (
    <a
      href={article.meta.url}
      target="_blank"
      rel="noreferrer"
      className={classes.wrapper}
    >
      <article
        className={clsx(
          "card",
          classes.host,
          isCinema && classes.cinema,
          article.type === "error" && classes.error
        )}
        style={{ ["--thumbnail" as string]: `url("${thumbnailUrl}")` }}
      >
        <div className={classes.top}>
          <div className={classes.meta}>
            <div className={classes.website}>{article.meta.website}</div>
            <div className={classes.title}>{article.meta.title}</div>
          </div>
        </div>
        <div className={classes.center}>
          {isCinema && (
            <img
              className={classes.thumbnail}
              src={thumbnailUrl}
              alt="サムネイル"
            />
          )}
        </div>
        <div className={classes.bottom}>
          <div
            className={clsx(classes.summary, "markdown-body")}
            dangerouslySetInnerHTML={{ __html: markdown(article.summary) }}
          />
        </div>
      </article>
    </a>
  );
}

function markdown(source: string): string {
  return DOMPurify.sanitize(marked.parse(source) as string);
}

function useThumbnail(url: string | undefined) {
  if (!url) return { aspectRatio: 1 };

  if (!thumbnailCache.has(url)) thumbnailCache.set(url, fetchImg(url));

  const img = thumbnailCache.get(url)!.read();
  const aspectRatio = img ? img.naturalWidth / img.naturalHeight : 1;

  return { aspectRatio };
}

const thumbnailCache = new QuickLRU<
  string,
  { read: () => HTMLImageElement | null }
>({ maxSize: 100 });

function fetchImg(url: string) {
  const imgPromise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), imgLoadTimeout);
  });
  return wrapPromise(Promise.race([imgPromise, timeoutPromise]));
}

function wrapPromise<T>(promise: Promise<T>) {
  let status = "pending";
  let result: T;

  const suspender = promise.then(
    (r) => {
      status = "fulfilled";
      result = r;
    },
    (e) => {
      status = "rejected";
      result = e;
    }
  );

  const read = () => {
    if (status === "pending") {
      throw suspender;
    } else if (status === "rejected") {
      throw result;
    } else {
      return result;
    }
  };

  return { read };
}
