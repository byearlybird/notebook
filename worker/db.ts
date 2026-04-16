export type ChangeLog = {
  seq: number;
  user_id: string;
  cyphertext: string;
};

export type UserKey = {
  user_id: string;
  wrapped_key: string;
  salt: string;
  iv: string;
};
