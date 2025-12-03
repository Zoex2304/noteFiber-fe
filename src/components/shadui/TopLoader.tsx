import { useEffect, useState } from "react";
import { useLocation, useNavigation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TopLoader() {
    const location = useLocation();
    const navigation = useNavigation();
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Start loading on route change or navigation state change
        const isLoading = navigation.state === "loading" || navigation.state === "submitting";

        if (isLoading) {
            setIsVisible(true);
            setProgress(30);
        } else {
            // If navigation is idle, we might still want to show a quick progress on location change
            // to simulate loading for client-side transitions
            setIsVisible(true);
            setProgress(30);

            // Finish quickly
            const timer = setTimeout(() => {
                setProgress(100);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [location, navigation.state]);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
            }, 500); // Fade out delay
            return () => clearTimeout(timer);
        }
    }, [progress]);

    useEffect(() => {
        if (isVisible && progress < 90) {
            const timer = setInterval(() => {
                setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
            }, 500);
            return () => clearInterval(timer);
        }
    }, [isVisible, progress]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-100">
            <div
                className={cn(
                    "h-full bg-gradient-to-r from-royal-violet-base to-royal-violet-muted transition-all duration-500 ease-out"
                )}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
