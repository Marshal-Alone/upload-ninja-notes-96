
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Trash2 } from "lucide-react";
import { NoteWithDetails } from "@/types";
import { RatingStars } from "./RatingStars";
import { deleteNote } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NoteCardProps {
  note: NoteWithDetails;
  onDelete?: () => void;
  showRatingInteraction?: boolean;
}

export const NoteCard = ({ note, onDelete, showRatingInteraction = false }: NoteCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Since uploader_id is now nullable, we need to check if it exists
  const isOwner = false; // Removing owner concept for anonymous uploads
  const fileUrl = note.file_url;
  
  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = note.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error downloading file",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!isOwner) return;
    
    try {
      setIsDeleting(true);
      await deleteNote(note);
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully",
      });
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error deleting note",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Format uploaded date
  let uploadedDate;
  try {
    uploadedDate = formatDistanceToNow(new Date(note.created_at), { addSuffix: true });
  } catch (error) {
    uploadedDate = "Unknown date";
  }
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold line-clamp-1">{note.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {note.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{note.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="truncate max-w-[150px]">{note.file_name}</span>
          </div>
          <div>
            {note.file_size}
          </div>
          <div>
            {uploadedDate}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {showRatingInteraction && (
          <RatingStars 
            noteId={note.id}
            averageRating={note.average_rating}
            ratingsCount={note.ratings_count}
            interactive={showRatingInteraction}
          />
        )}
        <Button 
          onClick={handleDownload} 
          variant="default" 
          size="sm"
          className="gap-1 ml-auto"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};
