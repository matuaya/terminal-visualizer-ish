export const isInterrupted = { status: false };

process.on("SIGINT", () => {
  console.log();
  isInterrupted.status = true;
});
