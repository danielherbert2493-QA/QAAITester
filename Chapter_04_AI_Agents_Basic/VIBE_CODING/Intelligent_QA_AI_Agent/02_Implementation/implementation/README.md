# PLOT QA Studio

## Requirements

- Node.js 20 or newer.
- The repository-level `cred.env`, with `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, and `GROQ_API_KEY`.
- A Groq model available to the configured key, or a running Ollama service at `http://127.0.0.1:11434`.
- The three supplied templates in `01_Plan/`: `00_Test_Plan_Template.md`, `01_Test_Strategy_Template.md`, and `02_Test_Case_Creation_Template.md`.

The backend searches parent folders for `cred.env`; credentials are never sent to or stored in the browser. Do not copy real credentials into this folder or commit them. Template availability is checked when the app loads. Each generation request loads only the template selected by the user.

## Run

From this folder:

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:4173>. Open **Settings** to select an available Groq/Ollama model. Connection tests are optional; selecting a model is enough to generate an artifact. Select exactly one action—**Test Plan**, **Test Strategy**, or **Test Case Creation**—enter a Jira issue key, and submit. Each submission loads the matching template and makes one AI generation request. Submit another request to generate a different artifact. The selected provider and model remain in memory only.

For a production build, run `npm run build` followed by `npm start`.

## Verification and limitations

Run `npm test` for mocked backend checks, including selected-template loading, artifact generation, oversized request handling, and Groq rate-limit handling. Jira retrieval and live LLM requests are exercised only when you use the connection-test buttons or submit a Jira issue; they are not called by the automated tests. Outputs are rendered as readable Markdown. Jira content is treated as source data, and template fields or sections unsupported by the Jira issue are omitted rather than filled with placeholders. To help avoid provider request-size limits, long Jira descriptions and acceptance criteria are excerpted before generation; the app displays a warning when this happens. A provider 413 error includes guidance to reduce the issue content or select a model with a larger context window. Generation is not automatically retried. If Groq rate-limits a run, wait for the provider's reset window before submitting again, or use a local Ollama model if available.

