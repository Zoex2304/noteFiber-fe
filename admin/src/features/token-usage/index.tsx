import { Main } from '@admin/components/layout/main';
import { TokenUsageTable } from './components/token-usage-table';
import { useTokenUsage } from './hooks/use-token-usage';
import { Activity } from 'lucide-react';

export function TokenUsage() {
    const { data: tokenUsage = [], isLoading } = useTokenUsage();

    return (
        <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Token Usage</h2>
                        <p className="text-muted-foreground">
                            Monitor AI usage across all users
                        </p>
                    </div>
                </div>
            </div>
            <TokenUsageTable data={tokenUsage} isLoading={isLoading} />
        </Main>
    );
}
