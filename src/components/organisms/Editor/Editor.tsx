import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS, $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { editorTheme } from "./theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import "./Editor.css";

function Placeholder() {
    return <div className="editor-placeholder">Enter some text...</div>;
}

// Plugin to handle initial content loading
function MarkdownLoaderPlugin({ content }: { content: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(() => {
            $convertFromMarkdownString(content, TRANSFORMERS);
        });
    }, [content, editor]);

    return null;
}

const editorConfig = {
    namespace: "NoteFiberEditor",
    theme: editorTheme,
    onError(error: Error) {
        throw error;
    },
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        AutoLinkNode,
        LinkNode
    ]
};

interface EditorProps {
    initialContent?: string;
    onChange?: (markdown: string) => void;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
    const onChangeHandler = (editorState: any) => {
        editorState.read(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            if (onChange) {
                onChange(markdown);
            }
        });
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col w-full h-full min-h-[500px]">
                <ToolbarPlugin />
                <div className="editor-inner relative flex-1 overflow-auto">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input h-full" />}
                        placeholder={<Placeholder />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                    <OnChangePlugin onChange={onChangeHandler} />
                    <MarkdownLoaderPlugin content={initialContent} />
                </div>
            </div>
        </LexicalComposer>
    );
}
