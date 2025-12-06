import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS, $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { EditorNodes } from "./nodes";
import { editorTheme } from "./theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TablePlugin from "./plugins/TablePlugin";
import CheckListPlugin from "./plugins/CheckListPlugin";
import HashtagPlugin from "./plugins/HashtagPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import "./Editor.css";

function Placeholder() {
    return <div className="editor-placeholder">Enter some text...</div>;
}

// Plugin to handle initial content loading (JSON first, Markdown fallback)
function InitialStatePlugin({ content }: { content: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!content) return;

        editor.update(() => {
            try {
                // Try parsing as JSON first
                const parsedState = JSON.parse(content);
                if (parsedState.root) {
                    const editorState = editor.parseEditorState(parsedState);
                    editor.setEditorState(editorState);
                    return;
                }
            } catch (e) {
                // Not valid JSON, fall back to Markdown
            }

            // Fallback: Convert from Markdown
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
    nodes: EditorNodes
};

interface EditorProps {
    initialContent?: string;
    onChange?: (jsonString: string) => void;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
    const onChangeHandler = (editorState: any) => {
        editorState.read(() => {
            // Serialize to JSON to preserve full Lexical state (tables, checklists, etc.)
            const jsonState = editorState.toJSON();
            if (onChange) {
                onChange(JSON.stringify(jsonState));
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
                    <InitialStatePlugin content={initialContent} />
                    {/* Extended Plugins */}
                    <TablePlugin />
                    <CheckListPlugin />
                    <HashtagPlugin />
                    <CodeHighlightPlugin />
                    <MentionsPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}
