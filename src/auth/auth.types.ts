export type AuthMode = "login" | "register" | "reset";

export type SignUpInput = {
	email: string;
	password: string;
	username: string;
};

export type SignInInput = {
	identifier: string; // username OR email
	password: string;
};

export type ResetPasswordInput = {
	email: string;
	redirectTo?: string; // moneytime://update-password
};

export type UpdatePasswordInput = {
	password: string;
};
