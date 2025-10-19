import type { Preset } from "./types";
import { htmlPreset } from "./html-preset";
import { reactPreset } from "./react-preset";

export abstract class Presets {
  static HTML = htmlPreset;
  static REACT = reactPreset;

  static autoDetect(files: Record<string, string>): Preset {
    if (
      Object.keys(files).some(
        (file) => file.endsWith(".jsx") || file.endsWith(".tsx"),
      )
    ) {
      return Presets.REACT;
    }

    return Presets.HTML;
  }
}
