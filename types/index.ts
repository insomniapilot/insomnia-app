import type { User as NextAuthUser } from "next-auth"

export interface User extends NextAuthUser {
  id: string
  username: string
  bio?: string
  avatar_url?: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  created_at: string
  updated_at: string
  user?: User
  likes_count?: number
  comments_count?: number
  has_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: User
  receiver?: User
}
