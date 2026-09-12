import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, GitPullRequest, CircleDot, MessageSquareText } from "lucide-react";
import { I18N } from "./lib/i18n";
import { useTheme } from "./hooks/useTheme";
import { useAnalysis } from "./hooks/useAnalysis";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { RepoInput } from "./components/dashboard/RepoInput";
import { StatusLine } from "./components/dashboard/StatusLine";
import { StatsBar } from "./components/dashboard/StatsBar";
import { IssueList } from "./components/dashboard/IssueList";
import { DigestModal } from "./components/dashboard/DigestModal";
import { SkeletonStats } from "./components/dashboard/SkeletonList";

function initialLang() {
  try {
    const s = localStorage.getItem("ma_lang");
    if (s) return s;
  } catch (e) { /* ignore */ }
  return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
}

export default function App() {
  const [lang, setLangState] = useState(initialLang);
  const { theme, toggleTheme } = useTheme();
  const { repo, setRepo, data, error, loading, analyze } = useAnalysis(lang);
  const [dashboard, setDashboard] = useState(window.location.hash === "#app");
  const [digestOpen, setDigestOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const L = I18N[lang];

  useEffect(() => {
    const syncRoute = () => setDashboard(window.location.hash === "#app");
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  function setLang(next) {
    if (next === lang) return;
    setLangState(next);
    try { localStorage.setItem("ma_lang", next); } catch (e) { /* ignore */ }
    // Don't re-run the pipeline on language switch — avoids rate limiting.
    // UI labels and verdict translations update client-side.
  }

  return (
    <div className="min-h-screen">
      <Header lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} L={L} dashboard={dashboard} />

      {!dashboard ? <Landing onOpen={() => { window.location.hash = "app"; setDashboard(true); }} /> : <>
      <div className="container-main">
        <div className="workspace-intro">
          <div><h1>{lang === "zh" ? "仓库分析" : "Repository overview"}</h1><p>{lang === "zh" ? "分析仓库，查看证据并决定下一步。" : "Analyze your queue, review the evidence, and decide what happens next."}</p></div>
          <div className="workspace-source"><ShieldCheck size={15} /> {lang === "zh" ? "默认只读" : "Read-only workspace"}</div>
        </div>
        <div className="workspace-search">
          <RepoInput
            repo={repo}
            setRepo={setRepo}
            onAnalyze={(target) => analyze(target)}
            L={L}
          />
          <StatusLine data={data} L={L} />
        </div>
      </div>

      <main className="container-main workspace-content pb-[72px]">
        {loading ? <SkeletonStats /> : data ? <StatsBar stats={data?.stats} L={L} filter={filter} setFilter={setFilter} /> : null}
        <IssueList
          data={data}
          error={error}
          loading={loading}
          repo={repo}
          lang={lang}
          L={L}
          filter={filter}
          onRetry={() => analyze(repo)}
          onOpenDigest={() => setDigestOpen(true)}
        />
      </main>

      </>}
      <Footer L={L} />

      <DigestModal
        open={digestOpen}
        digestMd={data?.digest_md}
        L={L}
        onClose={() => setDigestOpen(false)}
      />
    </div>
  );
}

function Landing({ onOpen }) {
  return <main className="landing-new">
    <section className="intro-new container-main">
      <h1>More perspective.<br/><span>Less sorting.</span></h1>
      <p>MaintainerOS helps you make sense of issues and pull requests, with evidence for every recommendation and the final decision always yours.</p>
      <div className="intro-actions"><button onClick={onOpen}>Try the workspace <ArrowRight size={17}/></button><a href="#example">See it in action <span aria-hidden="true">↓</span></a></div>
      <div className="intro-foot">Open source <span>·</span> Runs offline <span>·</span> No account needed</div>
    </section>
    <section className="example-section" id="example"><div className="container-main example-layout">
      <div className="example-copy"><h2>See the connection<br/>before you reply.</h2><p>Two reports can describe the same bug in different words. MaintainerOS searches the queue for a possible match and gives you the context to decide.</p><span>FROM THE INCLUDED DEMO</span></div>
      <div className="example-sheet"><div className="sheet-top"><span>octocat / octo-demo</span><span>Issue review</span></div><div className="sheet-body"><div className="sheet-label"><CircleDot size={16}/> ISSUE #102</div><h3>Division by zero crash when computing the mean of three numbers</h3><div className="sheet-rule"/><div className="match-label">Possible duplicate</div><div className="match-row"><span>#101</span><strong>Crash: ZeroDivisionError when averaging exactly 3 values</strong><ArrowRight size={16}/></div><p>Both reports describe a division by zero when averaging three values.</p><div className="sheet-bottom"><span><MessageSquareText size={15}/> Reply drafted for review</span><span>Awaiting your decision</span></div></div></div>
    </div></section>
    <section className="story-section container-main"><div className="story-heading"><h2>Built for the decisions<br/>only you can make.</h2><p>From the first report to a thoughtful response, the details stay close at hand.</p></div><div className="story-columns"><article><CircleDot size={22}/><h3>Make sense of the queue.</h3><p>Prioritize reports, find possible duplicates, and surface pull requests ready for review.</p></article><article><GitPullRequest size={22}/><h3>Look at the evidence.</h3><p>See the signals behind each assessment, with confidence and context attached.</p></article><article><ShieldCheck size={22}/><h3>Keep the final say.</h3><p>Review every proposed action. The default workflow is read-only and dry-run.</p></article></div></section>
    <section className="close-new"><div className="container-main"><h2>Open the demo.<br/>See for yourself.</h2><p>Start with the included sample repository. No token required.</p><button onClick={onOpen}>Open workspace <ArrowRight size={17}/></button></div></section>
  </main>;
}
