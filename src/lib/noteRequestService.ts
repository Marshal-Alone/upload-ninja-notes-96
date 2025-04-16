// Mock database for note requests in the absence of a real backend
let noteRequests: NoteRequest[] = [];
let availableNotes: AvailableNote[] = [
	{ id: 1, title: "Math Notes", url: "/uploads/math.pdf" },
	{ id: 2, title: "Physics Notes", url: "/uploads/physics.pdf" },
	{ id: 3, title: "Chemistry Notes", url: "/uploads/chemistry.pdf" },
];

interface NoteRequest {
	id: number;
	title: string;
	description?: string;
	requestedBy: string; // user id or email
	status: "pending" | "fulfilled";
	noteId?: number;
	createdAt: Date;
}

interface AvailableNote {
	id: number;
	title: string;
	url: string;
}

// Check if a note exists with a similar title
export const checkNoteExists = (title: string): { exists: boolean; note?: AvailableNote } => {
	// Normalize both strings for comparison: lowercase, remove spaces, etc.
	const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, "");

	const normalizedSearch = normalizeString(title);

	// First check for exact matches
	let exactMatch = availableNotes.find((note) => normalizeString(note.title) === normalizedSearch);

	if (exactMatch) {
		return { exists: true, note: exactMatch };
	}

	// Then check for partial matches (if title contains search term)
	let partialMatch = availableNotes.find(
		(note) =>
			normalizeString(note.title).includes(normalizedSearch) ||
			normalizedSearch.includes(normalizeString(note.title))
	);

	if (partialMatch) {
		return { exists: true, note: partialMatch };
	}

	return { exists: false };
};

// Submit a note request
export const submitNoteRequest = (
	request: Omit<NoteRequest, "id" | "status" | "createdAt">
): NoteRequest => {
	const newRequest: NoteRequest = {
		id: Date.now(), // Simple ID generation
		status: "pending",
		createdAt: new Date(),
		...request,
	};

	noteRequests.push(newRequest);
	return newRequest;
};

// Get all note requests (for admin panel)
export const getAllNoteRequests = (): NoteRequest[] => {
	return [...noteRequests];
};

// Mark a request as fulfilled
export const fulfillNoteRequest = (requestId: number, noteId: number): NoteRequest | null => {
	const requestIndex = noteRequests.findIndex((req) => req.id === requestId);
	if (requestIndex === -1) return null;

	noteRequests[requestIndex] = {
		...noteRequests[requestIndex],
		status: "fulfilled",
		noteId,
	};

	return noteRequests[requestIndex];
};

// Add a new available note and automatically check for matching requests
export const addAvailableNote = (
	note: Omit<AvailableNote, "id">
): { note: AvailableNote; matchedRequests: NoteRequest[] } => {
	// Create the new note
	const newNote: AvailableNote = {
		id: Date.now(),
		...note,
	};

	availableNotes.push(newNote);

	// Find and fulfill matching requests
	const matchedRequests: NoteRequest[] = [];

	noteRequests.forEach((request) => {
		if (request.status === "pending") {
			// Use the same matching logic from checkNoteExists
			const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, "");
			const requestTitle = normalizeString(request.title);
			const noteTitle = normalizeString(newNote.title);

			if (
				requestTitle === noteTitle ||
				requestTitle.includes(noteTitle) ||
				noteTitle.includes(requestTitle)
			) {
				// Mark as fulfilled
				fulfillNoteRequest(request.id, newNote.id);

				// Add to matched requests list
				matchedRequests.push({
					...request,
					status: "fulfilled",
					noteId: newNote.id,
				});
			}
		}
	});

	return { note: newNote, matchedRequests };
};

// Get note request notifications for a specific user
export const getNoteRequestNotifications = (userId: string): { fulfilled: NoteRequest[] } => {
	const fulfilledRequests = noteRequests.filter(
		(req) => req.requestedBy === userId && req.status === "fulfilled"
	);

	return { fulfilled: fulfilledRequests };
};

// For development/testing purposes
export const _resetMockData = () => {
	noteRequests = [];
	availableNotes = [
		{ id: 1, title: "Math Notes", url: "/uploads/math.pdf" },
		{ id: 2, title: "Physics Notes", url: "/uploads/physics.pdf" },
		{ id: 3, title: "Chemistry Notes", url: "/uploads/chemistry.pdf" },
	];
};
