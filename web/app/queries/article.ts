import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  getArticle,
  getArticles,
  getUnreadArticles,
  type PaginationCursor,
} from "~/database/articles";
import { useCurrentUser } from "~/firebase";

export function useUnreadArticleIds() {
  const user = useCurrentUser();
  return useSuspenseQuery({
    queryKey: ["unreadArticles", user!.uid],
    queryFn: () => getUnreadArticles(user!.uid),
  });
}

export function useUnreadArticleCount() {
  const user = useCurrentUser();
  return useSuspenseQuery({
    queryKey: ["unreadArticleCount", user!.uid],
    queryFn: async () => {
      const articles = await getUnreadArticles(user!.uid);
      return articles.length;
    },
    refetchOnWindowFocus: true,
  });
}

export function useArticleIds() {
  const user = useCurrentUser();
  const { data, fetchNextPage } = useSuspenseInfiniteQuery({
    queryKey: ["articles"],
    queryFn: ({ pageParam }) =>
      getArticles({ userId: user!.uid, after: pageParam }),
    initialPageParam: undefined as PaginationCursor | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.articleIds.length === 0 ? undefined : lastPage.cursor,
  });

  return {
    data: data.pages.flatMap((page) => page.articleIds),
    fetchNextPage,
  };
}

export function useArticle(articleId: string) {
  const user = useCurrentUser();
  return useSuspenseQuery({
    queryKey: ["summarizedArticles", articleId],
    queryFn: () => getArticle(user!.uid, articleId),
  });
}
