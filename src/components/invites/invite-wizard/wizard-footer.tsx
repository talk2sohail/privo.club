"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface WizardFooterProps {
	step: number;
	loading: boolean;
	onBack: () => void;
	onNext: () => void;
	onSubmit: () => void;
}

export function WizardFooter({
	step,
	loading,
	onBack,
	onNext,
	onSubmit,
}: WizardFooterProps) {
	return (
		<DialogFooter className="p-4 pt-0 flex gap-3 sm:justify-between items-center sm:gap-0">
			<div className="flex gap-2 w-full">
				{step > 1 && (
					<Button
						variant="outline"
						onClick={onBack}
						className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2 transition-all"
					>
						<ChevronLeft className="w-4 h-4" /> Back
					</Button>
				)}
				{step < 3 ? (
					<Button
						onClick={onNext}
						className="flex-[2] h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 gap-2 group transition-all"
					>
						Continue <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
					</Button>
				) : (
					<Button
						onClick={onSubmit}
						disabled={loading}
						className="flex-[2] h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 border-none hover:scale-[1.02] active:scale-[0.98] transition-all"
					>
						{loading ? "Creating..." : "Send Invite"}
					</Button>
				)}
			</div>
		</DialogFooter>
	);
}
