import { lazy, type ReactNode } from "react";
import { useCurrentUser } from "~/firebase";

const SignUp = lazy(() => import("./SignUp"));

type Props = {
  children?: ReactNode;
};

export default function Auth({ children }: Props) {
  const user = useCurrentUser();
  if (!user) return <SignUp />;
  return <>{children}</>;
}
