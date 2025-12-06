import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from "lexical";
import { useEffect } from "react";
import { $createVideoNode } from "../nodes/VideoNode";

export const INSERT_VIDEO_COMMAND: LexicalCommand<string> = createCommand(
    "INSERT_VIDEO_COMMAND"
);

export default function VideoPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand<string>(
            INSERT_VIDEO_COMMAND,
            (payload) => {
                const videoID = payload.includes("v=") ? payload.split("v=")[1] : payload;
                editor.update(() => {
                    const videoNode = $createVideoNode(videoID);
                    $insertNodeToNearestRoot(videoNode);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}
