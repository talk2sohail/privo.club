"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
	step: number;
}

export function WizardProgress({ step }: WizardProgressProps) {
	return (
		<div className="p-6 pb-0">
			<div className="flex justify-between items-center mb-4 pr-8">
				<div className="flex gap-2">
					{[1, 2, 3].map((s) => (
						<div 
							key={s} 
							className={cn(
								"h-1.5 w-8 rounded-full transition-all duration-500",
								step >= s ? "bg-primary w-12" : "bg-white/10"
							)}
						/>
					))}
				</div>
				<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
					Step {step} of 3
				</span>
			</div>
			
			<DialogHeader>
				<DialogTitle className="text-2xl font-bold tracking-tight">
					{step === 1 && "Start with the details"}
					{step === 2 && "When & Where?"}
					{step === 3 && "Final Look"}
				</DialogTitle>
			</DialogHeader>
		</div>
	);
}
