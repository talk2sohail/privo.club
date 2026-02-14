"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LocationSuggestion {
	name: string;
	city?: string;
	country?: string;
	osm_id: number;
}

interface StepScheduleProps {
	step: number;
	date: Date | undefined;
	onDateChange: (date: Date | undefined) => void;
	time: string;
	onTimeChange: (time: string) => void;
	location: string;
	onLocationChange: (val: string) => void;
	suggestions: LocationSuggestion[];
	showSuggestions: boolean;
	onSelectSuggestion: (s: LocationSuggestion) => void;
	onFocusLocation: () => void;
}

export function StepSchedule({
	step,
	date,
	onDateChange,
	time,
	onTimeChange,
	location,
	onLocationChange,
	suggestions,
	showSuggestions,
	onSelectSuggestion,
	onFocusLocation,
}: StepScheduleProps) {
	return (
		<div className={cn(
			"absolute inset-0 px-6 space-y-4 transition-all duration-500 ease-out flex flex-col justify-start pt-6 pb-6",
			step === 2 ? "opacity-100 translate-x-0" : (step < 2 ? "opacity-0 translate-x-full" : "opacity-0 -translate-x-full") + " pointer-events-none"
		)}>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={cn(
									"w-full h-12 justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10 transition-all rounded-xl",
									!date && "text-muted-foreground",
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date ? format(date, "MMM do, yyyy") : <span>Pick a date</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0 glass border-white/20 backdrop-blur-3xl" align="start">
							<Calendar
								mode="single"
								selected={date}
								onSelect={onDateChange}
								initialFocus
								className="bg-transparent"
								disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div className="space-y-1.5">
					<Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time</Label>
					<div className="relative">
						<Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
						<Input
							type="time"
							value={time}
							onChange={(e) => onTimeChange(e.target.value)}
							className="h-12 pl-10 border-white/10 bg-white/5 focus-visible:ring-primary rounded-xl"
						/>
					</div>
				</div>
			</div>

			<div className="space-y-1.5 relative">
				<Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
					Location / Meeting Point
				</Label>
				<div className="relative">
					<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
					<Input
						id="location"
						value={location}
						onChange={(e) => onLocationChange(e.target.value)}
						onFocus={onFocusLocation}
						placeholder="e.g., Central Park, NYC"
						className="h-12 pl-10 border-white/10 bg-white/5 focus-visible:ring-primary rounded-xl"
					/>
				</div>
				
				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute top-full left-0 right-0 mt-2 z-50 glass border-white/20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
						{suggestions.map((s, i) => (
							<button
								key={`${s.osm_id}-${i}`}
								className="w-full h-12 px-4 text-left hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
								onClick={() => onSelectSuggestion(s)}
							>
								<MapPin className="w-4 h-4 text-primary shrink-0" />
								<div className="truncate">
									<span className="font-semibold text-sm block truncate">{s.name}</span>
									{s.city && <span className="text-[11px] text-muted-foreground">{s.city}, {s.country}</span>}
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
