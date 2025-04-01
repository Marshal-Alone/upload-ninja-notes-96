
export interface Note {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  uploader_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Rating {
  id: string;
  note_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface NoteWithDetails extends Note {
  profile: Profile;
  average_rating: number | null;
  ratings_count: number;
  user_rating?: number;
}
