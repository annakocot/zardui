import type { ApiSection } from '@doc/domain/components/api-reference/api-reference.types';

export const QUESTIONNAIRE_API: ApiSection[] = [
  {
    selector: 'z-questionnaire',
    description: 'A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.',
    props: [{ name: '[class]', description: 'Custom CSS classes', type: 'ClassValue', default: "''" }],
  },
];
