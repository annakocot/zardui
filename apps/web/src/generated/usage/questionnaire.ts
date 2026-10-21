import type { CodeBlockData } from '@highlight/types';

export const QUESTIONNAIRE_USAGE_IMPORT: CodeBlockData = {
  "html": "<pre class=\"shiki shiki-themes github-dark github-light\" style=\"--shiki-dark:#e1e4e8;--shiki-light:#24292e;--shiki-dark-bg:#24292e;--shiki-light-bg:#fff\" tabindex=\"0\"><code><span class=\"line\"><span style=\"--shiki-dark:#F97583;--shiki-light:#D73A49\">import</span><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\"> { ZardQuestionnaireImports } </span><span style=\"--shiki-dark:#F97583;--shiki-light:#D73A49\">from</span><span style=\"--shiki-dark:#9ECBFF;--shiki-light:#032F62\"> '@/shared/components/questionnaire/questionnaire.imports'</span><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\">;</span></span></code></pre>",
  "code": "import { ZardQuestionnaireImports } from '@/shared/components/questionnaire/questionnaire.imports';",
  "language": "angular-ts",
  "showLineNumbers": true,
  "copyButton": true,
  "expandable": false
};

export const QUESTIONNAIRE_USAGE_CODE: CodeBlockData = {
  "html": "<pre class=\"shiki shiki-themes github-dark github-light\" style=\"--shiki-dark:#e1e4e8;--shiki-light:#24292e;--shiki-dark-bg:#24292e;--shiki-light-bg:#fff\" tabindex=\"0\"><code><span class=\"line\"><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\">&#x3C;</span><span style=\"--shiki-dark:#85E89D;--shiki-light:#22863A\">z-questionnaire</span><span style=\"--shiki-dark:#B392F0;--shiki-light:#6F42C1\"> [zItems]</span><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\">=</span><span style=\"--shiki-dark:#9ECBFF;--shiki-light:#032F62\">\"items\"</span><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\">></span></span>\n<span class=\"line\"><span style=\"--shiki-dark:#6A737D;--shiki-light:#6A737D\">  &#x3C;!-- questionnaire items --></span></span>\n<span class=\"line\"><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\">&#x3C;/</span><span style=\"--shiki-dark:#85E89D;--shiki-light:#22863A\">z-questionnaire</span><span style=\"--shiki-dark:#E1E4E8;--shiki-light:#24292E\">></span></span></code></pre>",
  "code": "<z-questionnaire [zItems]=\"items\">\n  <!-- questionnaire items -->\n</z-questionnaire>",
  "language": "angular-html",
  "showLineNumbers": true,
  "copyButton": true,
  "expandable": false
};
