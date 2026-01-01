import { Logo } from "@/components/shadui/Logo";
import { UserProfileMenu } from "@/components/common/UserProfileMenu";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PlanStatusPill } from "@/components/common/PlanStatusPill";
import { TokenUsageIndicator } from "@/components/common/TokenUsageIndicator";
import { NotificationDropdown } from "@/components/organisms/NotificationDropdown";

interface TopBarProps {
    onSearchClick: () => void;
    onChatClick: () => void;
}

export const TopBar = ({ onSearchClick, onChatClick }: TopBarProps) => {
    const { checkPermission, tokenUsage } = useSubscription();

    const showSearch = checkPermission('semantic_search');
    const showChat = checkPermission('ai_chat');

    return (
        <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
            {/* Left: Logo */}
            <div className="flex items-center">
                <Logo variant="horizontal" className="h-8" />
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2">
                {/* Plan Status Pill */}
                <PlanStatusPill className="mr-2" />

                {showSearch && (
                    <ActionTooltip label="Search">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSearchClick}
                            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </ActionTooltip>
                )}

                {showChat && (
                    <div className="flex items-center gap-2">
                        <ActionTooltip label="Chat with AI">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onChatClick}
                                className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full text-gray-600"
                            >
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        </ActionTooltip>
                        {tokenUsage.dailyLimit > 0 && (
                            <div className="w-32">
                                <TokenUsageIndicator
                                    dailyUsed={tokenUsage.dailyUsed}
                                    dailyLimit={tokenUsage.dailyLimit}
                                    percentage={tokenUsage.percentage}
                                    showLabel={false}
                                />
                                <p className="text-[10px] text-muted-foreground mt-0.5 text-center">
                                    {tokenUsage.dailyUsed}/{tokenUsage.dailyLimit}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {(showSearch || showChat) && <div className="h-6 w-px bg-gray-200 mx-2" />}

                {/* Notification Bell */}
                <NotificationDropdown />

                <div className="h-6 w-px bg-gray-200 mx-2" />

                <UserProfileMenu />
            </div>
        </div>
    );
};

