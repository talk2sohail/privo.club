"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface StepDetailsProps {
	step: number;
	title: string;
	onTitleChange: (val: string) => void;
	description: string;
	onDescriptionChange: (val: string) => void;
	circles: { id: string; name: string }[];
	selectedCircleId: string;
	onCircleChange: (val: string) => void;
	disabledCircleSelection?: boolean;
}

export function StepDetails({
	step,
	title,
	onTitleChange,
	description,
	onDescriptionChange,
	circles,
	selectedCircleId,
	onCircleChange,
	disabledCircleSelection,
}: StepDetailsProps) {
	return (
		<div className={cn(
			"absolute inset-0 px-6 space-y-4 transition-all duration-500 ease-out flex flex-col justify-start pt-6 pb-6",
			step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
		)}>
			<div className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Event Title
					</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => onTitleChange(e.target.value)}
						placeholder="e.g., Sarah's Birthday Dinner"
						className="h-12 text-base border-white/10 bg-white/5 focus-visible:ring-primary rounded-xl"
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Circle / Hive
					</Label>
					<Select value={selectedCircleId} onValueChange={onCircleChange} disabled={disabledCircleSelection}>
						<SelectTrigger className="h-12 text-base border-white/10 bg-white/5 rounded-xl">
							<SelectValue placeholder="Select a hive" />
						</SelectTrigger>
						<SelectContent className="glass border-white/20 backdrop-blur-3xl">
							{circles.map((circle) => (
								<SelectItem key={circle.id} value={circle.id} className="h-10 focus:bg-primary/20">
									{circle.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						Short Description
					</Label>
					<Input
						id="description"
						value={description}
						onChange={(e) => onDescriptionChange(e.target.value)}
						placeholder="Optional: Tell them more..."
						className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary rounded-xl"
					/>
				</div>
			</div>
		</div>
	);
}
