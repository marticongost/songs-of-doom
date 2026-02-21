export interface UserProps {
	username: string;
	createdAt: Date;
}

export class User {
	readonly username: string;
	readonly createdAt: Date;

	constructor({ username, createdAt }: UserProps) {
		this.username = username;
		this.createdAt = createdAt;
	}
}
