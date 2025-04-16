import React from "react";

export default function TestPage() {
	return (
		<div
			style={{
				padding: "50px",
				textAlign: "center",
				fontSize: "24px",
				backgroundColor: "#f0f0f0",
				margin: "20px",
				borderRadius: "8px",
			}}
		>
			<h1>Test Page</h1>
			<p>If you can see this, routing is working!</p>
			<p>Try these links:</p>
			<ul style={{ listStyle: "none", padding: 0 }}>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="/admin-panel">Admin Panel</a>
				</li>
				<li>
					<a href="/request-notes">Request Notes</a>
				</li>
			</ul>
		</div>
	);
}
