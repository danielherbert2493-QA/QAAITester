import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import './styles.css';

const ARTIFACTS = [
  { id: 'testPlan', title: 'Test Plan', file: '00_Test_Plan_Template.md', icon: '01', description: 'Scope, deliverables, environment and release criteria' },
  { id: 'testStrategy', title: 'Test Strategy', file: '01_Test_Strategy_Template.md', icon: '02', description: 'Risk priorities, test layers and quality gates' },
  { id: 'testCases', title: 'Test Case Creation', file: '02_Test_Case_Creation_Template.md', icon: '03', description: 'Traceable cases with steps and expected results' },
];

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}

function App() {
  const [page, setPage] = useState('suite');
  const [issueKey, setIssueKey] = useState('');
  const [selectedArtifactId, setSelectedArtifactId] = useState('');
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [testedSelection, setTestedSelection] = useState('');
  const [models, setModels] = useState([]);
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [artifacts, setArtifacts] = useState(null);
  const [sourceIssue, setSourceIssue] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    request('/api/settings')
      .then(setSettings)
      .catch((error) => setNotice({ kind: 'error', text: error.message }));
    request('/api/templates/status')
      .then((result) => {
        setTemplates(result.templates);
        const missing = result.templates.filter((template) => !template.available);
        if (missing.length) {
          setNotice({ kind: 'warning', text: `Template unavailable: ${missing.map((template) => template.file).join(', ')}` });
        }
      })
      .catch((error) => setNotice({ kind: 'error', text: error.message }));
  }, []);

  async function loadModels(selectedProvider) {
    setBusy('models');
    setNotice(null);
    setProvider(selectedProvider);
    setModel('');
    setTestedSelection('');
    setModels([]);
    try {
      const result = await request(`/api/llm/models?provider=${selectedProvider}`);
      setModels(result.models);
      setNotice(result.models.length
        ? { kind: 'success', text: 'Models loaded. Select one to test the connection.' }
        : { kind: 'error', text: 'No models are available for this provider.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  async function testJira() {
    setBusy('jira');
    setNotice(null);
    try {
      const result = await request('/api/jira/test', { method: 'POST', body: '{}' });
      setNotice({ kind: 'success', text: result.message });
    } catch (error) {
      setNotice({ kind: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  async function testModel() {
    setBusy('llm');
    setNotice(null);
    try {
      const result = await request('/api/llm/test', {
        method: 'POST',
        body: JSON.stringify({ provider, model }),
      });
      setTestedSelection(`${provider}:${model}`);
      setNotice({ kind: 'success', text: result.message });
    } catch (error) {
      setTestedSelection('');
      setNotice({ kind: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  async function buildArtifact(event) {
    event.preventDefault();
    const definition = ARTIFACTS.find((artifact) => artifact.id === selectedArtifactId);
    if (busy || !definition || !issueKey.trim() || !provider || !model || !templates) {
      setNotice({ kind: 'error', text: 'Select one QA action, enter a Jira issue key, and choose an AI model in Settings.' });
      return;
    }

    const template = templates.find((item) => item.id === definition.id);
    if (!template?.available) {
      setNotice({ kind: 'error', text: template?.error ?? `Template missing: ${definition.file}` });
      return;
    }

    setBusy('artifact');
    setNotice(null);
    setArtifacts({ [definition.id]: { status: 'generating' } });
    setSourceIssue(null);
    try {
      const result = await request('/api/artifact', {
        method: 'POST',
        body: JSON.stringify({ issueKey, artifactId: definition.id, provider, model }),
      });
      setSourceIssue(result.issue);
      setArtifacts({ [result.artifactId]: result.artifact });
      setNotice({
        kind: result.sourceNotice ? 'warning' : 'success',
        text: result.sourceNotice
          ? `${definition.title} is ready. ${result.sourceNotice}`
          : `${definition.title} is ready for review.`,
      });
    } catch (error) {
      setArtifacts({ [definition.id]: { status: 'error', error: error.message } });
      setNotice({ kind: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  const jiraReady = settings?.jira?.configured;
  const modelReady = Boolean(provider && model);
  const modelTested = modelReady && testedSelection === `${provider}:${model}`;
  const availableCount = templates?.filter((template) => template.available).length ?? 0;
  const selectedArtifact = ARTIFACTS.find((artifact) => artifact.id === selectedArtifactId);

  return (
    <div className="portal">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => setPage('suite')}>
          <span className="brand-mark">✦</span>
          <span className="brand-name">PLOT<span>QA STUDIO</span></span>
        </button>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>
          <button
            className={page === 'suite' ? 'side-link selected' : 'side-link'}
            type="button"
            onClick={() => setPage('suite')}
          >
            <span className="side-icon">⌘</span>
            <span>QA Artifact</span>
            <span className="side-chevron">›</span>
          </button>
          <button
            className={page === 'settings' ? 'side-link selected' : 'side-link'}
            type="button"
            onClick={() => setPage('settings')}
          >
            <span className="side-icon">⚙</span>
            <span>Settings</span>
          </button>
        </div>

        <div className="sidebar-spacer" />
        <div className="sidebar-status">
          <div className="status-heading"><span>CONNECTIONS</span><span className="status-pulse" /></div>
          <div className="status-line">
            <span className={jiraReady ? 'status-dot online' : 'status-dot'} />
            <span>Jira</span>
            <strong>{settings ? (jiraReady ? 'Ready' : 'Setup needed') : 'Checking'}</strong>
          </div>
          <div className="status-line">
            <span className={modelReady ? 'status-dot online' : 'status-dot'} />
            <span>AI model</span>
            <strong>{modelTested ? 'Tested' : modelReady ? 'Selected' : 'Not selected'}</strong>
          </div>
          <div className="status-line">
            <span className={availableCount === ARTIFACTS.length ? 'status-dot online' : 'status-dot'} />
            <span>Templates</span>
            <strong>{templates ? `${availableCount}/3 ready` : 'Checking'}</strong>
          </div>
        </div>
        <div className="sidebar-profile">
          <span className="profile-avatar">QA</span>
          <span><strong>QA workspace</strong><small>Local environment</small></span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><i>/</i><strong>{page === 'suite' ? 'QA Artifact' : 'Settings'}</strong></div>
          <div className="topbar-meta"><span className="local-badge"><i /> LOCAL</span><span className="topbar-avatar">Q</span></div>
        </header>

        <main className="page">
          {page === 'suite' ? (
            <>
              <section className="hero">
                <div>
                  <p className="eyebrow"><span className="eyebrow-line" /> ONE TICKET · ONE QA ARTIFACT</p>
                  <h1>Everything your QA<br />team needs to <span>start.</span></h1>
                  <p className="hero-copy">Choose one QA action and a Jira issue. We load its matching template and make one AI generation request.</p>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                  <div className="art-card"><span>QA</span><i>✓</i></div>
                  <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span>
                </div>
              </section>

              <section className="workflow" aria-label="Workflow">
                <WorkflowStep number="01" title="Enter Jira ticket" detail="Read requirements" active />
                <span className="workflow-connector" />
                <WorkflowStep number="02" title="Select action" detail="One matching template" complete={Boolean(selectedArtifact)} />
                <span className="workflow-connector" />
                <WorkflowStep number="03" title="Generate artifact" detail="One AI request" complete={Boolean(sourceIssue)} />
              </section>

              <section className="input-card">
                <div className="input-card-heading">
                  <div className="section-icon">↗</div>
                  <div><p className="eyebrow">SINGLE-ARTIFACT GENERATION</p><h2>Choose an action and Jira issue</h2></div>
                  <div className="template-count">
                    <span className={availableCount === ARTIFACTS.length ? 'template-check ready' : 'template-check'}>{templates ? (availableCount === ARTIFACTS.length ? '✓' : '!') : '…'}</span>
                    <span>{templates ? `${availableCount} of 3 templates ready` : 'Checking templates'}</span>
                  </div>
                </div>
                <form className="issue-form" onSubmit={buildArtifact}>
                  <label htmlFor="artifact-action">QA action</label>
                  <select
                    id="artifact-action"
                    className="artifact-select"
                    value={selectedArtifactId}
                    onChange={(event) => {
                      setSelectedArtifactId(event.target.value);
                      setArtifacts(null);
                      setSourceIssue(null);
                      setNotice(null);
                    }}
                    disabled={busy !== ''}
                    required
                  >
                    <option value="" disabled>Select one artifact</option>
                    {ARTIFACTS.map((artifact) => <option key={artifact.id} value={artifact.id}>{artifact.title}</option>)}
                  </select>
                  <label htmlFor="issue-key">Jira issue key</label>
                  <div className="input-row">
                    <span className="input-prefix">#</span>
                    <input
                      id="issue-key"
                      value={issueKey}
                      onChange={(event) => setIssueKey(event.target.value)}
                      placeholder="For example, QA-123"
                      autoComplete="off"
                      required
                    />
                    <button className="primary-button" disabled={busy !== '' || !modelReady || !templates || !issueKey.trim() || !selectedArtifact}>
                      {busy === 'artifact' ? <><span className="button-spinner" /> Generating…</> : <>Generate {selectedArtifact?.title ?? 'artifact'} <span>→</span></>}
                    </button>
                  </div>
                  <div className="input-foot">
                    <span><i className={jiraReady ? 'tiny-status online' : 'tiny-status'} />{jiraReady ? 'Jira credentials found' : 'Check Jira setup in Settings'}</span>
                    {modelReady
                      ? <span className="selected-model">{provider === 'groq' ? 'Groq' : 'Ollama'} · {model}{modelTested ? ' · tested' : ''}</span>
                      : <button className="inline-link" type="button" onClick={() => setPage('settings')}>Choose an AI model <span>↗</span></button>}
                  </div>
                </form>
              </section>

              {sourceIssue && (
                <div className="issue-source">
                  <div className="source-avatar">J</div>
                  <div className="source-copy"><small>GENERATED FROM JIRA</small><strong>{sourceIssue.key} <span>·</span> {sourceIssue.summary}</strong></div>
                  <a href={sourceIssue.url} target="_blank" rel="noreferrer">View issue ↗</a>
                </div>
              )}
              {notice && <div className={`notice ${notice.kind}`} role="status"><span>{notice.kind === 'success' ? '✓' : notice.kind === 'warning' ? '!' : '×'}</span>{notice.text}</div>}

              {selectedArtifact ? (
                <section className="suite-grid single-artifact" aria-label="Generated QA artifact">
                  <ArtifactCard
                    definition={selectedArtifact}
                    template={templates?.find((item) => item.id === selectedArtifact.id)}
                    result={artifacts?.[selectedArtifact.id]}
                    busy={busy === 'artifact'}
                  />
                </section>
              ) : (
                <div className="empty-state action-empty">
                  <div className="empty-art">✦</div>
                  <h3>Select one QA action to begin</h3>
                  <p>Each submission generates only the selected artifact with a single AI request.</p>
                </div>
              )}
            </>
          ) : (
            <section className="settings-page">
              <div className="settings-heading">
                <div><p className="eyebrow"><span className="eyebrow-line" /> WORKSPACE CONFIGURATION</p><h1>Settings</h1></div>
                <div className="secure-note"><span>♢</span> Credentials stay on this server</div>
              </div>
              <p className="settings-subtitle">Connect the services your QA workflow needs.</p>

              <div className="settings-grid">
                <section className="setting-card">
                  <div className="setting-card-heading">
                    <span className="card-icon jira-icon">J</span>
                    <div><p className="eyebrow">ISSUE SOURCE</p><h2>Jira connection</h2><p>Read-only access to Jira issues</p></div>
                    <span className={jiraReady ? 'connection-pill connected' : 'connection-pill'}><i />{jiraReady ? 'Configured' : 'Setup needed'}</span>
                  </div>
                  <div className="setting-list">
                    <SettingRow label="Base URL" ready={settings?.jira?.baseUrlConfigured} />
                    <SettingRow label="Email" ready={settings?.jira?.emailConfigured} />
                    <SettingRow label="API token" ready={settings?.jira?.tokenConfigured} secret />
                  </div>
                  <p className="config-source">Loaded from the parent <code>cred.env</code>. Secret values are never sent to the browser.</p>
                  <button className="secondary-button" disabled={busy !== ''} onClick={testJira}>
                    {busy === 'jira' ? <><span className="button-spinner dark" /> Testing connection…</> : <>Test Jira connection <span>→</span></>}
                  </button>
                </section>

                <section className="setting-card">
                  <div className="setting-card-heading">
                    <span className="card-icon ai-icon">✦</span>
                    <div><p className="eyebrow">ARTIFACT GENERATION</p><h2>AI provider</h2><p>Select an available model</p></div>
                    {modelReady && <span className="connection-pill connected"><i />{modelTested ? 'Tested' : 'Selected'}</span>}
                  </div>
                  <div className="provider-list">
                    <ProviderOption
                      name="Groq.com"
                      description={settings?.llm?.groqConfigured ? 'API key loaded securely' : 'GROQ_API_KEY is missing'}
                      selected={provider === 'groq'}
                      onSelect={() => loadModels('groq')}
                      busy={busy === 'models' && provider === 'groq'}
                    />
                    <ProviderOption
                      name="Ollama"
                      description="Local service · 127.0.0.1:11434"
                      selected={provider === 'ollama'}
                      onSelect={() => loadModels('ollama')}
                      busy={busy === 'models' && provider === 'ollama'}
                    />
                  </div>
                  {models.length > 0 && (
                    <div className="model-picker">
                      <label htmlFor="model">Available model</label>
                      <select id="model" value={model} onChange={(event) => { setModel(event.target.value); setTestedSelection(''); }}>
                        <option value="">Select a model</option>
                        {models.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                      <button className="secondary-button" disabled={!model || busy !== ''} onClick={testModel}>
                        {busy === 'llm' ? <><span className="button-spinner dark" /> Testing model…</> : <>Test {provider === 'groq' ? 'Groq.com' : 'local LLM'} <span>→</span></>}
                      </button>
                    </div>
                  )}
                </section>
              </div>
              {notice && <div className={`notice ${notice.kind}`} role="status"><span>{notice.kind === 'success' ? '✓' : '!'}</span>{notice.text}</div>}
            </section>
          )}
        </main>
        <footer className="page-footer"><span>✦</span> PLOT QA STUDIO <i /> Source-grounded planning · Jira remains read-only</footer>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, detail, active = false, complete = false }) {
  return (
    <div className={`workflow-step${active ? ' active' : ''}${complete ? ' complete' : ''}`}>
      <span className="step-number">{complete ? '✓' : number}</span>
      <span className="step-copy"><strong>{title}</strong><small>{detail}</small></span>
    </div>
  );
}

function MarkdownDocument({ content }) {
  const html = DOMPurify.sanitize(marked.parse(content, {
    gfm: true,
    breaks: false,
  }), {
    USE_PROFILES: { html: true },
  });

  return <div className="markdown-document" dangerouslySetInnerHTML={{ __html: html }} />;
}

function ArtifactCard({ definition, template, result, busy }) {
  const status = result?.status ?? (busy && template?.available ? 'generating' : template ? (template.available ? 'ready' : 'unavailable') : 'checking');
  const statusLabels = {
    checking: 'Checking',
    ready: 'Template ready',
    generating: 'Building',
    complete: 'Ready to review',
    unavailable: 'Template missing',
    error: 'Needs attention',
  };
  return (
    <article className={`artifact-card artifact-${definition.id}`}>
      <header className="artifact-header">
        <span className="artifact-number">{definition.icon}</span>
        <span className={`artifact-status status-${status}`}><i />{statusLabels[status]}</span>
      </header>
      <div className="artifact-title"><p className="eyebrow">QA DELIVERABLE</p><h2>{definition.title}</h2><p>{definition.description}</p></div>
      <div className="artifact-template">
        <span className="template-file-icon">▤</span>
        <span><small>SOURCE TEMPLATE</small><strong>{template?.file ?? definition.file}</strong></span>
        <i className={template?.available ? 'template-state ready' : 'template-state'}>{template ? (template.available ? '✓' : '!') : '…'}</i>
      </div>
      <div className={`artifact-body${status === 'complete' ? ' has-content' : ''}`} aria-live="polite">
        {status === 'generating' ? (
          <div className="artifact-progress"><span className="large-spinner" /><strong>Building from Jira…</strong><small>Following the supplied template</small></div>
        ) : status === 'complete' ? (
          <MarkdownDocument content={result.content} />
        ) : status === 'error' || status === 'unavailable' ? (
          <div className="artifact-message error-message"><span>!</span><p>{result?.error ?? template?.error ?? `Template missing: ${definition.file}`}</p></div>
        ) : status === 'checking' ? (
          <div className="artifact-progress"><span className="large-spinner" /><strong>Checking template…</strong></div>
        ) : (
          <div className="artifact-empty"><span>✦</span><strong>Ready when you are</strong><small>Enter a Jira ticket above to build this artifact.</small></div>
        )}
      </div>
    </article>
  );
}

function SettingRow({ label, ready, secret = false }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <span className={ready ? 'setting-value ready-text' : 'setting-value'}>
        {ready ? (secret ? '••••••••  Configured' : 'Configured') : 'Not configured'}
      </span>
    </div>
  );
}

function ProviderOption({ name, description, selected, onSelect, busy }) {
  return (
    <button className={selected ? 'provider-option selected' : 'provider-option'} type="button" onClick={onSelect} disabled={busy}>
      <span className="provider-logo">{name === 'Groq.com' ? 'G' : 'O'}</span>
      <span className="provider-copy"><strong>{name}</strong><small>{description}</small></span>
      <span className="provider-action">{busy ? 'Loading…' : selected ? 'Selected' : 'Choose'}</span>
    </button>
  );
}

createRoot(document.getElementById('root')).render(<App />);
