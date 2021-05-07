
export type Candidate = {
  id: string;
  age: number;
  experience: number;
  educationLevel: number;
  languages: Record<string, number>;
  professions: Array<string>;
  skills: Array<string>;
  fieldsOfStudy: Array<string>
}
