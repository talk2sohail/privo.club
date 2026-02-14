"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Clock, Eye, Sparkles, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface StepPreviewProps {
	step: number;
	title: string;
	date: Date | undefined;
	time: string;
	location: string;
	selectedCircleName: string;
	coverImage: string;
	onCoverImageChange: (img: string) => void;
	covers: string[];
}

export function StepPreview({
	step,
	title,
	date,
	time,
	location,
	selectedCircleName,
	coverImage,
	onCoverImageChange,
	covers,
}: StepPreviewProps) {
	return (
		<div className={cn(
			"absolute inset-0 px-6 transition-all duration-500 ease-out flex items-center justify-between gap-6",
			step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
		)}>
			{/* Left: Preview Card */}
			<div className="flex-1 relative group perspective-1000">
				<div className="relative w-full aspect-[4/5] max-w-[240px] rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-purple-500/30 p-[1px] shadow-2xl transition-all duration-700 group-hover:rotate-y-12">
					<div className="w-full h-full bg-black/40 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden flex flex-col p-6 border border-white/10 relative">
						{/* Mock Cover Image */}
						<div className="absolute inset-0 opacity-40">
							<img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
							<div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
						</div>

						<div className="absolute top-0 right-0 p-4 z-10">
							<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-primary animate-pulse" />
							</div>
						</div>

						<div className="flex-1 flex flex-col justify-end z-10">
							<span className="text-primary text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
								<Eye className="w-3 h-3" /> Preview
							</span>
							<h4 className="text-2xl font-black leading-tight mb-3 tracking-tighter line-clamp-2">
								{title || "Untitled Invite"}
							</h4>
							
							<div className="space-y-2 font-medium">
								{date && (
									<div className="flex items-center gap-2 text-[13px] text-white/90">
										<CalendarIcon className="w-3.5 h-3.5 text-primary" />
										{format(date, "MMM do")}
									</div>
								)}
								<div className="flex items-center gap-2 text-[13px] text-white/90">
									<Clock className="w-3.5 h-3.5 text-primary" />
									{time}
								</div>
								{location && (
									<div className="flex items-center gap-2 text-[13px] text-white/90 italic truncate">
										<MapPin className="w-3.5 h-3.5 text-primary" />
										<span className="truncate">{location}</span>
									</div>
								)}
							</div>

							<div className="mt-4 pt-4 border-t border-white/10">
								<div className="px-2.5 py-0.5 w-fit rounded-full bg-primary/20 border border-primary/30 text-[9px] font-bold text-primary uppercase">
									{selectedCircleName}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right: Theme Selection */}
			<div className="w-32 flex flex-col gap-4">
				<Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
					Theme
				</Label>
				<div className="grid grid-cols-2 gap-3">
					{covers.map((c, i) => (
						<button
							key={i}
							onClick={() => onCoverImageChange(c)}
							className={cn(
								"w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95",
								coverImage === c ? "border-primary shadow-lg shadow-primary/20" : "border-white/10"
							)}
						>
							<img src={c} alt="Theme" className="w-full h-full object-cover" />
						</button>
					))}
					<div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center group/add cursor-pointer hover:border-primary/50 transition-colors">
						<Plus className="w-4 h-4 text-muted-foreground group-hover/add:text-primary transition-colors" />
					</div>
				</div>
				
				<div className="pt-2">
					<p className="text-[10px] text-muted-foreground italic leading-relaxed">
						Choose a cover image that sets the vibe.
					</p>
				</div>
			</div>
		</div>
	);
}
