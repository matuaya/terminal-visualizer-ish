import { recorder } from "./recorder.js";

export const isInterrupted = { status: false };

process.on("SIGINT", () => {
  console.log();
  isInterrupted.status = true;
  recorder.release();
  showCursor();
  return;
});

function showCursor() {
  process.stdout.write("\u001B[?25h");
}
