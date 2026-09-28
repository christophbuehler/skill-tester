import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Columns2,
  Monitor,
  Smartphone,
  RotateCcw,
  Github,
  X,
  Plus,
  Layers,
  FlaskConical,
} from "lucide-react";
import catalog from "./generated/catalog.json";
import prompts from "./generated/prompt.json";
import "./styles.css";
type Run = {
  id: string;
  benchmark: string;
  mode?: string;
  parentRunId?: string;
  reviewInstruction?: string;
  profile: string;
  label: string;
  status: string;
  createdAt: string;
  model: string;
  reasoning: string;
  cliVersion: string;
  apmVersion: string;
  profileInstruction: string;
  tokenUsage: { input_tokens: number; output_tokens: number }[];
  skills: {
    id: string;
    name: string;
    repo: string;
    path: string;
    commit: string;
    license: string;
  }[];
  elapsedMs: number;
  repairCount: number;
  refinementCount?: number;
  refinementPrompt?: string;
  browserReview?: Record<string, { captures: string[]; recordings?: {video: string; sheet: string; durationSeconds: number}[] }>;
  promptHash: string;
  starterHash: string;
  validation: { task: string; passed: boolean }[];
  failure?: string | null;
  assessment?: { statusLabel?: string; label: string; reason: string; summary?: string; document: string };
  accessibility?: {
    viewport: string;
    findings: { id: string; impact: string; nodes: number }[];
  }[];
  loadedSkills: string[];
};
const runs = catalog as Run[];
const designNotes = import.meta.glob("../runs/*/DESIGN.md", { query: "?raw", import: "default" });
const base = import.meta.env.BASE_URL;
const repo = "https://github.com/christophbuehler/skill-tester";
const accent = ["var(--series-baseline)", "var(--series-design)", "var(--series-craft)", "var(--series-ux)"];
const descriptions: Record<string, string> = {
  baseline: "The starting point. Same model and brief, without a design skill.",
  "frontend-design":
    "Aesthetic direction, deliberate typography, and a distinct visual identity.",
  impeccable: "A design workflow with interaction craft and built-in critique.",
  "ui-ux-pro-max":
    "Design guidance informed by searchable styles and usability principles.",
};
function link(run: Run, scenario = "research") {
  return `${base}variants/${run.id}/?scenario=${scenario}`;
}
function App() {
  const [hash, setHash] = useState(location.hash);
  const [details, setDetails] = useState<Run | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  function openDetails(run: Run) {
    returnFocus.current = document.activeElement as HTMLElement;
    setDetails(run);
  }
  function openPrompt() {
    returnFocus.current = document.activeElement as HTMLElement;
    setShowPrompt(true);
  }
  useEffect(() => {
    const fn = () => setHash(location.hash);
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (!details && !showPrompt) return;
    const before = returnFocus.current;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetails(null);
        setShowPrompt(false);
      }
      if (e.key === "Tab") {
        const els = Array.from(
          document.querySelectorAll<HTMLElement>(
            "[role=dialog] button, [role=dialog] a[href]",
          ),
        );
        const first = els[0],
          last = els.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prior;
      before?.focus();
    };
  }, [details, showPrompt]);
  const query = new URLSearchParams(hash.split("?")[1] || "");
  const comparing = hash.startsWith("#compare");
  const passed = runs.filter((r) => r.status === "passed");
  const [selected, setSelected] = useState<string[]>([]);
  function compare(ids: string[]) {
    location.hash = `compare?left=${encodeURIComponent(ids[0] || passed[0]?.id || "")}&right=${encodeURIComponent(ids[1] || passed[1]?.id || passed[0]?.id || "")}&viewport=desktop&scenario=research`;
  }
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#">
          <span className="brand-mark">
            <Columns2 size={19} />
          </span>
          Skill Tester<span className="lab-label">Frontend lab</span>
        </a>
        <nav>
          <button onClick={openPrompt}>The brief</button>
          <a href={`${repo}/blob/main/docs/skill-catalog.md`} target="_blank" rel="noreferrer">The skills</a>
          <a href={repo} target="_blank" rel="noreferrer">
            <Github size={16} />
            <span>Source</span>
            <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>
      <main>
        {comparing ? (
          <Compare query={query} passed={passed} onDetails={openDetails} />
        ) : (
          <>
            <section className="intro">
              <div className="intro-copy">
                <div className="experiment-label">
                  <span className="live-dot" /> Folio / Versioned experiments
                </div>
                <h1>
                  One brief.
                  <br />
                  <span>Different instincts.</span>
                </h1>
                <p>
                  How much does a design skill change what AI builds?
                  <br className="wide-break" /> Same chatbot. Same model.
                  Explore the difference.
                </p>
                <div className="intro-actions">
                  <button
                    className="primary"
                    disabled={passed.length < 2}
                    onClick={() => compare([])}
                  >
                    <Columns2 size={17} />
                    Compare side by side
                  </button>
                  <button className="text-link" onClick={openPrompt}>
                    Read the shared brief <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
              <div
                className="experiment-diagram"
                aria-label="One prompt and model, different skill profiles, independent interfaces"
              >
                <div className="diagram-input">
                  <FlaskConical size={20} />
                  <strong>One controlled starting point</strong>
                  <span>Folio · React + Tailwind</span>
                </div>
                <div className="diagram-connector" />
                <div className="diagram-outputs">
                  {["No skill", "Design", "Craft", "UX"].map((s, i) => (
                    <div
                      key={s}
                      className="mini-variant"
                      style={
                        { "--variant-color": accent[i] } as React.CSSProperties
                      }
                    >
                      <div className="mini-window">
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="mini-body">
                        <aside aria-hidden="true" />
                        <section>
                          <b />
                          <em />
                          <em />
                          <span />
                        </section>
                      </div>
                      <small>{s}</small>
                    </div>
                  ))}
                </div>
                <p>Within each version, only the skill profile changes.</p>
              </div>
            </section>
            <section className="method-strip" aria-label="Benchmark settings">
              <div>
                <span>Model</span>
                <strong>
                  {runs[0]?.model || "gpt-6-astra"} <small>/ {runs[0]?.reasoning || "xhigh"}</small>
                </strong>
              </div>
              <div>
                <span>Stack</span>
                <strong>React + Tailwind</strong>
              </div>
              <div>
                <span>Behavior</span>
                <strong>Shared mock agent</strong>
              </div>
              <div>
                <span>Method</span>
                <strong>1 run per profile</strong>
              </div>
            </section>
            <section className="results">
              <div className="section-top">
                <div>
                  <h2>
                    The interfaces <span>{runs.length}</span>
                  </h2>
                  <p>Select two versions, or open one and try it.</p>
                </div>
                <button
                  className="secondary"
                  disabled={selected.length !== 2}
                  onClick={() => compare(selected)}
                >
                  <Columns2 size={16} />
                  Compare selected{" "}
                  {selected.length > 0 && `(${selected.length}/2)`}
                </button>
              </div>
              <div className="gallery">
                {runs.map((run, i) => (
                  <article
                    key={run.id}
                    className={`variant-card ${selected.includes(run.id) ? "selected" : ""}`}
                    style={
                      {
                        "--variant-color": accent[i % accent.length],
                      } as React.CSSProperties
                    }
                  >
                    <div className="card-top">
                      <span className="profile-kind">
                        {run.skills.length === 0
                          ? "Control"
                          : run.skills.length === 1
                            ? "Single skill"
                            : `${run.skills.length} skills combined`}
                      </span>
                      <label className="select-variant">
                        <input
                          aria-label={`Select ${run.label}`}
                          type="checkbox"
                          checked={selected.includes(run.id)}
                          disabled={
                            run.status !== "passed" ||
                            (!selected.includes(run.id) &&
                              selected.length === 2)
                          }
                          onChange={() =>
                            setSelected((s) =>
                              s.includes(run.id)
                                ? s.filter((id) => id !== run.id)
                                : [...s, run.id],
                            )
                          }
                        />
                        <span>Select</span>
                      </label>
                    </div>
                    <a
                      className="preview"
                      href={run.status === "passed" ? link(run) : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${run.label}`}
                    >
                      {run.status === "passed" ? (
                        <img
                          src={`${base}evidence/${run.id}/desktop.png`}
                          alt={`${run.label} chatbot screenshot`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="failed-preview">
                          <X />
                          <strong>{run.assessment?.label || "Generation did not pass"}</strong>
                          <p>{run.assessment?.summary || run.failure}</p>
                        </div>
                      )}
                      {run.status === "passed" && (
                        <span className="preview-open">
                          Explore interface <ArrowUpRight size={16} />
                        </span>
                      )}
                    </a>
                    <div className="card-info">
                      <div className="card-title">
                        <h3>{run.label}</h3>
                        <span
                          className={`status ${run.status === "passed" ? "passed" : "failed"}`}
                        >
                          {run.status === "passed" ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}{" "}
                          {run.status === "passed" ? "Checks passed" : run.assessment?.statusLabel || "Failed"}
                        </span>
                      </div>
                      <p>
                        {run.benchmark} · {descriptions[run.profile] ||
                          (run.skills.length ? run.skills.map((s) => s.name).join(" + ") : "No design skill.")}
                      </p>
                      <div className="card-bottom">
                        <span>
                          {(run.elapsedMs / 60000).toFixed(1)} min{" "}
                          <span className="dot-divider">·</span>{" "}
                          {run.repairCount === 0 ? "No repair" : "1 repair"}
                        </span>
                        <button onClick={() => openDetails(run)}>
                          Run details <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="combination-note">
              <div className="stack-icon">
                <Layers size={24} />
                <Plus size={12} />
              </div>
              <div>
                <h2>What happens when skills work together?</h2>
                <p>
                  Combine any registered skills into one profile. Each
                  combination becomes its own version, with the same brief and a
                  complete record of what ran.
                </p>
                <code>
                  “Make a version with these four skills all activated.”
                </code>
              </div>
              <a
                href={`${repo}#generate-a-variant`}
                target="_blank"
                rel="noreferrer"
              >
                Create a combination <ArrowUpRight size={16} />
              </a>
            </section>
          </>
        )}
      </main>
      <footer>
        <span>Built to make the differences visible.</span>
        <span>
          A practical showcase, not a skill ranking.{" "}
          <a href={`${repo}#methodology`}>
            Methodology <ArrowUpRight size={12} />
          </a>
        </span>
      </footer>
      {(details || showPrompt) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setDetails(null);
            setShowPrompt(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={details ? "Run details" : "Shared brief"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => {
                setDetails(null);
                setShowPrompt(false);
              }}
            >
              <X />
            </button>
            {details ? (
              <>
                <span className="eyebrow">Run record</span>
                <h2>{details.label}</h2>
                <p className="muted">{details.id}</p>
                <dl>
                  <dt>Benchmark</dt><dd>{details.benchmark}{details.mode === "curated-followup" && " · Curated follow-up (extra review, not a fresh benchmark run)"}</dd>
                  {details.parentRunId && <><dt>Parent run</dt><dd>{details.parentRunId}</dd><dt>Recorded review</dt><dd><pre className="prompt-text">{details.reviewInstruction}</pre></dd></>}
                  <dt>Model</dt>
                  <dd>
                    {details.model} / {details.reasoning}
                  </dd>
                  <dt>Task prompt</dt><dd><details><summary>Read exact prompt</summary><pre className="prompt-text">{(prompts as Record<string,string>)[details.benchmark]}</pre></details></dd>
                  <dt>Generated</dt>
                  <dd>{new Date(details.createdAt).toLocaleString()}</dd>
                  {details.assessment && <><dt>Design review</dt><dd><strong>{details.assessment.label}</strong><p>{details.assessment.reason}</p><a href={`${repo}/blob/main/${details.assessment.document}`}>Read the assessment</a></dd></>}
                  <dt>Outcome</dt>
                  <dd>
                    {details.status}; {details.refinementCount ?? 0} visual refinement(s); {details.repairCount} repair(s)
                  </dd>
                  <dt>Environment</dt>
                  <dd>
                    {details.cliVersion}
                    <br />
                    {details.apmVersion}
                  </dd>
                  <dt>Elapsed</dt>
                  <dd>{(details.elapsedMs / 60000).toFixed(1)} minutes</dd>
                  <dt>Reported tokens</dt>
                  <dd>
                    {details.tokenUsage
                      .reduce((sum, u) => sum + u.input_tokens, 0)
                      .toLocaleString()}{" "}
                    input (including cached),{" "}
                    {details.tokenUsage
                      .reduce((sum, u) => sum + u.output_tokens, 0)
                      .toLocaleString()}{" "}
                    output
                  </dd>
                  <dt>Prompt SHA-256</dt>
                  <dd className="hash">{details.promptHash}</dd>
                  <dt>Starter SHA-256</dt>
                  <dd className="hash">{details.starterHash}</dd>
                </dl>
                <h3>Enabled skills</h3>
                {details.skills.length ? (
                  details.skills.map((s) => (
                    <p key={s.id}>
                      <a
                        href={`https://github.com/${s.repo}/tree/${s.commit}/${s.path}`}
                      >
                        {s.name} <ArrowUpRight size={12} />
                      </a>
                      <br />
                      <small>
                        {s.commit.slice(0, 12)} · {s.license}
                      </small>
                    </p>
                  ))
                ) : (
                  <p>No design skill.</p>
                )}
                <details className="profile-instruction">
                  <summary>Exact profile instruction</summary>
                  <pre className="prompt-text">
                    {details.profileInstruction}
                  </pre>
                </details>
                {details.refinementCount ? <section>
                  <h3>Design refinement evidence</h3>
                  <p>{details.refinementCount} browser-informed refinement session(s). Functional checks do not rate visual quality.</p>
                  <details><summary>Exact refinement instruction</summary><pre className="prompt-text">{details.refinementPrompt}</pre></details>
                  {Object.entries(details.browserReview || {}).map(([phase, evidence]) => {
                    const folder = phase === 'before' ? 'review-before' : phase === 'after' ? 'review-after' : `review-round-${phase.replace('round','')}`;
                    const label = phase === 'before' ? 'Initial implementation' : phase === 'after' ? 'Final result' : `After refinement ${phase.replace('round','')}`;
                    const prefix = `${base}evidence/${details.id}/${folder}/`;
                    return <details key={phase}><summary>{label}</summary>
                      <ul>{evidence.captures.map(file=><li key={file}><a href={prefix+file} target="_blank" rel="noreferrer">{file.replace('.png','')}</a></li>)}</ul>
                      {evidence.recordings?.map(recording=><div key={recording.video}>
                        <p>{recording.video.replace('.webm','')} · {recording.durationSeconds.toFixed(1)}s</p>
                        <a href={prefix+recording.sheet} target="_blank" rel="noreferrer"><img style={{width:'100%',maxHeight:360,objectFit:'contain'}} loading="lazy" src={prefix+recording.sheet} alt={`${label} ${recording.video.includes('mobile')?'mobile':'desktop'} interaction sequence`} /></a>
                        <a href={prefix+recording.video.replace(/\.webm$/,'.mp4')} download>Download recording (MP4)</a>
                        {' · '}<a href={prefix+recording.video} download>Original WebM</a>
                      </div>)}
                    </details>;
                  })}
                </section> : null}
                <h3>Validation</h3>
                <ul>
                  {details.validation.map((v) => (
                    <li key={v.task}>
                      {v.passed ? "Passed" : "Failed"}: {v.task}
                    </li>
                  ))}
                </ul>
                {details.failure && <p role="alert">{details.failure}</p>}
                <h3>Accessibility findings</h3>
                {details.accessibility?.length ? (
                  details.accessibility.map((a, i) => (
                    <p key={i}>
                      {a.viewport}:{" "}
                      {a.findings.length
                        ? a.findings
                            .map(
                              (f) =>
                                `${f.id} (${f.impact}, ${f.nodes} elements)`,
                            )
                            .join("; ")
                        : "No automated violations detected."}
                    </p>
                  ))
                ) : (
                  <p>No report available.</p>
                )}
                {designNotes[`../runs/${details.id}/DESIGN.md`] && <p><a href={`${repo}/blob/main/runs/${details.id}/DESIGN.md`}>
                  Read design decisions <ArrowUpRight size={14} />
                </a></p>}
                <a href={`${repo}/tree/main/runs/${details.id}`}>
                  View source and metadata <ArrowUpRight size={14} />
                </a>
              </>
            ) : (
              <>
                <span className="eyebrow">The constant</span>
                <h2>One brief per benchmark version.</h2>
                <p className="muted">
                  Within each version, all profiles receive the same task prompt. Different versions are separate experiments.
                </p>
                {Object.entries(prompts).map(([id, text]) => <section key={id}><h3>{id}</h3><pre className="prompt-text">{text}</pre></section>)}
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
function Compare({
  query,
  passed,
  onDetails,
}: {
  query: URLSearchParams;
  passed: Run[];
  onDetails: (r: Run) => void;
}) {
  const get = (key: string, i: number) =>
    passed.find((r) => r.id === query.get(key)) || passed[i] || passed[0];
  const left = get("left", 0),
    right = get("right", 1);
  const mobile = query.get("viewport") === "mobile";
  const scenario = ["welcome", "research", "files", "error"].includes(
    query.get("scenario") || "",
  )
    ? query.get("scenario")!
    : "research";
  const [reset, setReset] = useState(0);
  const identical =
    !!left &&
    !!right &&
    ["model", "reasoning", "promptHash", "starterHash", "benchmark", "mode", "parentRunId"].every(
      (k) => left[k as keyof Run] === right[k as keyof Run],
    );
  function update(k: string, v: string) {
    const q = new URLSearchParams(query);
    q.set(k, v);
    location.hash = `compare?${q}`;
  }
  return (
    <section className="compare-page">
      <a className="back-link" href="#">
        <ArrowLeft size={16} />
        All interfaces
      </a>
      <div className="compare-heading">
        <div>
          <h1>See the difference.</h1>
          <p className={identical ? undefined : "comparison-warning"}>
            {identical
              ? "Independent interfaces. Identical conditions."
              : "These runs use different inputs or settings. Check run details before comparing."}
          </p>
        </div>
        <div className="compare-tools">
          <div className="segmented">
            <button
              aria-pressed={!mobile}
              onClick={() => update("viewport", "desktop")}
            >
              <Monitor size={16} />
              Desktop
            </button>
            <button
              aria-pressed={mobile}
              onClick={() => update("viewport", "mobile")}
            >
              <Smartphone size={16} />
              Mobile
            </button>
          </div>
          <label className="scenario-label">
            Scenario
            <select
              aria-label="Scenario"
              value={scenario}
              onChange={(e) => update("scenario", e.target.value)}
            >
              <option value="welcome">Welcome</option>
              <option value="research">Research</option>
              <option value="files">Attachments</option>
              <option value="error">Error recovery</option>
            </select>
          </label>
          <button
            className="reset-button"
            onClick={() => setReset((r) => r + 1)}
          >
            <RotateCcw size={16} />
            Reset both
          </button>
        </div>
      </div>
      <div className="comparison-panes">
        {[left, right].map(
          (r, i) =>
            r && (
              <div className="comparison-pane" key={i}>
                <div className="pane-toolbar">
                  <VariantChooser
                    side={i ? "Right" : "Left"}
                    selected={r}
                    options={passed}
                    onSelect={(id) => update(i ? "right" : "left", id)}
                  />
                  <button onClick={() => onDetails(r)}>Details</button>
                  <a
                    aria-label={`Open ${r.label} standalone`}
                    href={link(r, scenario)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowUpRight size={18} />
                  </a>
                </div>
                <Viewport
                  run={r}
                  mobile={mobile}
                  scenario={scenario}
                  reset={reset}
                />
                <div className="viewport-label">
                  {mobile ? "390 × 844" : "1440 × 1000"}{" "}
                  <span>scaled to fit · fully interactive</span>
                </div>
              </div>
            ),
        )}
      </div>
    </section>
  );
}
function VariantChooser({ side, selected, options, onSelect }: {
  side: string;
  selected: Run;
  options: Run[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = `${side.toLowerCase()}-variants`;
  const selectedIndex = options.findIndex(run => run.id === selected.id);
  const [active, setActive] = useState(selectedIndex);
  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  useEffect(() => {
    if (open) optionRefs.current[active]?.focus({ preventScroll: true });
    if (open) optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);
  const skills = (run: Run) => run.skills.length
    ? <span className="chooser-skills">{run.skills.map(skill => <span key={skill.id}>{skill.name}</span>)}</span>
    : <span className="chooser-baseline">Baseline · No design skills activated</span>;
  return (
    <div className="variant-chooser" ref={root} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
    }}>
      <button
        ref={trigger}
        className="chooser-trigger"
        aria-label={`${side} variant: ${selected.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => { setActive(selectedIndex); setOpen(!open); }}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            setActive(selectedIndex);
            setOpen(true);
          }
        }}
      >
        <span className="chooser-summary">
          <span className="chooser-caption">{side} variant · {selected.benchmark}</span>
          <strong>{selected.label}</strong>
          {skills(selected)}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && <div className="chooser-popover">
        <div className="chooser-heading">Choose an interface <span>{options.length} passing runs</span></div>
        <div id={listId} role="listbox" aria-label={`${side} variant`} className="chooser-options"
          onKeyDown={(event) => {
            if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); }
            const next = event.key === "ArrowDown" ? (active + 1) % options.length
              : event.key === "ArrowUp" ? (active - 1 + options.length) % options.length
              : event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : null;
            if (next !== null) { event.preventDefault(); setActive(next); }
          }}>
          {options.map((run, index) => <button
            key={run.id}
            ref={(element) => { optionRefs.current[index] = element; }}
            type="button"
            role="option"
            aria-selected={run.id === selected.id}
            tabIndex={index === active ? 0 : -1}
            className="chooser-option"
            onFocus={() => setActive(index)}
            onClick={() => { onSelect(run.id); close(true); }}
          >
            <span className="chooser-summary">
              <span className="chooser-option-title"><strong>{run.label}</strong>{run.id === selected.id && <Check size={15} aria-hidden="true" />}</span>
              <span className="chooser-caption">{run.benchmark} · <span className="chooser-passed">Passed</span> · {run.skills.length} {run.skills.length === 1 ? "skill" : "skills"}</span>
              {skills(run)}
              <span className="chooser-run-id">{run.id}</span>
            </span>
          </button>)}
        </div>
        <p className="chooser-footnote">All activated skills are listed. Failed runs remain in the gallery.</p>
      </div>}
    </div>
  );
}
function Viewport({
  run,
  mobile,
  scenario,
  reset,
}: {
  run: Run;
  mobile: boolean;
  scenario: string;
  reset: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [available, setAvailable] = useState(600);
  const width = mobile ? 390 : 1440,
    height = mobile ? 844 : 1000;
  const scale = Math.min(1, available / width);
  useEffect(() => {
    const ro = new ResizeObserver((e) => setAvailable(e[0].contentRect.width));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: "skill-tester:reset", scenario },
      location.origin,
    );
  }, [reset, scenario]);
  return (
    <div className="viewport-container" ref={box}>
      <div
        className="viewport-fit"
        style={{ width: width * scale, height: height * scale }}
      >
        <iframe
          ref={frame}
          title={`${run.label} live preview`}
          src={link(run, scenario)}
          style={{ width, height, transform: `scale(${scale})` }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
