import { signIn } from "~/firebase";
import classes from "./SignInWithGoogle.module.css";
import image from "./image.svg?inline";

export default function SignInWithGoogle() {
  return (
    <button type="button" className={classes.host} onClick={() => signIn()}>
      <img src={image} alt="Sign in with Google" />
    </button>
  );
}
