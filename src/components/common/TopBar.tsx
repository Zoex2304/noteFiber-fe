import { UserProfileMenu } from "@/components/common/UserProfileMenu";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { Button } from "@/components/shadui/button";
import { MessageSquare, Search } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { NotificationDropdown } from "@/components/organisms/NotificationDropdown";

interface TopBarProps {
    onSearchClick: () => void;
    onChatClick: () => void;
}

export const TopBar = ({ onSearchClick, onChatClick }: TopBarProps) => {
    const { checkPermission } = useSubscription();

    const showSearch = checkPermission('semantic_search');
    const showChat = checkPermission('ai_chat');

    return (
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-end px-4">
            {/* Actions */}
            <div className="flex items-center gap-1">
                {showSearch && (
                    <ActionTooltip label="Search">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onSearchClick}
                            className="h-8 w-8 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </ActionTooltip>
                )}

                {showChat && (
                    <ActionTooltip label="Chat with AI">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onChatClick}
                            className="h-8 w-8 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    </ActionTooltip>
                )}

                {(showSearch || showChat) && <div className="h-5 w-px bg-gray-200 mx-1" />}

                <NotificationDropdown />

                <div className="h-5 w-px bg-gray-200 mx-1" />

                <UserProfileMenu />
            </div>
        </div>
    );
};


