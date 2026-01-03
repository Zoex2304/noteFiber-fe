import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';

export interface ChatEmptyStateProps {
    /** Optional custom title */
    title?: string;
    /** Optional custom description */
    description?: string;
}

/**
 * Empty state component for chat interface.
 * Shows animated Lottie illustration with welcome message.
 */
export function ChatEmptyState({
    title = "How can I help you?",
    description = "Ask questions about your notes or generate new ideas."
}: ChatEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-400 p-8 space-y-2">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="rounded-full overflow-hidden"
            >
                <div className="w-52 h-52">
                    <DotLottieReact
                        src="https://lottie.host/b00c932e-94d9-407f-9893-8e00ce7a55f3/hanmwXSGzz.lottie"
                        loop
                        autoplay
                    />
                </div>
            </motion.div>

            <div>
                <h3 className="text-gray-900 font-medium mb-1">{title}</h3>
                <p className="text-sm max-w-[200px] mx-auto">{description}</p>
            </div>
        </div>
    );
}
