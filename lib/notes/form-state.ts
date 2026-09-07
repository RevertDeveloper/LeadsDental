export type NoteFieldErrors = Record<string, string[]>;

export type NoteFormState = {
  success?: boolean;
  revision?: number;
  message?: string;
  fieldErrors?: NoteFieldErrors;
};
