"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { createInvite } from "@/app/actions/invites";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { StepDetails } from "./invite-wizard/step-details";
import { StepSchedule } from "./invite-wizard/step-schedule";
import { StepPreview } from "./invite-wizard/step-preview";
import { WizardProgress } from "./invite-wizard/wizard-progress";
import { WizardFooter } from "./invite-wizard/wizard-footer";

interface CreateInviteDialogProps {
	circles: { id: string; name: string }[];
	defaultCircleId?: string;
	children?: React.ReactNode;
}

type Step = 1 | 2 | 3;

interface LocationSuggestion {
	name: string;
	city?: string;
	country?: string;
	osm_id: number;
}

export function CreateInviteDialog({
	circles,
	defaultCircleId,
	children,
}: CreateInviteDialogProps) {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<Step>(1);
	const [loading, setLoading] = useState(false);
	const [date, setDate] = useState<Date>();
	const [time, setTime] = useState("19:00");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [selectedCircleId, setSelectedCircleId] = useState<string>(
		defaultCircleId ?? "",
	);
	
	const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const router = useRouter();

	const nextStep = () => {
		if (step === 1 && !title) {
			toast.error("Please enter a title");
			return;
		}
		if (step === 2 && !date) {
			toast.error("Please select a date");
			return;
		}
		setStep((s: number) => (s + 1) as Step);
	};
	const prevStep = () => setStep((s: number) => (s - 1) as Step);

	// Location Autocomplete Logic
	useEffect(() => {
		const fetchSuggestions = async () => {
			if (location.length < 3) {
				setSuggestions([]);
				return;
			}
			try {
				const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=5`);
				const data = await res.json();
				const formatted = data.features.map((f: any) => ({
					name: f.properties.name || f.properties.street,
					city: f.properties.city || f.properties.state,
					country: f.properties.country,
					osm_id: f.properties.osm_id
				}));
				setSuggestions(formatted);
				setShowSuggestions(true);
			} catch (err) {
				console.error("Photon API error:", err);
			}
		};

		const timer = setTimeout(fetchSuggestions, 300);
		return () => clearTimeout(timer);
	}, [location]);

	async function handleSubmit() {
		if (!date) {
			toast.error("Please select an event date");
			return;
		}

		setLoading(true);
		
		const [hours, minutes] = time.split(":").map(Number);
		const finalDate = new Date(date);
		finalDate.setHours(hours, minutes);

		const formData = new FormData();
		formData.append("title", title);
		formData.append("description", description);
		formData.append("location", location);
		formData.append("eventDate", finalDate.toISOString());
		formData.append("circleId", selectedCircleId);

		try {
			await createInvite(formData);
			toast.success("Invite created successfully!");
			setOpen(false);
			setStep(1);
			resetForm();
			router.refresh();
		} catch {
			toast.error("Failed to create invite. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setLocation("");
		setDate(undefined);
		setTime("19:00");
		setSelectedCircleId(defaultCircleId ?? "");
	};

	const selectedCircleName = circles.find(c => c.id === selectedCircleId)?.name || "Select Circle";

	const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80");

	const covers = [
		"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
		"https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
		"https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800&q=80",
		"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
		"https://images.unsplash.com/photo-1514525253361-b83f859b73c0?w=800&q=80",
	];

	return (
		<Dialog open={open} onOpenChange={(val) => {
			setOpen(val);
			if (!val) {
				setStep(1);
			}
		}}>
			<DialogTrigger asChild>
				{children ? (
					children
				) : (
					<Button
						size="lg"
						className="rounded-2xl px-6 h-14 text-lg font-semibold gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
					>
						<Plus className="w-5 h-5" />
						New Invite
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px] p-0 overflow-hidden glass border-white/20 text-foreground backdrop-blur-3xl">
				<div className="flex flex-col h-[540px]">
					<WizardProgress step={step} />

					<div className="flex-1 relative mt-2 overflow-hidden">
						<StepDetails
							step={step}
							title={title}
							onTitleChange={setTitle}
							description={description}
							onDescriptionChange={setDescription}
							circles={circles}
							selectedCircleId={selectedCircleId}
							onCircleChange={setSelectedCircleId}
							disabledCircleSelection={!!defaultCircleId}
						/>

						<StepSchedule
							step={step}
							date={date}
							onDateChange={setDate}
							time={time}
							onTimeChange={setTime}
							location={location}
							onLocationChange={setLocation}
							suggestions={suggestions}
							showSuggestions={showSuggestions}
							onSelectSuggestion={(s) => {
								setLocation(s.name + (s.city ? `, ${s.city}` : ""));
								setShowSuggestions(false);
							}}
							onFocusLocation={() => setShowSuggestions(true)}
						/>

						<StepPreview
							step={step}
							title={title}
							date={date}
							time={time}
							location={location}
							selectedCircleName={selectedCircleName}
							coverImage={coverImage}
							onCoverImageChange={setCoverImage}
							covers={covers}
						/>
					</div>

					<WizardFooter
						step={step}
						loading={loading}
						onBack={prevStep}
						onNext={nextStep}
						onSubmit={handleSubmit}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
