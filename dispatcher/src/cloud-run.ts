import { v2 } from "@google-cloud/run";
import { log } from "./log.js";

const jobsClient = new v2.JobsClient();

export async function dispatch(users: { id: string }[]): Promise<void> {
  log("INFO", `Dispatch poller for ${users.length} users`);

  // 環境変数およびジョブあたりのタスク数に上限があるためスケールしない設計だが、
  // 大規模になるまで問題は先送りにする
  //
  // @see https://cloud.google.com/run/quotas?hl=ja
  // 1 つのジョブの最大タスク数: 10,000
  // 環境変数の最大長: 32 KB
  await jobsClient.runJob({
    name: process.env.CLOUD_RUN_JOB_NAME,
    overrides: {
      containerOverrides: [
        {
          env: [
            {
              name: "TARGET_USERS",
              value: users.map(({ id }) => id).join("/"),
            },
          ],
        },
      ],
      taskCount: users.length,
    },
  });
}
