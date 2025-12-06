import { Logo } from "@/components/shadui/Logo";
import { UserProfileMenu } from "@/components/common/UserProfileMenu";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search } from "lucide-react";

interface TopBarProps {
    onSearchClick: () => void;
    onChatClick: () => void;
}

export const TopBar = ({ onSearchClick, onChatClick }: TopBarProps) => {
    return (
        <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
            {/* Left: Logo */}
            <div className="flex items-center">
                <Logo variant="horizontal" className="h-8" />
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSearchClick}
                    className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full text-gray-600"
                >
                    <Search className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onChatClick}
                    className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full text-gray-600"
                >
                    <MessageSquare className="h-5 w-5" />
                </Button>

                <div className="h-6 w-px bg-gray-200 mx-2" />

                <UserProfileMenu />
            </div>
        </div>
    );
};
