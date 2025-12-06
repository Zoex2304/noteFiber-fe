import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND } from "lexical";
import { Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, CheckSquare, Table, type LucideIcon } from "lucide-react";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { Button } from "@/components/shadui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadui/tooltip";

interface ToolbarButtonProps {
    onClick: () => void;
    icon: LucideIcon;
    label: string;
}

const ToolbarButton = ({ onClick, icon: Icon, label }: ToolbarButtonProps) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="ghost"
                size="sm"
                onClick={onClick}
                className="h-8 w-8 p-0"
                type="button"
            >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>{label}</p>
        </TooltipContent>
    </Tooltip>
);

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const formatText = (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1 border-b border-gray-200 p-2 bg-white sticky top-0 z-10">
                <ToolbarButton onClick={() => formatText("bold")} icon={Bold} label="Bold" />
                <ToolbarButton onClick={() => formatText("italic")} icon={Italic} label="Italic" />
                <ToolbarButton onClick={() => formatText("underline")} icon={Underline} label="Underline" />
                <ToolbarButton onClick={() => formatText("strikethrough")} icon={Strikethrough} label="Strikethrough" />
                <ToolbarButton onClick={() => formatText("code")} icon={Code} label="Code Block" />

                <div className="w-[1px] h-6 bg-gray-200 mx-1" />

                <ToolbarButton
                    onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                    icon={List}
                    label="Bullet List"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                    icon={ListOrdered}
                    label="Numbered List"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
                    icon={CheckSquare}
                    label="Checklist"
                />
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: "3", rows: "3" })}
                    icon={Table}
                    label="Insert Table"
                />
            </div>
        </TooltipProvider>
    );
}
