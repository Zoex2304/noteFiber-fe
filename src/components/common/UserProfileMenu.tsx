import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadui/avatar";
import { useAuth } from "@/hooks/auth/useAuth";
import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserProfileMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Generate initials for avatar fallback
    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const handleLogout = () => {
        logout();
        navigate("/signin");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "User"} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-royal-violet-light text-royal-violet-base font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
