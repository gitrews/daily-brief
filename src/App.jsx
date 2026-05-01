import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  RadioTower,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { chartUrl, fetchBrief, fetchIndex, formatDate } from './lib/data.js';

function AppShell({ children }) {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="border-b border-white/10 bg-coal-950/82 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-signal-500/40 bg-signal-500/10">
              <RadioTower className="h-5 w-5 text-signal-500" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-signal-500">
                Daily Intel
              </p>
              <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                Разведывательные брифинги
              </h1>
            </div>
          </Link>
          <Link
            to="/latest"
            className="inline-flex h-10 items-center gap-2 border border-white/12 bg-white/5 px-3 text-sm font-medium text-slate-200 transition hover:border-signal-500/60 hover:text-white"
          >
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Последний</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.16em] text-slate-400">
        <Activity className="h-5 w-5 animate-pulse text-signal-500" aria-hidden="true" />
        Загрузка
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="border border-amberline/40 bg-amberline/10 p-5 text-amber-100">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amberline" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-white">Ошибка загрузки</h2>
          <p className="mt-1 text-sm text-amber-100/80">{message}</p>
        </div>
      </div>
    </div>
  );
}

function useIndex() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let alive = true;

    fetchIndex()
      .then((data) => {
        if (alive) setState({ status: 'ready', data, error: null });
      })
      .catch((error) => {
        if (alive) setState({ status: 'error', data: null, error });
      });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}

function ArchivePage() {
  const { status, data, error } = useIndex();

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={error.message} />;

  const totalRegions = new Set(data.briefings.flatMap((brief) => brief.regions)).size;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 border border-white/10 bg-coal-900/86 p-5 shadow-panel sm:grid-cols-3 sm:p-6">
        <Metric icon={FileText} label="Брифингов" value={data.briefings.length} />
        <Metric icon={Globe2} label="Регионов" value={totalRegions} />
        <Metric icon={ShieldAlert} label="Последний выпуск" value={formatDate(data.latest)} compact />
      </section>

      <section className="space-y-3">
        {data.briefings.map((brief) => (
          <Link
            key={brief.date}
            to={`/${brief.date}`}
            className="group block border border-white/10 bg-coal-850/78 p-4 transition hover:border-signal-500/50 hover:bg-coal-800 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays className="h-4 w-4 text-signal-500" aria-hidden="true" />
                    {formatDate(brief.date)}
                  </span>
                  <RiskBadge level={brief.riskLevel} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">{brief.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                    {brief.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brief.regions.map((region) => (
                    <span
                      key={region}
                      className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs uppercase tracking-[0.12em] text-slate-400"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight
                className="hidden h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-signal-500 sm:block"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function LatestRedirect() {
  const { status, data, error } = useIndex();

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={error.message} />;

  return <Navigate to={`/${data.latest}`} replace />;
}

function BriefPage() {
  const { date } = useParams();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let alive = true;

    setState({ status: 'loading', data: null, error: null });
    fetchBrief(date)
      .then((data) => {
        if (alive) setState({ status: 'ready', data, error: null });
      })
      .catch((error) => {
        if (alive) setState({ status: 'error', data: null, error });
      });

    return () => {
      alive = false;
    };
  }, [date]);

  if (statusIsLoading(state)) return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.error.message} />;

  const brief = state.data;

  return (
    <article className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Архив
      </Link>

      <section className="border border-white/10 bg-coal-900/88 p-5 shadow-panel sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm uppercase tracking-[0.16em] text-signal-500">
                {formatDate(brief.date)}
              </span>
              <RiskBadge level={brief.riskLevel} />
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-4xl">
              {brief.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {brief.executiveSummary}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[30rem] lg:grid-cols-2">
            {brief.metrics.map((metric) => (
              <div key={metric.label} className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <div className="space-y-6">
          <Panel title="Ключевые выводы" icon={Gauge}>
            <ul className="space-y-3">
              {brief.keyJudgements.map((item) => (
                <li key={item} className="border-l-2 border-signal-500/70 pl-4 text-sm leading-6 text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Операционная динамика" icon={Activity}>
            <div className="space-y-5">
              {brief.sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-base font-semibold text-white">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{section.body}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Хронология" icon={Clock3}>
            <ol className="space-y-4">
              {brief.timeline.map((event) => (
                <li key={`${event.time}-${event.title}`} className="grid gap-2 sm:grid-cols-[5rem_1fr]">
                  <time className="text-sm font-semibold text-signal-500">{event.time}</time>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{event.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Индикаторы" icon={ShieldAlert}>
            <div className="space-y-3">
              {brief.indicators.map((indicator) => (
                <div key={indicator.name} className="border border-white/10 bg-coal-950/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{indicator.name}</span>
                    <span className="text-sm text-slate-400">{indicator.value}</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-white/10">
                    <div
                      className="h-full bg-signal-500"
                      style={{ width: `${indicator.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="График риска" icon={BarChart3}>
            <img
              src={chartUrl(brief.date)}
              alt={`График риска за ${formatDate(brief.date)}`}
              className="w-full border border-white/10 bg-coal-950"
            />
          </Panel>

          <Panel title="Источники" icon={ExternalLink}>
            <ul className="space-y-3">
              {brief.sources.map((source) => (
                <li key={source.name} className="text-sm leading-6">
                  <a
                    href={source.url}
                    className="text-slate-300 underline decoration-white/20 underline-offset-4 transition hover:text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </section>
    </article>
  );
}

function statusIsLoading(state) {
  return state.status === 'loading';
}

function Metric({ icon: Icon, label, value, compact = false }) {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center border border-white/10 bg-white/[0.04]">
        <Icon className="h-5 w-5 text-signal-500" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className={`mt-1 font-semibold text-white ${compact ? 'text-base' : 'text-2xl'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const classes = useMemo(
    () => ({
      high: 'border-red-400/40 bg-red-400/10 text-red-200',
      elevated: 'border-amberline/50 bg-amberline/10 text-amber-100',
      moderate: 'border-signal-500/50 bg-signal-500/10 text-emerald-100',
      low: 'border-slate-500/50 bg-slate-500/10 text-slate-200',
    }),
    [],
  );

  const labels = {
    high: 'Высокий риск',
    elevated: 'Повышенный риск',
    moderate: 'Умеренный риск',
    low: 'Низкий риск',
  };

  return (
    <span className={`border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.12em] ${classes[level] ?? classes.moderate}`}>
      {labels[level] ?? labels.moderate}
    </span>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="border border-white/10 bg-coal-850/76 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-signal-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-200">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function NotFound() {
  return (
    <div className="border border-white/10 bg-coal-850/78 p-6">
      <h2 className="text-xl font-semibold text-white">Страница не найдена</h2>
      <Link to="/" className="mt-4 inline-flex text-sm font-medium text-signal-500 hover:text-signal-600">
        Вернуться в архив
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ArchivePage />} />
        <Route path="/latest" element={<LatestRedirect />} />
        <Route path="/:date" element={<BriefPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
