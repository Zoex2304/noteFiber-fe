import { Label } from '@admin/components/ui/label'
import { Input } from '@admin/components/ui/input'
import { Switch } from '@admin/components/ui/switch'
import { cn } from '@admin/lib/utils'
import { FileText, Search, MessageSquare } from 'lucide-react'

interface PlanFeaturesEditorProps {
    maxNotes: number
    onMaxNotesChange: (value: number) => void
    semanticSearch: boolean
    onSemanticSearchChange: (value: boolean) => void
    aiChat: boolean
    onAiChatChange: (value: boolean) => void
    disabled?: boolean
    className?: string
}

export function PlanFeaturesEditor({
    maxNotes,
    onMaxNotesChange,
    semanticSearch,
    onSemanticSearchChange,
    aiChat,
    onAiChatChange,
    disabled,
    className,
}: PlanFeaturesEditorProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div>
                <h3 className='mb-3 text-sm font-medium'>Plan Features</h3>

                {/* Max Notes */}
                <div className='space-y-2'>
                    <Label htmlFor='max-notes' className='flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        Maximum Notes
                    </Label>
                    <Input
                        id='max-notes'
                        type='number'
                        step='1'
                        min='0'
                        placeholder='0 (unlimited)'
                        value={maxNotes}
                        onChange={(e) => onMaxNotesChange(parseInt(e.target.value) || 0)}
                        disabled={disabled}
                    />
                    <p className='text-muted-foreground text-xs'>
                        Set to 0 for unlimited notes
                    </p>
                </div>

                {/* Semantic Search Toggle */}
                <div className='flex items-center justify-between space-y-2 pt-4'>
                    <div className='space-y-0.5'>
                        <Label htmlFor='semantic-search' className='flex items-center gap-2'>
                            <Search className='h-4 w-4' />
                            Semantic Search
                        </Label>
                        <p className='text-muted-foreground text-xs'>
                            Enable AI-powered semantic search
                        </p>
                    </div>
                    <Switch
                        id='semantic-search'
                        checked={semanticSearch}
                        onCheckedChange={onSemanticSearchChange}
                        disabled={disabled}
                    />
                </div>

                {/* AI Chat Toggle */}
                <div className='flex items-center justify-between space-y-2 pt-4'>
                    <div className='space-y-0.5'>
                        <Label htmlFor='ai-chat' className='flex items-center gap-2'>
                            <MessageSquare className='h-4 w-4' />
                            AI Chat
                        </Label>
                        <p className='text-muted-foreground text-xs'>
                            Enable AI assistant chat feature
                        </p>
                    </div>
                    <Switch
                        id='ai-chat'
                        checked={aiChat}
                        onCheckedChange={onAiChatChange}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    )
}
