import readline from "readline";
import { recorder } from "./recorder.js";
import { isInterrupted } from "../utils/exit-handler.js";

const MAXIMUM_BAR_HEIGHT = 15;

export async function playVisualizer(calibrationSamples) {
  const terminalWidth = process.stdout.columns;
  const terminalHeight = process.stdout.rows;
  const yPosition = process.stdout.rows - 3;
  let xPosition = 0;

  setupVisualizer();

  while (!isInterrupted.status) {
    const frame = await recorder.read();
    const volume = calculateLoudness(frame);
    const barHeight = createBarHeight(calibrationSamples, volume);

    drawBar(xPosition, yPosition, barHeight);
    xPosition++;

    readline.cursorTo(process.stdout, 0, terminalHeight);

    if (xPosition > terminalWidth) {
      xPosition = 0;
      console.clear();
    }
  }

  cleanupVisualizer();
}

export function calculateLoudness(frame) {
  const meanSquare =
    frame.reduce((sum, value) => value * value + sum, 0) / frame.length;

  return Math.sqrt(meanSquare);
}

function createBarHeight(calibrationSamples, volume) {
  const lowest = calibrationSamples[0];
  const highest = calibrationSamples[1];
  const intervalValue = (highest - lowest) / (MAXIMUM_BAR_HEIGHT - 2);

  if (volume <= lowest) {
    return 1;
  } else if (volume > highest) {
    return MAXIMUM_BAR_HEIGHT;
  } else {
    return Math.round((volume - lowest) / intervalValue) + 1;
  }
}

function drawBar(xPosition, yPosition, barHeight) {
  for (let i = 0; i < barHeight; i++) {
    readline.cursorTo(process.stdout, xPosition, yPosition - i);
    process.stdout.write("┃");
  }
}

function setupVisualizer() {
  console.clear();
  recorder.start();
  hideCursor();
}

function cleanupVisualizer() {
  recorder.release();
  showCursor();
}

function hideCursor() {
  process.stdout.write("\u001B[?25l");
}

function showCursor() {
  process.stdout.write("\u001B[?25h");
}
