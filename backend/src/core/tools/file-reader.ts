import { Tool } from "../../ai-clients";
import { TextWriter } from "../text-writer";

export const FILE_READER_TOOL: Tool<void> = {
  name: "file_reader",
  description: "Reads the contents of a file and returns it as a string.",
  handler: async (_, context) => {
    const textWriter = context?.textWriter as TextWriter | undefined;
    if (!textWriter) {
      return "Error: TextWriter not found in context";
    }

    const { text } = textWriter.getText();

    return text.toString();
  },
};
