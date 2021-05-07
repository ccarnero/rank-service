
export type Opportunity = {
  id: string,
  age: Array<number>;
  experience: Array<number>;
  educationLevel: Array<number>;
  languages: Record<string, number>;
  professions: Array<string>;
  skills: Array<string>;
  fieldsOfStudy: Array<string>
}