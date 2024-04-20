import { useCallback } from "react";
import ArticleCard from "~/components/ArticleCard";
import CardDeck from "~/components/CardDeck";
import LastCard from "~/components/LastCard";
import { markAsRead } from "~/database/articles";
import { useCurrentUser } from "~/firebase";
import { useUnreadArticleIds } from "~/queries/article";

export default function Index() {
  const { data: articleIds } = useUnreadArticleIds();
  const { onTopChange } = useReadDetector(articleIds);
  return (
    <CardDeck
      count={articleIds.length + 1}
      renderCard={({ index, current }) =>
        index < articleIds.length ? (
          <ArticleCard id={articleIds[index]} noSuspend={index === 0} />
        ) : (
          <LastCard
            top={current === index}
            shouldCheckNoFeed={articleIds.length === 0}
          />
        )
      }
      onTopChange={onTopChange}
    />
  );
}

function useReadDetector(articleIds: string[]) {
  const user = useCurrentUser();
  const onTopChange = useCallback(
    (index: number) => {
      for (const articleId of articleIds.slice(0, index)) {
        markAsReadWithoutDup(user!.uid, articleId);
      }
    },
    [articleIds, user]
  );
  return { onTopChange };
}

const readArticleIds: Record<string, Set<string>> = {};
async function markAsReadWithoutDup(userId: string, articleId: string) {
  readArticleIds[userId] ||= new Set<string>();
  if (readArticleIds[userId].has(articleId)) return;
  await markAsRead(userId, articleId);
  readArticleIds[userId].add(articleId);
}
