import { useRef, useEffect, useCallback, useMemo } from "react";
import { Send, X, FileText } from "lucide-react";
import { Button } from "@/components/shadui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shadui/badge";
import { cn } from "@/lib/utils";

import { PrefixHelper } from "@/components/molecules/PrefixHelper";
import { SuggestionMenu } from "@/components/molecules/SuggestionMenu";
import { ActiveModePills } from "@/components/molecules/ActiveModePills";

import { useChatInputModes } from "@/hooks/chat";
import { useChatStore } from "@/stores/useChatStore";
import { useNuances } from "@/hooks/chat/useNuances";
import { useInputSuggestions, type SuggestionItem } from "@/hooks/chat/useInputSuggestions";
import type { Note } from "@/types/note";

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
    /** Available notes for autocomplete */
    notes: Note[];
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
    className,
    notes = []
}: ChatInputAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // References state
    const { preloadedReferences, setPreloadedReferences } = useChatStore();

    // Fetch Nuances
    const { nuances } = useNuances();

    // Build suggestion commands
    const commands: SuggestionItem[] = useMemo(() => {
        const staticCmds: SuggestionItem[] = [
            { id: 'bypass', label: '/bypass', subLabel: 'Skip RAG, pure LLM', type: 'command', value: '/bypass ' }
        ];

        const nuanceCmds: SuggestionItem[] = nuances.map(n => ({
            id: `nuance-${n.key}`,
            label: `/${n.key}`,
            subLabel: n.description,
            type: 'command',
            value: `/${n.key} ` // Append space
        }));

        return [...staticCmds, ...nuanceCmds];
    }, [nuances]);

    // Input Suggestions (Slash + At)
    const {
        showMenu,
        filteredItems,
        activeIndex,
        navigateDown,
        navigateUp,
        closeMenu,
        processInput
    } = useInputSuggestions({ commands, notes });

    // Mode pills state
    const {
        activeModes,
        addMode,
        removeMode,
        removeLastMode,
        clearModes,
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


    // Handle suggestion selection
    const applySuggestion = useCallback((applyValue: string) => {
        const parts = value.split(/(\s+)/);
        parts.pop(); // Remove the incomplete trigger word
        const baseValue = parts.join("");

        const trimmedValue = applyValue.trim();

        // Is it a command/nuance?
        if (trimmedValue.startsWith("/")) {
            // Convert to pill
            const mode = trimmedValue.replace("/", "");
            addMode(mode);
            onChange(baseValue); // Keep text without the command
        } else {
            // It's a note or other text insertion
            onChange(baseValue + applyValue + " "); // Ensure space
        }

        closeMenu();
        textareaRef.current?.focus();
    }, [value, onChange, closeMenu, addMode]);

    // Handle prefix helper selection
    const handlePrefixSelect = useCallback((prefix: string) => {
        onChange(prefix + value);
    }, [value, onChange]);

    // Handle send
    const handleSend = useCallback(() => {
        if (!value.trim() && activeModes.length === 0 && preloadedReferences.length === 0) return;

        const content = buildMessageContent(value);
        clearModes();
        onChange("");

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        onSend(content);
    }, [value, activeModes.length, preloadedReferences.length, buildMessageContent, clearModes, onChange, onSend]);

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Menu navigation
        if (showMenu && filteredItems.length > 0) {
            if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                applySuggestion(filteredItems[activeIndex].value);
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

        // Backspace to remove last pill or reference
        if (e.key === "Backspace" && value === "") {
            if (activeModes.length > 0) {
                e.preventDefault();
                removeLastMode();
                return;
            }
            // Remove last reference if exists
            // (Optional, maybe specific to user pref, but standard behavior in some apps)
        }

        // Enter to send
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [
        showMenu, filteredItems, activeIndex, value, activeModes.length,
        applySuggestion, navigateUp, navigateDown, closeMenu,
        removeLastMode, handleSend
    ]);

    const handleRemoveReference = (id: string) => {
        setPreloadedReferences(preloadedReferences.filter(n => n.id !== id));
    };

    const canSend = value.trim() || activeModes.length > 0 || preloadedReferences.length > 0;

    return (
        <div className={cn("p-4 border-t border-gray-200 bg-white shrink-0 relative", className)}>
            {/* Suggestion Menu */}
            {showMenu && (
                <SuggestionMenu
                    items={filteredItems}
                    activeIndex={activeIndex}
                    onSelect={applySuggestion}
                />
            )}

            {/* Input Container */}
            <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:border-royal-violet-base focus-within:ring-1 focus-within:ring-royal-violet-base transition-all">

                {/* Reference Chips */}
                {preloadedReferences.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1 pb-1 border-b border-gray-100 mb-1">
                        {preloadedReferences.map(note => (
                            <Badge
                                key={note.id}
                                variant="secondary"
                                className="bg-purple-50 text-purple-700 hover:bg-purple-100 gap-1 pl-2 pr-1 py-1 h-auto font-medium border border-purple-100"
                            >
                                <FileText className="h-3 w-3 opacity-70" />
                                <span className="max-w-[150px] truncate">{note.title}</span>
                                <button
                                    onClick={() => handleRemoveReference(note.id)}
                                    className="ml-1 p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
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
                            placeholder={activeModes.length > 0 || preloadedReferences.length > 0 ? "Type your prompt..." : "Ask anything (type @ for notes)..."}
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
