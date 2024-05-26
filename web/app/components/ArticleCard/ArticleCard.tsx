import clsx from "clsx";
import DOMPurify from "dompurify";
import "github-markdown-css";
import { Marked } from "marked";
import { Suspense, type ReactNode } from "react";
import LoadingCard from "~/components/LoadingCard";
import { useArticle } from "~/queries/article";
import { useImageAspectRatio } from "~/queries/image";
import classes from "./ArticleCard.module.css";
import upRightFromSquareSolid from "./up-right-from-square-solid.svg?inline";
import xmarkSolid from "./xmark-solid.svg?inline";

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
  const { data: aspectRatio } = useImageAspectRatio(thumbnailUrl);
  const isCinema = aspectRatio > 16 / 9;

  return (
    <article
      className={clsx(
        "card",
        classes.host,
        isCinema && classes.cinema,
        article.type === "error" && classes.error
      )}
      style={{ ["--thumbnail" as string]: `url("${thumbnailUrl}")` }}
    >
      <a
        href={article.meta.url}
        target="_blank"
        rel="noreferrer"
        className={classes.wrapper}
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
      </a>
      <div className={classes.bottom}>
        <div
          className={clsx(classes.summary, "scroll-locker", "markdown-body")}
          tabIndex={-1}
          dangerouslySetInnerHTML={{ __html: markdown(article.summary) }}
        />
        <a
          className={classes.linkButton}
          href={article.meta.url}
          target="_blank"
          rel="noreferrer"
        >
          <img width={16} src={upRightFromSquareSolid} alt="記事を開く" />
        </a>
        <SummaryCloser />
      </div>
    </article>
  );
}

function SummaryCloser() {
  return (
    <button type="button" className={classes.summaryCloser}>
      <img width={16} src={xmarkSolid} alt="Close" />
    </button>
  );
}

function markdown(source: string): string {
  return DOMPurify.sanitize(marked.parse(source) as string);
}
