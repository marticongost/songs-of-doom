export interface UserProps {
	id: string;
	username: string;
	createdAt: Date;
}

export class User {
	readonly id: string;
	readonly username: string;
	readonly createdAt: Date;

	constructor({ id, username, createdAt }: UserProps) {
		this.id = id;
		this.username = username;
		this.createdAt = createdAt;
	}
}
