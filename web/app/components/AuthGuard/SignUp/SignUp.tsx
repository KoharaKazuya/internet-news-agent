import clsx from "clsx";
import SignInWithGoogle from "./SignInWithGoogle";
import classes from "./SignUp.module.css";

export default function SignUp() {
  return (
    <div className={clsx("card", classes.auth)}>
      <Disclaimer />
      <SignInWithGoogle />
    </div>
  );
}

function Disclaimer() {
  return (
    <p className={classes.disclaimer}>
      このサイトは KoharaKazuya
      が自身のためのに個人的に作成したものです。使用に制限を設けませんが、作者は使用することで生じた損害に対する一切の責任を負いません。また
      <strong>外部の AI ツールを使用しており</strong> AI
      利用料金の負担の解消方法が見つけられていないため、
      <strong>
        予告なくユーザーデータ、ユーザーアカウントを削除することがあります
      </strong>
      。それらに同意の上、使用してください。
    </p>
  );
}
