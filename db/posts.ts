import { db } from "../db";

export type Post = {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
};

export default {
  createPost(userID: number, content: string, title = ""): Post | null {
    return db
      .prepare<Post, any>(
        `insert into posts (user_id, content, title) values ($u, $content, $title) RETURNING *`,
        {
          $u: userID,
          $content: content,
          $title: title,
        }
      )
      .get();
  },
  getPosts(userID: number): Post[] {
    return db
      .prepare<Post, any>(
        `select * from posts where user_id = $u order by created_at desc`
      )
      .all({ $u: userID });
  },
  getPostByID(id: number): Post | null {
    return db
      .prepare<Post, any>(`select * from posts where id = $id`)
      .get({ $id: id });
  },
  deletePost(id: number) {
    db.prepare<Post, any>(`delete from posts where id = $id`).run({ $id: id });
  },
  updatePost(id: number, updates: { title: string; content: string }) {
    db.prepare<Post, any>(
      `update posts set title = $title, content = $content, updated_at = CURRENT_TIMESTAMP where id = $id`
    ).run({ $id: id, $title: updates.title, $content: updates.content });
  },
};
