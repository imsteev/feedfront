import { db } from "../db";

export type Post = {
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
};

export default {
  createPost(userID: number, content: string, title = "") {
    console.log({ userID, content });
    db.prepare<any, any>(
      `insert into posts (user_id, content, title) values ($u, $content, $title)`,
      {
        $u: userID,
        $content: content,
        $title: title,
      }
    ).run();
  },
  getPosts(userID: number): Post[] {
    return db
      .prepare<Post, any>(
        `select * from posts where user_id = $u order by updated_at desc`
      )
      .all({ $u: userID });
  },
};
