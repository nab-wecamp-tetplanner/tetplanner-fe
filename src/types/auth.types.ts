export interface User {
  id: string;
  email: string;
  name: string;
  is_verified: boolean;
  image_url?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserPermissions {
  userId: string;
  accessToken: string;
}