import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";
import { throttle } from "throttle-debounce";
import classes from "./CardDeck.module.css";

/** トップ (現在表示されているカード) よりいくつ前までレンダリングするか */
const renderBefore = 5;
/** トップ (現在表示されているカード) よりいくつ後までレンダリングするか */
const renderAfter = 4;
/** トップ (現在表示されているカード) 変更検知のためのマーカー */
const scrollObserverMarker = "js-scroll-observer-index";

export default function CardDeck({
  count,
  renderCard,
  onTopChange,
}: {
  /** カード総数 */
  count: number;
  renderCard?: (attrs: { index: number; current: number }) => ReactNode;
  onTopChange?: (index: number) => void;
}) {
  const { currentTopIndex: current, setScroller } = useScrollObserver({
    onTopChange,
  });

  const skip = Math.max(0, current - renderBefore);
  const rest = Math.max(0, count - (current + 1 + renderAfter));

  return (
    <div
      className={clsx(classes.deck, "lock-scroll-on-has-locker")}
      ref={setScroller}
    >
      <Pad size={skip} />
      {[...Array(count).keys()].slice(skip, count - rest).map((index) => (
        <CardSleeve key={index} index={index} zIndex={count - index}>
          {renderCard?.({ index, current })}
        </CardSleeve>
      ))}
      <Pad size={rest} />
    </div>
  );
}

function Pad({ size }: { size: number }) {
  const height = `calc(100% * ${size})`;
  return <div style={{ height }} />;
}

function CardSleeve({
  index,
  zIndex,
  children,
}: {
  index: number;
  zIndex?: number;
  children?: ReactNode;
}) {
  return (
    <>
      <div className={classes.anchor} {...{ [scrollObserverMarker]: index }} />
      <div className={classes.sleeve} style={{ zIndex }}>
        {children}
      </div>
    </>
  );
}

function useScrollObserver({
  onTopChange,
}: {
  onTopChange?: (index: number) => void;
}) {
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!scroller) return;

    const listener = () => {
      const { top: scrollerTop } = scroller.getBoundingClientRect();

      const topElement = [
        ...scroller.querySelectorAll(`[${scrollObserverMarker}]`),
      ]
        .reverse()
        .find((elem) => elem.getBoundingClientRect().top <= scrollerTop);
      if (!topElement) return;

      const newIndex = Number(topElement.getAttribute(scrollObserverMarker));
      if (newIndex !== currentTopIndex) {
        setCurrentTopIndex(newIndex);
        onTopChange?.(newIndex);

        // iOS Safari でスクロール位置がずれる問題の対策
        // 参考: https://codepen.io/koharakazuya/pen/MWRxgPw
        scroller.style.scrollSnapType = "none";
        setTimeout(() => {
          scroller.style.scrollSnapType = "";
        }, 1);
      }
    };
    const lis = throttle(500, listener, { noLeading: true });

    scroller.addEventListener("scroll", lis, { passive: true });
    return () => scroller.removeEventListener("scroll", lis);
  }, [currentTopIndex, onTopChange, scroller]);

  return { currentTopIndex, setScroller };
}
