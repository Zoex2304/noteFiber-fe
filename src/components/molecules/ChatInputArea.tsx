import { useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/shadui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { PrefixHelper } from "@/components/molecules/PrefixHelper";
import { SlashCommandMenu } from "@/components/molecules/SlashCommandMenu";
import { ActiveModePills } from "@/components/molecules/ActiveModePills";

import { useSlashCommands, useChatInputModes, type ChatMode } from "@/hooks/chat";

export interface ChatInputAreaProps {
    /** Current input value */
    value: string;
    /** Handler for input changes */
    onChange: (value: string) => void;
    /** Handler when message should be sent */
    onSend: (content: string) => void;
    /** Whether input is disabled (e.g., loading) */
    disabled?: boolean;
    /** Optional class name */
    className?: string;
}

/**
 * Complete chat input area with slash commands, mode pills, and send button.
 * Orchestrates the input experience without containing business logic.
 */
export function ChatInputArea({
    value,
    onChange,
    onSend,
    disabled = false,
    className
}: ChatInputAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Slash command state
    const {
        showMenu,
        filteredCommands,
        activeIndex,
        navigateDown,
        navigateUp,
        closeMenu,
        processInput
    } = useSlashCommands();

    // Mode pills state
    const {
        activeModes,
        addMode,
        removeMode,
        removeLastMode,
        clearModes,
        isModeCommand,
        buildMessageContent
    } = useChatInputModes();

    // Process input for slash detection
    useEffect(() => {
        processInput(value);
    }, [value, processInput]);

    // Auto-resize textarea - reset to base height when empty
    useEffect(() => {
        if (textareaRef.current) {
            // Always reset first, then resize if there's content
            textareaRef.current.style.height = 'auto';
            if (value.trim()) {
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
            }
        }
    }, [value]);

    // Reset height on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, []);


    // Apply a slash command
    const applyCommand = useCallback((cmd: string) => {
        const cleanCmd = cmd.replace("/", "");

        if (isModeCommand(cmd)) {
            // Mode command -> add as pill
            addMode(cleanCmd as ChatMode);
            // Remove the typed command from input
            const parts = value.split(/(\s+)/);
            parts.pop();
            onChange(parts.join(""));
        } else {
            // Regular command -> insert in input
            const parts = value.split(/(\s+)/);
            parts.pop();
            onChange(parts.join("") + cmd + " ");
        }

        closeMenu();
        textareaRef.current?.focus();
    }, [value, onChange, addMode, isModeCommand, closeMenu]);

    // Handle prefix helper selection
    const handlePrefixSelect = useCallback((prefix: string) => {
        if (prefix === "/bypass" || prefix === "/nuance") {
            addMode(prefix.replace("/", "") as ChatMode);
        } else {
            onChange(prefix + value);
        }
    }, [value, onChange, addMode]);

    // Handle send
    const handleSend = useCallback(() => {
        if (!value.trim() && activeModes.length === 0) return;

        const content = buildMessageContent(value);
        clearModes();
        onChange("");

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        onSend(content);
    }, [value, activeModes.length, buildMessageContent, clearModes, onChange, onSend]);

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Slash menu navigation
        if (showMenu && filteredCommands.length > 0) {
            if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                applyCommand(filteredCommands[activeIndex].cmd);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                navigateUp();
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                navigateDown();
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                closeMenu();
                return;
            }
        }

        // Spacebar to confirm pill
        if (e.key === " " && !showMenu) {
            const lastWord = value.split(/(\s+)/).pop() || "";
            if (isModeCommand(lastWord)) {
                e.preventDefault();
                applyCommand(lastWord);
                return;
            }
        }

        // Backspace to remove last pill
        if (e.key === "Backspace" && value === "" && activeModes.length > 0) {
            e.preventDefault();
            removeLastMode();
            return;
        }

        // Enter to send
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [
        showMenu, filteredCommands, activeIndex, value, activeModes.length,
        applyCommand, navigateUp, navigateDown, closeMenu, isModeCommand,
        removeLastMode, handleSend
    ]);

    const canSend = value.trim() || activeModes.length > 0;

    return (
        <div className={cn("p-4 border-t border-gray-200 bg-white shrink-0 relative", className)}>
            {/* Slash Command Menu */}
            {showMenu && (
                <SlashCommandMenu
                    commands={filteredCommands}
                    activeIndex={activeIndex}
                    onSelect={applyCommand}
                />
            )}

            {/* Input Container */}
            <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:border-royal-violet-base focus-within:ring-1 focus-within:ring-royal-violet-base transition-all">
                <div className="flex items-end gap-1 w-full">
                    {/* Prefix Helper */}
                    <div className="mb-1 ml-1 self-center">
                        <PrefixHelper onSelect={handlePrefixSelect} />
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                        {/* Active Mode Pills */}
                        <ActiveModePills
                            modes={activeModes}
                            onRemove={removeMode}
                        />

                        {/* Text Input */}
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={activeModes.length > 0 ? "Type your prompt..." : "Ask anything..."}
                            className="flex-1 min-w-[50px] min-h-[40px] max-h-[200px] resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-2.5 px-2 bg-transparent text-sm placeholder:text-gray-400 overflow-y-auto"
                            disabled={disabled}
                            rows={1}
                        />
                    </div>

                    {/* Send Button */}
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!canSend || disabled}
                        className={cn(
                            "h-10 w-10 rounded-full transition-all shrink-0 mb-0.5",
                            canSend
                                ? "bg-gradient-primary-violet text-white hover:opacity-90 shadow-md"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        )}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                AI can make mistakes. Please verify important information.
            </div>
        </div>
    );
}
