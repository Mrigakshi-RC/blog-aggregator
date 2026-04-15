import { readConfig, setUser } from "./config";

function main() {
  setUser('mrig_rc');
  const config=readConfig();
  console.log(config);
}

main();