import classes from "./SplashScreen.module.css";
import iconSvg from "./icon192.svg?inline";

export default function SplashScreen() {
  return (
    <div className={classes.host}>
      <Icon />
    </div>
  );
}

function Icon() {
  return (
    <img
      className={classes.icon}
      width={192}
      height={192}
      src={iconSvg}
      alt="アプリのロゴアイコン"
    />
  );
}
