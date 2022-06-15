import { DatabasePool, sql } from 'slonik';
import { User } from '../../common/types';
import { patch } from './utils';

export interface DatabaseUser {
  email: string;
  username: string;
  password: string;
}

export interface DatabasePost {
  id: string;
  userId: string;
  title: string;
  text: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  comment_count: string;
}

export interface CreateDatabasePostDto {
  userId: string;
  title: string;
  text: string | null;
  url: string | null;
}

export interface UpdateDatabasePostDto {
  title?: string | null;
  text?: string | null;
  url?: string | null;
}

export interface DatabaseComment {
  id: string;
  postId: string;
  userId: string;
  comment: string;
  created_at: string;
  updated_at: string;
  username: string;
}

export interface AddCommentDto {
  userId: string;
  postId: string;
  comment: string;
}

export class DatabaseService {
  pool: DatabasePool;

  constructor(pool: DatabasePool) {
    this.pool = pool;
  }

  async userExists(email: string, username: string): Promise<Boolean> {
    return this.pool.connect((connection) => {
      return connection.exists(
        sql`SELECT * 
            FROM users 
            WHERE username = ${username} OR email = ${email}`
      );
    });
  }

  async writeUser(user: DatabaseUser): Promise<void> {
    const { email, username, password } = user;

    await this.pool.connect(async (connection) => {
      return connection.query<DatabaseUser>(
        sql`INSERT INTO users (email, username, password_hash) 
            VALUES (${email}, ${username}, ${password}) 
            RETURNING email, username`
      );
    });
  }

  async updateUser(userId: string, user: DatabaseUser): Promise<DatabaseUser> {
    const { email, username, password } = user;

    const queryResult = await this.pool.connect(async (connection) => {
      return connection.one<DatabaseUser>(
        sql`UPDATE users
            SET email = ${email}, username = ${username}, password_hash = ${password}, updated_at = now() 
            WHERE id = ${userId}
            RETURNING email, username, password_hash;`
      );
    });
    return queryResult;
  }

  async validUser(username: string, password: string): Promise<Boolean> {
    return this.pool.connect((connection) => {
      return connection.exists(
        sql`SELECT * 
            FROM users 
            WHERE username = ${username} AND password_hash = ${password}`
      );
    });
  }

  async getUser(username: string): Promise<DatabaseUser | null> {
    return this.pool.connect((connection) => {
      return connection.maybeOne<DatabaseUser>(
        sql`SELECT * 
            FROM users 
            WHERE username = ${username}`
      );
    });
  }

  async getPartialUser(username: string): Promise<User | null> {
    return this.pool.connect((connection) => {
      return connection.maybeOne<User>(
        sql`SELECT id, username 
            FROM users 
            WHERE username = ${username}`
      );
    });
  }

  async createPost(userPost: CreateDatabasePostDto): Promise<void> {
    const { userId, title, text, url } = userPost;

    await this.pool.connect(async (connection) => {
      return connection.query<DatabasePost>(
        sql`INSERT INTO posts (user_id, title, text, url) 
            VALUES (${userId}, ${title}, ${text}, ${url})`
      );
    });
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await this.pool.connect((connection) => {
      return connection.one(
        sql`DELETE FROM posts 
            WHERE id = ${postId} AND user_id = ${userId}`
      );
    });
  }

  async editPost(postId: string, userPost: UpdateDatabasePostDto): Promise<DatabasePost> {
    const { title, text, url } = userPost;

    const queryResult = await this.pool.connect(async (connection) => {
      const updateFragment = patch({
        title,
        text,
        url,
      });

      return connection.one<DatabasePost>(
        sql`UPDATE posts SET ${updateFragment}
            WHERE "id" = ${postId} 
            RETURNING *`
      );
    });
    return queryResult;
  }

  async getPost(postId: string): Promise<DatabasePost> {
    return this.pool.connect(async (connection) => {
      return connection.one<DatabasePost>(
        sql`SELECT posts.id, posts.title, posts.text, posts.url, posts.created_at, posts.updated_at, users.username, (SELECT count(*) AS comment_count FROM comments WHERE comments.post_id = ${postId})
            FROM posts
            INNER JOIN users
            ON posts.user_id = users.id
            WHERE posts.id = ${postId}`
      );
    });
  }

  // async getPosts(): Promise<readonly DatabasePost[]> {
  //   return this.pool.connect(async (connection) => {
  //     const { rows } = await connection.query<DatabasePost>(
  //       sql`SELECT posts.id, posts.title, posts.text, posts.url, posts.created_at, posts.updated_at, users.username
  //           FROM posts
  //           INNER JOIN users ON posts.user_id = users.id`
  //     );

  //     return rows;
  //   });
  // }

  async getPosts(): Promise<readonly DatabasePost[]> {
    return this.pool.connect(async (connection) => {
      const { rows } = await connection.query<DatabasePost>(
        sql`SELECT posts.id, posts.title, posts.text, posts.url, posts.created_at, posts.updated_at, users.username, 
            (SELECT count(*) AS comment_count FROM comments WHERE comments.post_id = posts.id)
            FROM posts
            INNER JOIN users ON posts.user_id = users.id`
      );

      return rows;
    });
  }

  async addComment(postComment: AddCommentDto): Promise<void> {
    const { userId, postId, comment } = postComment;

    await this.pool.connect(async (connection) => {
      return connection.query<DatabaseComment>(
        sql`INSERT INTO comments (user_id, post_id, comment)
            VALUES (${userId}, ${postId}, ${comment})`
      );
    });
  }

  async getComments(postId: string): Promise<readonly DatabaseComment[]> {
    return this.pool.connect(async (connection) => {
      const { rows } = await connection.query<DatabaseComment>(
        sql`SELECT comments.id, comments.comment, comments.created_at, comments.updated_at, users.username
            FROM comments
            INNER JOIN posts ON comments.post_id = posts.id
            INNER JOIN users ON comments.user_id = users.id
            WHERE posts.id = ${postId}`
      );
      return rows;
    });
  }
}
