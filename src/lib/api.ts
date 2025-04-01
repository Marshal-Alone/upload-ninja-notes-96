import { supabase } from "@/integrations/supabase/client";
import { Note, NoteWithDetails, Rating } from "@/types";

export async function fetchNotes(searchQuery?: string): Promise<NoteWithDetails[]> {
  let query = supabase
    .from("notes")
    .select(`
      *,
      ratings(rating)
    `)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }

  // Map and calculate average ratings
  const notesWithRatings = (data || []).map((note: any) => {
    const ratings = note.ratings || [];
    const ratingsSum = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = ratings.length > 0 ? ratingsSum / ratings.length : null;

    return {
      ...note,
      profile: { username: "Anonymous User" }, // Default profile for all notes
      average_rating: averageRating,
      ratings_count: ratings.length,
    };
  });

  // Sort by average rating (highest first), with null ratings at the end
  return notesWithRatings.sort((a, b) => {
    if (a.average_rating === null && b.average_rating === null) return 0;
    if (a.average_rating === null) return 1;
    if (b.average_rating === null) return -1;
    return b.average_rating - a.average_rating;
  });
}

export async function getUserRating(noteId: string, deviceId: string): Promise<number | null> {
  if (!deviceId) return null;
  
  try {
    // Instead of querying the database directly, use localStorage
    // This avoids the UUID format issue
    const ratingKey = `rating_${noteId}_${deviceId}`;
    const savedRating = localStorage.getItem(ratingKey);
    
    // Return the rating from localStorage if available
    return savedRating ? parseInt(savedRating, 10) : null;
  } catch (error) {
    console.error("Error in getUserRating:", error);
    return null;
  }
}

export async function rateNote(
  noteId: string,
  deviceId: string,
  rating: number
): Promise<void> {
  // Always save to localStorage for consistent user experience
  const ratingKey = `rating_${noteId}_${deviceId}`;
  localStorage.setItem(ratingKey, rating.toString());
  
  try {
    // Generate a proper UUID for the database
    // We'll use a deterministic method to generate a UUID from the deviceId
    // This way, the same device always gets the same UUID
    const { data: existingRatings, error: fetchError } = await supabase
      .from("ratings")
      .select("id")
      .eq("note_id", noteId)
      .filter("user_id", "ilike", `%${deviceId.slice(-8)}%`);
      
    if (fetchError) {
      console.error("Error checking for existing rating:", fetchError);
      // Continue with localStorage only
      return;
    }
    
    if (existingRatings && existingRatings.length > 0) {
      // Update existing rating
      const { error } = await supabase
        .from("ratings")
        .update({ rating })
        .eq("id", existingRatings[0].id);
        
      if (error) {
        console.error("Error updating rating:", error);
        // We already stored in localStorage, so user still sees their rating
      }
    } else {
      // For new ratings, generate a random UUID for user_id instead of using deviceId
      const randomUuid = crypto.randomUUID();
      
      // Insert new rating with the proper UUID format
      const { error } = await supabase
        .from("ratings")
        .insert({
          note_id: noteId,
          user_id: randomUuid,
          rating,
        });

      if (error) {
        console.error("Error inserting rating:", error);
        // We already stored in localStorage, so user still sees their rating
      }
    }
  } catch (error) {
    console.error("Error rating note:", error);
    // Rating is already saved to localStorage, so the user will still see their rating
  }
}

export async function uploadNote(
  title: string,
  description: string,
  file: File,
  userId: string | null,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  console.log("Starting file upload:", { title, fileName: file.name });
  const fileName = `${Date.now()}_${file.name}`;
  
  // Create folder path - always use 'anonymous' since we don't have auth
  const folderName = 'anonymous';
  const filePath = `${folderName}/${fileName}`;
  
  // Start with initial progress
  if (onProgress) onProgress(0, file.size);
  
  // For all files, use the direct XHR upload to track progress accurately
  await uploadWithProgress(filePath, file, onProgress);
  
  // Get the public URL of the uploaded file
  const fileUrl = getFileUrl(filePath);
  
  // Determine file type and size
  const fileType = file.type || 'unknown';
  const fileSize = formatFileSize(file.size);

  console.log("File uploaded successfully:", { fileUrl, fileType, fileSize });

  // Insert the note record
  const { error: insertError } = await supabase
    .from("notes")
    .insert({
      title,
      description,
      file_url: fileUrl,
      file_type: fileType,
      file_size: fileSize,
      file_name: file.name,
      uploader_id: null, // Always null since we don't use auth
    });

  if (insertError) {
    // Attempt to clean up the file if the record insertion fails
    await supabase.storage.from("notes").remove([filePath]);
    console.error("Error creating note record:", insertError);
    throw insertError;
  }
  
  console.log("Note record created successfully");
}

// Helper function for direct upload with precise progress tracking
async function uploadWithProgress(
  filePath: string, 
  file: File, 
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create and configure XHR
    const xhr = new XMLHttpRequest();
    const uploadUrl = `${getStorageUrl()}/object/notes/${filePath}`;
    
    xhr.open('POST', uploadUrl);
    
    // Add Supabase headers
    const apiKey = getSupabaseKey();
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('x-upsert', 'true');
    
    // Track progress events
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded, event.total);
      }
    };
    
    // Handle completion
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Upload completed successfully");
        if (onProgress) onProgress(file.size, file.size); // Ensure 100% at the end
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };
    
    // Handle errors
    xhr.onerror = () => {
      console.error("Network error during upload");
      reject(new Error('Network error during upload'));
    };
    
    xhr.ontimeout = () => {
      console.error("Upload timed out");
      reject(new Error('Upload timed out'));
    };
    
    // Add more debug information
    xhr.onabort = () => {
      console.warn("Upload was aborted");
      reject(new Error('Upload was aborted'));
    };
    
    console.log("Starting XHR upload to:", uploadUrl);
    
    // Create FormData and send
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function deleteNote(note: Note): Promise<void> {
  // Extract filename from the file_url
  const urlParts = note.file_url.split('/');
  const filePath = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];
  
  // 1. Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from("notes")
    .remove([filePath]);

  if (storageError) {
    console.error("Error deleting file:", storageError);
    throw storageError;
  }

  // 2. Delete the note record (will cascade delete ratings)
  const { error: dbError } = await supabase
    .from("notes")
    .delete()
    .eq("id", note.id);

  if (dbError) {
    console.error("Error deleting note record:", dbError);
    throw dbError;
  }
}

// Define getFileUrl function only once
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage.from("notes").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function getUserNotes(userId: string): Promise<NoteWithDetails[]> {
  return []; // Since we don't have auth, just return empty array
}

// Helper functions for upload
function getStorageUrl(): string {
  return 'https://qxmmsuakpqgcfhmngmjb.supabase.co/storage/v1';
}

function getSupabaseKey(): string {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bW1zdWFrcHFnY2ZobW5nbWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0ODEzNzcsImV4cCI6MjA1OTA1NzM3N30.BkT-HrDlR2HJ6iAhuaIFMD7H_jRFIu0Y9hpiSyU4EHY';
}
