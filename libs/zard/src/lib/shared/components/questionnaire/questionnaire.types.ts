export type ZardQuestionnaireAnswer = string | string[];
export type ZardQuestionnaireAnswers = Record<string, ZardQuestionnaireAnswer>;
export type ZardQuestionnaireShortcutMode = 'none' | 'letters' | 'numbers';

export interface ZardQuestionnaireItem {
  name: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}
