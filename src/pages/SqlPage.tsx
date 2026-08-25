import { useState } from 'react';
import { ReviewControl } from '../components/common/ReviewControl';
import {
  SQL_EXERCISES,
  SQL_KINDS,
  SQL_TABLES,
  type SqlKind,
  type SqlResult,
  type SqlValue,
} from '../data/sqlExercises';

/**
 * SQL for testers.
 *
 * Every exercise leads with the query that looks right and the rows it actually returned, because
 * that is the moment the lesson lands — a query that returns nothing, or returns a number that is
 * wrong in a way you would sign off on. The correct query is behind a reveal so there is a beat in
 * between for you to work out why.
 *
 * Both result sets are real: they came out of SQLite over the seed data in SQL_TABLES rather than
 * being written by hand, so the empty result on the first exercise is a fact about the query and
 * not a claim about it.
 */

const CARD = 'bg-slate-800 rounded-xl';
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase tracking-wider';

type Filter = SqlKind | 'all';

function cell(value: SqlValue) {
  if (value === null) {
    return <span className="text-amber-400/70 italic">NULL</span>;
  }
  return <span>{String(value)}</span>;
}

function ResultTable({ result, tone }: { result: SqlResult; tone: 'bad' | 'good' }) {
  if (result.rows.length === 0) {
    return (
      <div className="bg-slate-900 border border-red-500/30 rounded-lg p-3">
        <span className="text-xs font-mono text-red-300">0 rows</span>
        <p className="text-[11px] text-slate-500 mt-0.5">
          No error, no warning — the database is perfectly happy with this.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-x-auto">
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="border-b border-slate-700">
            {result.columns.map((col) => (
              <th key={col} className="text-left px-2.5 py-1.5 text-slate-500 font-semibold whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800 last:border-0">
              {row.map((value, j) => (
                <td key={j} className="px-2.5 py-1.5 text-slate-300 whitespace-nowrap">
                  {cell(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className={`px-2.5 py-1 text-[10px] border-t border-slate-800 ${
          tone === 'good' ? 'text-green-400/80' : 'text-red-300/80'
        }`}
      >
        {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}

function Sql({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-[11px] leading-relaxed overflow-x-auto text-slate-300 whitespace-pre">
      {children}
    </pre>
  );
}

function Schema() {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${CARD} p-5`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left flex items-center gap-2"
      >
        <div>
          <h3 className="text-lg font-bold">The fixture</h3>
          <p className="text-sm text-slate-400">
            Six tables, seeded so that every naive query below is wrong in a way you can see. Worth
            reading once — all twelve questions are asked against it.
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 ml-auto flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-3 mt-4">
          {SQL_TABLES.map((table) => (
            <div key={table.name}>
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <span className="text-sm font-mono font-medium text-indigo-300">{table.name}</span>
                <span className="text-[11px] text-slate-500">{table.note}</span>
              </div>
              <ResultTable
                result={{ columns: table.columns, rows: table.rows }}
                tone="good"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Exercise({ exercise }: { exercise: (typeof SQL_EXERCISES)[number] }) {
  const [revealed, setRevealed] = useState(false);
  const kind = SQL_KINDS.find((k) => k.id === exercise.kind)!;

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <h3 className="text-lg font-bold">{exercise.title}</h3>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            exercise.kind === 'verify'
              ? 'bg-indigo-500/20 text-indigo-300'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {kind.label}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-4">{exercise.prompt}</p>

      <span className={`${LABEL} mb-1.5`}>The query that looks right</span>
      <Sql>{exercise.naive.sql}</Sql>
      <div className="mt-2">
        <ResultTable result={exercise.naive.result} tone="bad" />
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-4 w-full px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
        >
          Work out what is wrong with it, then reveal
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <span className={`${LABEL} mb-1`}>Why it is wrong</span>
            <p className="text-xs text-red-200/80 leading-relaxed">{exercise.whyWrong}</p>
          </div>

          <div>
            <span className={`${LABEL} mb-1.5`}>The query that is right</span>
            <Sql>{exercise.correct.sql}</Sql>
            <div className="mt-2">
              <ResultTable result={exercise.correct.result} tone="good" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className={`${LABEL} mb-1`}>What the database is doing</span>
            <p className="text-xs text-slate-300 leading-relaxed">{exercise.mechanism}</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3">
            <span className={`${LABEL} mb-1`}>In the room</span>
            <p className="text-xs text-slate-400 leading-relaxed italic">“{exercise.say}”</p>
          </div>

          {/* Reading the answer is not learning it. Scheduling it means you get the prompt back
              with the query hidden, which is the only version that proves anything. */}
          <ReviewControl
            kind="sql"
            itemId={exercise.id}
            prompt="Come back and write it from the prompt:"
            className="pt-1"
          />
        </div>
      )}
    </div>
  );
}

export function SqlPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = SQL_EXERCISES.filter((e) => filter === 'all' || e.kind === filter);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-xl font-bold mb-1">SQL for testers</h2>
          <p className="text-sm text-slate-400 mb-2">
            Half of these are the classics an interviewer asks, and half are the query you actually
            write after a run — hunting for the row that should not exist. Every one is a pair: the
            query that looks right, beside the query that is right.
          </p>
          <p className="text-sm text-slate-400 mb-4">
            Both result sets are real. They came out of SQLite over the fixture below, so when the
            first query returns nothing, that is what it does rather than what this page says it
            does.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: 'All twelve' }, ...SQL_KINDS].map((k) => (
              <button
                key={k.id}
                onClick={() => setFilter(k.id as Filter)}
                aria-pressed={filter === k.id}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  filter === k.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {k.label}
                {k.id !== 'all' && (
                  <span className="ml-1.5 text-[10px] text-slate-500">
                    {SQL_EXERCISES.filter((e) => e.kind === k.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {filter !== 'all' && (
            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              {SQL_KINDS.find((k) => k.id === filter)!.blurb}
            </p>
          )}
        </div>

        <Schema />

        {shown.map((exercise) => (
          <Exercise key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
