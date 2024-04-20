import { useCallback } from "react";
import ArticleCard from "~/components/ArticleCard";
import CardDeck from "~/components/CardDeck";
import LastCard from "~/components/LastCard";
import { useArticleIds } from "~/queries/article";

/** 末尾からこの個数までの記事が表示されたとき、続きを読み込む */
const prefetchThreshold = 5;

export default function ReadArticles() {
  const { articleIds, onTopChange } = useArticlesWithInfiniteScroll();
  return (
    <CardDeck
      count={articleIds.length + 1}
      renderCard={({ index }) =>
        index < articleIds.length ? (
          <ArticleCard id={articleIds[index]} />
        ) : (
          <LastCard shouldCheckNoFeed={articleIds.length === 0} />
        )
      }
      onTopChange={onTopChange}
    />
  );
}

function useArticlesWithInfiniteScroll() {
  const { data: articleIds, fetchNextPage } = useArticleIds();

  const onTopChange = useCallback(
    (index: number) => {
      if (articleIds.length - index <= prefetchThreshold) {
        fetchNextPage();
      }
    },
    [articleIds.length, fetchNextPage]
  );

  return { articleIds, onTopChange };
}
