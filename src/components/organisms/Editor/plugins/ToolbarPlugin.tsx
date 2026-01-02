import { BlockTypeDropdown } from "./toolbar/BlockTypeDropdown";
import { FontControls } from "./toolbar/FontControls";
import { TextFormatControls } from "./toolbar/TextFormatControls";
import { ColorPickerControls } from "./toolbar/ColorPickerControls";
import { AlignmentControls } from "./toolbar/AlignmentControls";
import { HistoryControls } from "./toolbar/HistoryControls";
import { TransformationControls } from "./toolbar/TransformationControls";
import { ClearFormatButton } from "./toolbar/ClearFormatButton";
import { ImageControls } from "./toolbar/ImageControls";
import { TooltipProvider } from "@/components/shadui/tooltip";
import { ToolbarButton } from "./toolbar/ToolbarButton";
import { Table, CheckSquare, Minus, Link, Paperclip } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { TableInsertDialog } from "./toolbar/TableInsertDialog";
import { useState, useRef } from "react";
import { $createFileNode } from "../nodes/FileNode";
import { $insertNodeToNearestRoot } from "@lexical/utils";

function InsertControls() {
    const [editor] = useLexicalComposerContext();
    const [tableDialogOpen, setTableDialogOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const insertLink = () => {
        if (!editor.isEditable()) return;
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const src = URL.createObjectURL(file);
            editor.update(() => {
                const fileNode = $createFileNode(src, file.name, formatBytes(file.size), file.type);
                $insertNodeToNearestRoot(fileNode);
            });
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="flex items-center gap-1">
            <ToolbarButton
                onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
                icon={CheckSquare}
                label="Checklist"
            />
            <ToolbarButton
                onClick={() => setTableDialogOpen(true)}
                icon={Table}
                label="Insert Table"
            />
            <ImageControls />
            <ToolbarButton
                onClick={handleFileClick}
                icon={Paperclip}
                label="Insert Attachment"
            />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
                icon={Minus}
                label="Horizontal Rule"
            />
            <ToolbarButton
                onClick={insertLink}
                icon={Link}
                label="Insert Link"
            />
            <TableInsertDialog
                open={tableDialogOpen}
                onOpenChange={setTableDialogOpen}
            />
        </div>
    );
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function ToolbarPlugin() {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-1.5 border-b border-gray-200 p-2 bg-white sticky top-0 z-10 flex-wrap">
                <HistoryControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <BlockTypeDropdown />
                <div className="w-[1px] h-6 bg-gray-200" />

                <FontControls />
                <div className="w-[1px] h-6 bg-gray-200" />

                <TextFormatControls />
                <ColorPickerControls />
                <ClearFormatButton />
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
