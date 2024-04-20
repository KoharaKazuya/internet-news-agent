import clsx from "clsx";
import classes from "./LoadingCard.module.css";

export default function LoadingCard() {
  return (
    <div className={clsx("card", classes.host)}>
      <div className={classes.spinner} />
    </div>
  );
}
