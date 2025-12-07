import { BlockTypeDropdown } from "./toolbar/BlockTypeDropdown";
import { FontControls } from "./toolbar/FontControls";
import { TextFormatControls } from "./toolbar/TextFormatControls";
import { AlignmentControls } from "./toolbar/AlignmentControls";
import { HistoryControls } from "./toolbar/HistoryControls";
import { TransformationControls } from "./toolbar/TransformationControls";
import { TooltipProvider } from "@/components/shadui/tooltip";
import { ToolbarButton } from "./toolbar/ToolbarButton";
import { Table, CheckSquare } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { INSERT_CHECK_LIST_COMMAND } from "@lexical/list";

// Temporary in-file Helper for Table/Checklist until fully atomic
function InsertControls() {
    const [editor] = useLexicalComposerContext();
    return (
        <div className="flex items-center gap-1">
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
    );
}

export default function ToolbarPlugin() {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 border-b border-gray-200 p-2 bg-white sticky top-0 z-10 flex-wrap">
                <HistoryControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <BlockTypeDropdown />
                <div className="w-[1px] h-6 bg-gray-200" />

                <FontControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <TextFormatControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <AlignmentControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <InsertControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <TransformationControls />
            </div>
        </TooltipProvider>
    );
}
