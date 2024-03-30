create table "post" (
  id serial primary key,
  title text,
  body text,
  author_id bigint,
  topic text
);

create table "user" (
  id serial primary key,
  name text
);

create table "like" (
  id serial primary key,
  post_id bigint
);