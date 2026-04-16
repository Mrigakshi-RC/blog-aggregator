import { commandsRegistry, runCommand } from "./commandsRegistry";

async function main() {
  const args=process.argv.slice(2);
  if (args.length === 0) {
    console.log("No command provided");
    process.exit(1);
  }
  const cmdName=args[0];
  const cmdArgs=args.slice(1);
  if (!(cmdName in commandsRegistry)) {
    console.log(`Command ${cmdName} not found`);
    process.exit(1);
  }
  await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  process.exit(0);
}

main();