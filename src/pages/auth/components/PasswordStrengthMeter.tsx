import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
    score: number; // 0 to 4
}

export function PasswordStrengthMeter({ score }: PasswordStrengthMeterProps) {
    return (
        <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((level) => (
                <div
                    key={level}
                    className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        score >= level
                            ? score <= 2
                                ? "bg-red-500"
                                : score === 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            : "bg-gray-200"
                    )}
                />
            ))}
        </div>
    );
}
