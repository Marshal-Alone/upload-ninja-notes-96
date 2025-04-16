"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, CheckCircle2, XCircle } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { formatFileSize } from "@/lib/uploadthing";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function LargeFileUploader() {
	const [file, setFile] = useState<File | null>(null);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
	const [progress, setProgress] = useState(0);
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { startUpload, isUploading } = useUploadThing("largeFileUploader", {
		onUploadProgress: (progress) => {
			setProgress(progress);
		},
		onClientUploadComplete: (results) => {
			if (results && results.length > 0) {
				setUploadedUrl(results[0].url);
				setUploadStatus("success");
			}
		},
		onUploadError: (err) => {
			console.error("Upload error:", err);
			setError(err.message || "Upload failed. Please try again.");
			setUploadStatus("error");
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setUploadStatus("idle");
			setError(null);
		}
	};

	const handleUpload = async () => {
		if (!file) return;
		setUploadStatus("uploading");
		setProgress(0);

		try {
			await startUpload([file]);
		} catch (err) {
			console.error("Upload failed:", err);
			setError(typeof err === "string" ? err : "Upload failed. Please try again.");
			setUploadStatus("error");
		}
	};

	return (
		<div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
			<div className="flex flex-col items-center space-y-4">
				<h2 className="text-xl font-semibold">Upload Large File</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400">Upload files up to 4GB in size</p>

				<div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center">
					<UploadCloud className="h-12 w-12 text-gray-400" />
					<input
						type="file"
						id="file-upload"
						className="hidden"
						onChange={handleFileChange}
						disabled={uploadStatus === "uploading"}
					/>
					<label
						htmlFor="file-upload"
						className="mt-2 cursor-pointer text-blue-600 hover:text-blue-800"
					>
						Choose file
					</label>
					{file && (
						<div className="mt-2 text-sm text-gray-500">
							{file.name} ({formatFileSize(file.size)})
						</div>
					)}
				</div>

				{uploadStatus === "uploading" && (
					<div className="w-full space-y-2">
						<Progress
							value={progress}
							className="w-full"
						/>
						<p className="text-sm text-center">{Math.round(progress)}% uploaded</p>
					</div>
				)}

				{uploadStatus === "success" && (
					<div className="flex items-center text-green-600 space-x-2">
						<CheckCircle2 className="h-5 w-5" />
						<span>Upload successful!</span>
					</div>
				)}

				{uploadStatus === "error" && (
					<div className="flex items-center text-red-600 space-x-2">
						<XCircle className="h-5 w-5" />
						<span>{error || "Upload failed"}</span>
					</div>
				)}

				<Button
					onClick={handleUpload}
					disabled={!file || isUploading}
					className="w-full"
				>
					{isUploading ? "Uploading..." : "Upload File"}
				</Button>

				{uploadedUrl && (
					<div className="w-full">
						<p className="text-sm font-medium mb-1">File URL:</p>
						<div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm truncate">
							{uploadedUrl}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
