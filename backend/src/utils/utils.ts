import * as Y from "yjs";

export abstract class Utils {
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static generateColor(): string {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  static encodeRelPos(rel: Y.RelativePosition): string {
    // Base64-encode the binary form so we can use it as a Map key
    return Buffer.from(Y.encodeRelativePosition(rel)).toString("base64");
  }
}
