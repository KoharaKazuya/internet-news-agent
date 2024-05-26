import { useSuspenseQuery } from "@tanstack/react-query";

/** 画像読み込み待ちのタイムアウト (ms) */
const imgLoadTimeout = 10000;

export function useImageAspectRatio(url: string | undefined) {
  return useSuspenseQuery({
    queryKey: ["thumbnail", url],
    queryFn: async () => {
      if (!url) return 1;
      const img = await fetchImage(url);
      if (!img) return 1;
      return img.naturalWidth / img.naturalHeight;
    },
    // 記事一覧のサムネイル画像はスクロールによって非表示 (unmount) されて
    // 復活された後でもキャッシュを利用したいので、mount 時の再取得を無効化する
    refetchOnMount: false,
  });
}

function fetchImage(url: string) {
  const imgPromise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), imgLoadTimeout);
  });
  return Promise.race([imgPromise, timeoutPromise]);
}
