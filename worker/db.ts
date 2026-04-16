export type ChangeLog = {
  seq: number;
  user_id: string;
  cyphertext: string;
};

export type UserKey = {
  user_id: string;
  wrappedKey: string;
  salt: string;
  iv: string;
};
