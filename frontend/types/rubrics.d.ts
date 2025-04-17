export type RubricsSettings = {
  id: string;
  rubric_name: string;
  rubric_prompt: string;
  revision_date: string;
};

export type RubricSettingsUpdate = {
  rubric_prompt: string;
}
