import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { ChevronDown } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useCallback, useState } from "react";

const FONT_FAMILIES = {
    "Arial": "Arial",
    "Courier New": "Courier New",
    "Georgia": "Georgia",
    "Times New Roman": "Times New Roman",
    "Trebuchet MS": "Trebuchet MS",
    "Verdana": "Verdana",
};

const FONT_SIZES = {
    "10px": "10px",
    "12px": "12px",
    "14px": "14px",
    "16px": "16px",
    "18px": "18px",
    "20px": "20px",
    "24px": "24px",
    "30px": "30px",
};

export function FontControls() {
    const [editor] = useLexicalComposerContext();
    const [fontFamily, setFontFamily] = useState<string>("Arial");
    const [fontSize, setFontSize] = useState<string>("16px");

    const applyStyle = useCallback((styles: Record<string, string>) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, styles);
            }
        });
    }, [editor]);

    const handleFontFamilyChange = (value: string) => {
        setFontFamily(value);
        applyStyle({ "font-family": value });
    };

    const handleFontSizeChange = (value: string) => {
        setFontSize(value);
        applyStyle({ "font-size": value });
    };

    return (
        <div className="flex items-center gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 min-w-[80px] justify-between">
                        <span className="truncate">{Object.entries(FONT_FAMILIES).find(([, v]) => v === fontFamily)?.[0] || 'Font'}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {Object.entries(FONT_FAMILIES).map(([name, value]) => (
                        <DropdownMenuItem
                            key={value}
                            onClick={() => handleFontFamilyChange(value)}
                            style={{ fontFamily: value }}
                        >
                            {name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 min-w-[60px] justify-between">
                        <span className="truncate">{fontSize}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {Object.entries(FONT_SIZES).map(([name, value]) => (
                        <DropdownMenuItem
                            key={value}
                            onClick={() => handleFontSizeChange(value)}
                        >
                            {name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
