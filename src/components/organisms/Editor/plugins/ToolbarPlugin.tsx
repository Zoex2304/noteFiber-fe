import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, TextFormatType } from "lexical";
import { Bold, Italic, Underline, Strikethrough, Code } from "lucide-react";
import { Button } from "@/components/shadui/button";

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const onClick = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    return (
        <div className="flex items-center gap-1 border-b border-gray-200 p-2 bg-white sticky top-0 z-10">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onClick("bold")}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onClick("italic")}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onClick("underline")}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Underline className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onClick("strikethrough")}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onClick("code")}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Code className="h-4 w-4" />
            </Button>
        </div>
    );
}
