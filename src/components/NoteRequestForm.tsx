"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkNoteExists, submitNoteRequest } from "@/lib/noteRequestService";
import { useAuth } from "../context/auth-context"; // Fix the import path

export function NoteRequestForm() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [existingNote, setExistingNote] = useState<{ title: string; url: string } | null>(null);
	const [searchedNotes, setSearchedNotes] = useState<{ title: string; url: string }[]>([]);
	const [shakeAnimation, setShakeAnimation] = useState(false);
	const { user } = useAuth() || { user: { id: "guest" } };

	// Check all available notes when user types in search
	const searchNotes = async (searchTitle: string) => {
		// Simulate searching through the notes
		try {
			const { exists, note } = await checkNoteExists(searchTitle);
			if (exists && note) {
				return [note];
			}
			return [];
		} catch (error) {
			console.error("Error searching notes:", error);
			return [];
		}
	};

	// Debounce search to avoid too many requests
	useEffect(() => {
		const timer = setTimeout(() => {
			if (title.trim().length > 2) {
				searchNotes(title).then((notes) => {
					setSearchedNotes(notes || []);
					setShakeAnimation(true);
					setTimeout(() => setShakeAnimation(false), 500);
				});
			} else {
				setSearchedNotes([]);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [title]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			toast({
				title: "Error",
				description: "Please enter a note title",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);

		try {
			// Check if the note already exists
			const { exists, note } = await checkNoteExists(title);

			if (exists && note) {
				setExistingNote(note);
				toast({
					title: "Note Found!",
					description: "This note already exists in our system",
					variant: "default",
				});
			} else {
				// Submit the request to our service
				const request = await submitNoteRequest({
					title,
					description,
					requestedBy: user?.id || "guest",
				});

				toast({
					title: "Request Submitted",
					description: "We've received your note request. You'll be notified when it's available.",
					variant: "default",
				});

				// Reset form
				setTitle("");
				setDescription("");
				setExistingNote(null);
			}
		} catch (error) {
			console.error("Error submitting request:", error);
			toast({
				title: "Error",
				description: "Failed to submit your request. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Request Notes</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="title">Note Title</Label>
						<Input
							id="title"
							placeholder="Enter the title of the note you need"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							className={shakeAnimation ? "animate-shake" : ""}
						/>

						{/* Show search results */}
						{searchedNotes.length > 0 && !existingNote && (
							<div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
								<p className="text-sm font-medium mb-1">Similar notes found:</p>
								<ul className="space-y-1">
									{searchedNotes.map((note, index) => (
										<li
											key={index}
											className="text-sm flex justify-between items-center"
										>
											<span className="truncate">{note.title}</span>
											<Button
												variant="ghost"
												size="sm"
												className="h-6"
												onClick={() => {
													setExistingNote(note);
												}}
											>
												View
											</Button>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (Optional)</Label>
						<Textarea
							id="description"
							placeholder="Provide additional details about what you're looking for"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>

					{existingNote && (
						<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
							<p className="text-sm font-medium text-green-800 dark:text-green-300">
								Note already exists!
							</p>
							<p className="text-sm mt-1 text-green-700 dark:text-green-400">
								"{existingNote.title}" is available for download.
							</p>
							<Button
								variant="link"
								className="text-green-600 dark:text-green-400 p-0 h-auto mt-1"
								onClick={() => {
									const link = document.createElement("a");
									link.href = existingNote.url;
									link.target = "_blank";
									link.rel = "noopener noreferrer";
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
								}}
							>
								Download now
							</Button>
						</div>
					)}
				</form>
			</CardContent>
			<CardFooter>
				<Button
					type="submit"
					className="w-full"
					disabled={loading}
					onClick={handleSubmit}
				>
					{loading ? "Checking..." : existingNote ? "Request Different Note" : "Submit Request"}
				</Button>
			</CardFooter>
		</Card>
	);
}
