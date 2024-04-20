import { NavLink, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import classes from "./NavigationMenu.module.css";
import barsSolid from "./bars-solid.svg?inline";
import xmarkSolid from "./xmark-solid.svg?inline";

export default function NavigationMenu() {
  const { isOpen, open, close } = useNavigationMenuState();

  return (
    <nav>
      <Opener onClick={open} />
      <Backdrop isOpen={isOpen} />
      <div className={clsx(classes.sidebar, isOpen && classes.isOpen)}>
        <Link to="/" text="新着記事" />
        <Link to="/read-articles" text="全記事一覧" />
        <Link to="/settings/prompt" text="要約 AI" />
        <Link to="/settings/feeds" text="サイト登録" />
        <Closer onClick={close} />
      </div>
    </nav>
  );
}

function Link({ to, text }: { to: string; text: string }) {
  return (
    <NavLink to={to} className={classes.link}>
      {text}
    </NavLink>
  );
}

function Opener({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className={classes.opener} onClick={onClick}>
      <img width={16} src={barsSolid} alt="Menu" />
    </button>
  );
}

function Closer({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className={classes.closer} onClick={onClick}>
      <img width={16} src={xmarkSolid} alt="Close" />
    </button>
  );
}

function Backdrop({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={clsx(classes.sidebarBackdrop, isOpen && classes.isOpen)} />
  );
}

function useNavigationMenuState() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const { pathname } = useLocation();
  useEffect(() => {
    close();
  }, [pathname]);

  return { isOpen, open, close };
}
