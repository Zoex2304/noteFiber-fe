import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND } from "lexical";
import { Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, CheckSquare, Table } from "lucide-react";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { Button } from "@/components/shadui/button";

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const onClick = (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
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
            <div className="w-[1px] h-6 bg-gray-200 mx-1" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                className="h-8 w-8 p-0"
                type="button"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                className="h-8 w-8 p-0"
                type="button"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
                className="h-8 w-8 p-0"
                type="button"
            >
                <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: "3", rows: "3" })}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Table className="h-4 w-4" />
            </Button>
        </div>
    );
}
