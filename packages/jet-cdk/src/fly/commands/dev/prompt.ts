import chalk from "chalk";

export function usagePrompt() {
  console.info(
    chalk.yellowBright(
      chalk.bgBlack(
        `🛫 ${chalk.bold(
          chalk.white("Watching lambdas")
        )}\n(d) Deploy stack (x): Exit`
      )
    )
  );
}
