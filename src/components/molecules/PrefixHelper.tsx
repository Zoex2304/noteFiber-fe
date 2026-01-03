import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/shadui/popover";
import { Button } from "@/components/shadui/button";
import { Command } from "lucide-react";
import { Badge } from "@/components/shadui/badge";

interface PrefixHelperProps {
    onSelect: (prefix: string) => void;
}

export const CHAT_COMMANDS = [
    { cmd: "/bypass", desc: "No RAG (Direct)" },
    { cmd: "/nuance:engineering", desc: "Technical Mode" },
    { cmd: "/nuance:creative", desc: "Creative Mode" },
    { cmd: "/nuance:formal", desc: "Professional Tone" },
    { cmd: "/nuance:concise", desc: "Brief Answers" },
];

export function PrefixHelper({ onSelect }: PrefixHelperProps) {
    const prefixes = CHAT_COMMANDS;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Command className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2">
                    <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground">Available Commands</h4>
                    <div className="grid gap-1">
                        {prefixes.map((p) => (
                            <button
                                key={p.cmd}
                                onClick={() => onSelect(p.cmd + " ")}
                                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">{p.cmd}</code>
                                <span className="text-xs text-muted-foreground">{p.desc}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 border-t pt-2 px-2 pb-1">
                        <p className="text-xs text-muted-foreground">
                            Type <code className="text-xs">/</code> to see suggestions while typing.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
