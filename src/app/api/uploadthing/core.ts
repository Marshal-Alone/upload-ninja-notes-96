import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define file size limits as strings
const MAX_FILE_SIZE = "4GB"; // 4GB
const IMAGE_SIZE = "64MB"; // Use a valid size value

// FileRouter for your app - can contain multiple file routes
export const ourFileRouter = {
	// Define as many file routes as you want
	largeFileUploader: f({
		pdf: { maxFileSize: MAX_FILE_SIZE },
		image: { maxFileSize: IMAGE_SIZE },
		text: { maxFileSize: MAX_FILE_SIZE },
		blob: { maxFileSize: MAX_FILE_SIZE },
		audio: { maxFileSize: MAX_FILE_SIZE },
		video: { maxFileSize: MAX_FILE_SIZE },
		"application/octet-stream": { maxFileSize: MAX_FILE_SIZE },
	})
		.middleware(() => {
			// Custom middleware runs on server to authenticate the upload
			return { userId: "anonymous" }; // We're using anonymous uploads
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Upload complete:");
			console.log("File URL:", file.url);

			// Return the file data to the client
			return {
				uploadedBy: metadata.userId,
				url: file.url,
			};
		}),
} satisfies FileRouter;

// Helper to extract upload router type
export type OurFileRouter = typeof ourFileRouter;
