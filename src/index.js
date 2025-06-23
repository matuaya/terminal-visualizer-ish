#!/usr/bin/env node

import { PvRecorder } from "@picovoice/pvrecorder-node";
import { selectPrompt } from "./utils/prompt.js";
import { playVisualizer } from "./core/visualizer.js";
import { runCalibration } from "./core/calibration.js";

const DEFAULT_SAMPLE = [200, 3000];

async function main() {
  const availableMicrophones = PvRecorder.getAvailableDevices();
  if (availableMicrophones[0] === "NULL Capture Device") {
    console.log("Sorry, microphone was not detected.");

    return;
  }

  console.clear();

  const select = await selectPrompt(
    "Choose 'Sound Calibration' to set up the visualizer for your mic, or 'Skip' to just start!",
    [
      { name: "Sound Calibration", value: "calibrate" },
      { name: "Skip (Use Defaults)", value: "skip" },
    ],
  ).run();

  console.clear();

  let volumeSamples = DEFAULT_SAMPLE;
  if (select === "calibrate") {
    const calibrationSamples = await runCalibration();
    const lowest = calibrationSamples[0];
    const highest = calibrationSamples[1];

    const invalid = lowest > highest || highest - lowest < 800;
    volumeSamples = invalid ? volumeSamples : calibrationSamples;
  }

  await playVisualizer(volumeSamples);

  console.log("Exiting...");
}

main().catch((error) => {
  if (
    error &&
    error.message === "PvRecorder failed to read audio data frame."
  ) {
    console.error("Sampling was interrupted");
  } else if (error === "") {
    console.error("Prompt cancelled");
  } else {
    throw error;
  }
});
