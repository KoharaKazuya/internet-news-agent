import "dotenv/config";

import { dispatch } from "./cloud-run.js";
import { getAllUsers } from "./firebase.js";
import { log } from "./log.js";

async function main() {
  log("INFO", "Start dispatcher");

  // 全ユーザー一覧を取得する
  const users = await getAllUsers();

  // poller を起動する
  await dispatch(users);

  log("INFO", "End dispatcher");
}

main().catch((error) => {
  log("ERROR", `Failed to run main: ${error}`);
  process.exit(1);
});
