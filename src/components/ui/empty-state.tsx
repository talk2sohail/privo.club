import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    actionLink?: string
    actionComponent?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionLink, actionComponent }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-3xl border border-dashed border-muted-foreground/20 bg-muted/5 hover:bg-muted/10 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {actionComponent ? (
                actionComponent
            ) : actionLabel && actionLink ? (
                <Link href={actionLink}>
                    <Button>{actionLabel}</Button>
                </Link>
            ) : null}
        </div>
    )
}
