import { db } from ".";

export type User = {
  id: number;
  username: string;
  password: string;
  created_at: string;

  session_expires_at: string;
  session_csrf: string;
};

export default {
  async createUser(
    username: string,
    plaintextPw: string
  ): Promise<User | null> {
    const hashed = await Bun.password.hash(plaintextPw);
    return db
      .prepare<User, any>(
        `INSERT INTO users (username, password) VALUES ($u, $p) RETURNING *`
      )
      .get({
        $u: username,
        $p: hashed,
      });
  },
};
