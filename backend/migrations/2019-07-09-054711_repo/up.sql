CREATE TABLE repo (
	id VARCHAR(255) PRIMARY KEY,
	owner VARCHAR(255) NOT NULL REFERENCES account(id),
	name VARCHAR(255) NOT NULL,
	private BOOL NOT NULL,
	fork BOOL NOT NULL,
	UNIQUE (owner, name)
);