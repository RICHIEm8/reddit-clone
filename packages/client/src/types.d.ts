export interface Post {
  id: string;
  user_id: string;
  title: string;
  text: string | null;
  url: string | null;
  created_at: string;
  username: string;
  comment_count: string;
  upvotes: string;
  downvotes: string;
  vote_status: boolean | null;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  comment: string;
  created_at: string;
  username: string;
  upvotes: string;
  downvotes: string;
  vote_status: boolean | null;
}

export interface JwtToken {
  exp: number;
  id: string;
  username: string;
  email: string;
}
