import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { ChevronDown, Check } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $createParagraphNode } from "lexical";
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useCallback, useEffect, useState } from "react";
import { $createCodeNode } from "@lexical/code";

const BLOCK_TYPES = {
    paragraph: "Normal",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    quote: "Quote",
    code: "Code Block",
};

export function BlockTypeDropdown() {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState<keyof typeof BLOCK_TYPES>("paragraph");

    const updateBlockType = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const element = anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();
                const elementType = element.getType();

                if (elementType in BLOCK_TYPES) {
                    // For headings, we need to check the tag
                    if (elementType === 'heading') {
                        // @ts-expect-error LexicalEditor type doesn't recognize dynamic command names
                        const tag = element.getTag();
                        setBlockType(tag);
                    } else {
                        setBlockType(elementType as keyof typeof BLOCK_TYPES);
                    }
                } else {
                    setBlockType("paragraph");
                }
            }
        });
    }, [editor]);

    // Listen for updates to update dropdown state
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateBlockType();
            });
        });
    }, [editor, updateBlockType]);


    const formatBlock = (type: string) => {
        if (type === "paragraph") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                }
            });
        } else if (type === "h1" || type === "h2" || type === "h3") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(type as HeadingTagType));
                }
            });
        } else if (type === "quote") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            });
        } else if (type === "code") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createCodeNode());
                }
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 min-w-[100px] justify-between">
                    <span className="truncate">{BLOCK_TYPES[blockType]}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {Object.entries(BLOCK_TYPES).map(([type, label]) => (
                    <DropdownMenuItem
                        key={type}
                        onClick={() => formatBlock(type)}
                        className="justify-between"
                    >
                        {label}
                        {blockType === type && <Check className="h-3 w-3" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
