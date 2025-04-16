"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MainNav() {
	return (
		<nav className="border-b bg-background">
			<div className="container flex h-16 items-center px-4 mx-auto">
				<div className="mr-4 flex">
					<Link
						href="/"
						className="flex items-center space-x-2"
					>
						<span className="text-xl font-bold">NoteNinja</span>
					</Link>
				</div>
				<div className="flex items-center space-x-4 lg:space-x-6 mx-6">
					<Link
						href="/"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Home
					</Link>
					<Link
						href="/request-notes"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Request Notes
					</Link>
				</div>
				<div className="ml-auto flex items-center space-x-4">
					<Link href="/upload">
						<Button>Upload Note</Button>
					</Link>
				</div>
			</div>
		</nav>
	);
}
