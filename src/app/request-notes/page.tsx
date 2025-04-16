import { NoteRequestForm } from "@/components/NoteRequestForm";

export default function RequestNotesPage() {
	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold text-center mb-8">Request Study Notes</h1>
			<div className="max-w-2xl mx-auto">
				<p className="text-center mb-6 text-gray-600 dark:text-gray-400">
					Can't find the notes you need? Request them here and we'll try to source them for you. If
					we already have them in our database, you'll get immediate access.
				</p>
				<NoteRequestForm />
			</div>
		</div>
	);
}
