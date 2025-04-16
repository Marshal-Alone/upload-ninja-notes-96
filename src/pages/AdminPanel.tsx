import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Replace with a secure password in production
const ADMIN_PASSWORD = "secret-admin-123";

export default function AdminPanel() {
	const { password } = useParams<{ password: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const [users, setUsers] = useState<any[]>([]);
	const [notes, setNotes] = useState<any[]>([]);
	const [requests, setRequests] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		// Check if password is correct or if accessed via direct admin-panel route
		const isDirectAccess = location.pathname === "/admin-panel";
		if (!isDirectAccess && password !== ADMIN_PASSWORD) {
			navigate("/");
			return;
		}

		// Load data
		const fetchData = async () => {
			try {
				// In a real app, this would fetch from your database
				// For demo purposes, we're using mock data
				setUsers([
					{ id: 1, email: "user1@example.com", name: "User One", status: "active" },
					{ id: 2, email: "user2@example.com", name: "User Two", status: "active" },
					{ id: 3, email: "user3@example.com", name: "User Three", status: "restricted" },
				]);

				setNotes([
					{ id: 1, title: "Math Notes", userId: 1, url: "/uploads/math.pdf" },
					{ id: 2, title: "Physics Notes", userId: 2, url: "/uploads/physics.pdf" },
					{ id: 3, title: "Chemistry Notes", userId: 1, url: "/uploads/chemistry.pdf" },
				]);

				setRequests([
					{ id: 1, title: "Biology Notes", requestedBy: 3, status: "pending" },
					{ id: 2, title: "History Notes", requestedBy: 1, status: "fulfilled", noteId: 4 },
				]);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
			}
		};

		fetchData();
	}, [password, navigate, location.pathname]);

	const restrictUser = async (userId: number) => {
		// In a real app, this would update your database
		setUsers(
			users.map((user) =>
				user.id === userId
					? { ...user, status: user.status === "active" ? "restricted" : "active" }
					: user
			)
		);
	};

	const deleteNote = async (noteId: number) => {
		// In a real app, this would delete from your database and storage
		setNotes(notes.filter((note) => note.id !== noteId));
	};

	const markRequestAsFulfilled = async (requestId: number, noteId: number) => {
		// In a real app, this would update your database
		setRequests(
			requests.map((request) =>
				request.id === requestId ? { ...request, status: "fulfilled", noteId } : request
			)
		);
	};

	const filteredNotes = notes.filter((note) =>
		note.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const filteredRequests = requests.filter((request) =>
		request.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) return <div className="p-8">Loading...</div>;

	return (
		<div className="container p-8 mx-auto">
			<h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">Users</h2>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Email
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{users.map((user) => (
								<tr key={user.id}>
									<td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
									<td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
									<td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												user.status === "active"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{user.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<Button
											onClick={() => restrictUser(user.id)}
											variant={user.status === "active" ? "destructive" : "default"}
											size="sm"
										>
											{user.status === "active" ? "Restrict" : "Activate"}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="mb-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">Notes</h2>
					<Input
						type="text"
						placeholder="Search..."
						className="max-w-xs"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Title
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Uploaded By
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{filteredNotes.map((note) => {
								const user = users.find((u) => u.id === note.userId);
								return (
									<tr key={note.id}>
										<td className="px-6 py-4 whitespace-nowrap">{note.id}</td>
										<td className="px-6 py-4 whitespace-nowrap">{note.title}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{user ? user.name : "Unknown"} ({user?.email})
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Button
												onClick={() => deleteNote(note.id)}
												variant="destructive"
												size="sm"
											>
												Delete
											</Button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Note Requests</h2>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Title
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Requested By
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{filteredRequests.map((request) => {
								const user = users.find((u) => u.id === request.requestedBy);
								return (
									<tr key={request.id}>
										<td className="px-6 py-4 whitespace-nowrap">{request.id}</td>
										<td className="px-6 py-4 whitespace-nowrap">{request.title}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{user ? user.name : "Unknown"} ({user?.email})
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													request.status === "pending"
														? "bg-yellow-100 text-yellow-800"
														: "bg-green-100 text-green-800"
												}`}
											>
												{request.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{request.status === "pending" ? (
												<div className="flex space-x-2">
													<Button
														onClick={() => markRequestAsFulfilled(request.id, 3)}
														variant="default"
														size="sm"
													>
														Mark Fulfilled
													</Button>
												</div>
											) : (
												<span className="text-sm text-gray-500">
													Fulfilled with Note #{request.noteId}
												</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
