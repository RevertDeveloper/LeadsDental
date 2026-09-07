export type NoteFieldErrors = Record<string, string[]>;

export type NoteFormState = {
  message?: string;
  fieldErrors?: NoteFieldErrors;
};
