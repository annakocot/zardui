import { QUESTIONNAIRE_DEMO_DEFAULT } from '@generated/components/questionnaire/demo/default';
import { QUESTIONNAIRE_DEMO_MULTIPLE_SELECTION } from '@generated/components/questionnaire/demo/multiple-selection';
import { QUESTIONNAIRE_CLI_ADD } from '@generated/installation/cli/add-questionnaire';
import { QUESTIONNAIRE_MANUAL_CODE } from '@generated/installation/manual/questionnaire';
import { QUESTIONNAIRE_USAGE_CODE, QUESTIONNAIRE_USAGE_IMPORT } from '@generated/usage/questionnaire';

import { ZardDemoQuestionnaireDefaultComponent } from './default';
import { ZardDemoQuestionnaireMultipleSelectionComponent } from './multiple-selection';
import { QUESTIONNAIRE_API } from '../doc/api';

export const QUESTIONNAIRE = {
  componentName: 'questionnaire',
  componentType: 'questionnaire',
  description: 'A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.',
  api: QUESTIONNAIRE_API,
  installData: {
    cliAdd: QUESTIONNAIRE_CLI_ADD,
    manualCode: QUESTIONNAIRE_MANUAL_CODE,
  },
  usage: { importBlock: QUESTIONNAIRE_USAGE_IMPORT, codeBlock: QUESTIONNAIRE_USAGE_CODE },
  examples: [
    {
      name: 'default',
      component: ZardDemoQuestionnaireDefaultComponent,
      codeData: QUESTIONNAIRE_DEMO_DEFAULT,
    },
    {
      name: 'multiple-selection',
      description: 'Use `multiple` for an item that accepts more than one fixed answer.',
      component: ZardDemoQuestionnaireMultipleSelectionComponent,
      codeData: QUESTIONNAIRE_DEMO_MULTIPLE_SELECTION,
    },
  ],
};
