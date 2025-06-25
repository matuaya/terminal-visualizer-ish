#!/usr/bin/env node

import { PvRecorder } from "@picovoice/pvrecorder-node";
import { selectPrompt } from "./utils/prompt.js";
import { playVisualizer } from "./core/visualizer.js";
import { runCalibration } from "./core/calibration.js";

const DEFAULT_SAMPLE = { lowest: 200, highest: 3000 };

async function main() {
  const availableMicrophones = PvRecorder.getAvailableDevices();
  if (availableMicrophones[0] === "NULL Capture Device") {
    console.log("Sorry, microphone was not detected.");

    return;
  }

  console.clear();

  try {
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
      const { lowest, highest } = calibrationSamples;

      const valid = lowest < highest && highest - lowest > 800;
      volumeSamples = valid ? calibrationSamples : volumeSamples;
    }

    await playVisualizer(volumeSamples);
  } catch (error) {
    if (error?.message === "PvRecorder failed to read audio data frame.") {
      console.error("Sampling was interrupted");
    } else if (error === "") {
      console.error("Prompt cancelled");
    } else {
      throw error;
    }
  }

  console.log("Exiting...");
}

main();
