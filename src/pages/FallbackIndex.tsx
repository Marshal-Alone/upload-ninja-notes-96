import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Sample note data that doesn't require API calls
const sampleNotes = [
	{ id: 1, title: "Mathematics Notes", description: "Calculus and Linear Algebra", fileUrl: "#" },
	{
		id: 2,
		title: "Physics Study Guide",
		description: "Mechanics and Thermodynamics",
		fileUrl: "#",
	},
	{ id: 3, title: "Chemistry Formulas", description: "Organic Chemistry Reference", fileUrl: "#" },
];

export default function FallbackIndex() {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b">
				<div className="container py-4 flex justify-between items-center max-w-6xl">
					<Link
						to="/"
						className="flex items-center gap-2 text-2xl font-bold"
					>
						Notes Sharing
					</Link>

					<div className="flex gap-4">
						<Link to="/admin-panel">
							<Button variant="outline">Admin Panel</Button>
						</Link>
						<Link to="/upload">
							<Button>Upload Note</Button>
						</Link>
					</div>
				</div>
			</header>

			<main className="container py-8 max-w-6xl">
				<section className="mb-8">
					<h1 className="text-3xl font-bold mb-4">Find and Share Notes</h1>
					<p className="text-gray-500">
						This is a fallback page that works without API calls. Browse sample notes below or go to
						admin panel.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-bold mb-6">Sample Notes</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{sampleNotes.map((note) => (
							<div
								key={note.id}
								className="bg-white rounded-lg shadow p-6"
							>
								<h3 className="text-lg font-bold mb-2">{note.title}</h3>
								<p className="text-gray-500 mb-4">{note.description}</p>
								<div className="flex justify-end">
									<Button
										variant="outline"
										size="sm"
									>
										Download (Sample)
									</Button>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="mt-12 p-8 bg-blue-50 rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Request Notes</h2>
					<p className="mb-4">
						Can't find what you need? Request notes and we'll try to source them for you.
					</p>
					<Link to="/request-notes">
						<Button variant="default">Request Notes</Button>
					</Link>
				</section>
			</main>

			<footer className="bg-gray-100 border-t py-8">
				<div className="container max-w-6xl">
					<div className="text-center text-gray-500 text-sm">
						<p>© {new Date().getFullYear()} Notes Sharing App</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
