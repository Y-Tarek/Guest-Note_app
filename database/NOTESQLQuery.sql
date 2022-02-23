CREATE TABLE users (
 id int primary key NOT NULL IDENTITY,
 username varchar(50),
 profilepicture  varchar(255),
 notification_activiated BIT DEFAULT 0
);


CREATE TABLE notetypes(
id int primary key NOT NULL IDENTITY,
typename varchar(255),
disabled_type  BIT
);


CREATE TABLE notes(
id int primary key NOT NULL IDENTITY,
title varchar(255),
body varchar(255),
files varchar(255),
isDeleted BIT NOT NULL default 0,
CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
note_type int,
note_owner int NOT NULL,
note_recipent int NOT NULL

FOREIGN KEY (note_type) REFERENCES notetypes(id),
FOREIGN KEY (note_owner) REFERENCES users(id),
FOREIGN KEY (note_recipent) REFERENCES users(id)
);

INSERT INTO  notetypes VALUES ('invitation', 0), ('congrats', 0);