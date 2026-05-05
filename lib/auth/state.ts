export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

export type ResetRequestState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export type UpdatePasswordState =
  | { status: "idle" }
  | { status: "error"; message: string };

export const initialLoginState: LoginState = { status: "idle" };
export const initialResetRequestState: ResetRequestState = { status: "idle" };
export const initialUpdatePasswordState: UpdatePasswordState = {
  status: "idle",
};
