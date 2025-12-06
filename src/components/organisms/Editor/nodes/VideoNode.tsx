import { DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import * as React from "react";

export type SerializedVideoNode = Spread<
    {
        videoID: string;
    },
    SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<JSX.Element> {
    __id: string;

    static getType(): string {
        return "video";
    }

    static clone(node: VideoNode): VideoNode {
        return new VideoNode(node.__id, node.__key);
    }

    static importJSON(serializedNode: SerializedVideoNode): VideoNode {
        const node = $createVideoNode(serializedNode.videoID);
        return node;
    }

    exportJSON(): SerializedVideoNode {
        return {
            type: "video",
            videoID: this.__id,
            version: 1,
        };
    }

    constructor(id: string, key?: NodeKey) {
        super(key);
        this.__id = id;
    }

    updateDOM(): false {
        return false;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement("div");
        div.className = "editor-video";
        return div;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("iframe");
        element.setAttribute("data-lexical-video", this.__id);
        element.setAttribute("width", "560");
        element.setAttribute("height", "315");
        element.setAttribute("src", `https://www.youtube.com/embed/${this.__id}`);
        element.setAttribute("frameborder", "0");
        element.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
        element.setAttribute("allowfullscreen", "true");
        return { element };
    }

    decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
        return (
            <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${this.__id}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full h-auto"
                title="YouTube video player"
            />
        );
    }
}

export function $createVideoNode(videoID: string): VideoNode {
    return new VideoNode(videoID);
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
    return node instanceof VideoNode;
}
