import { useState } from 'react';
import { ReviewControl } from '../components/common/ReviewControl';
import { LEADERSHIP_PRINCIPLES, STORIES_PER_PRINCIPLE } from '../data/leadershipPrinciples';
import { useStoryStore } from '../store/storyStore';
import {
  STAR_FIELDS,
  coverageFor,
  isComplete,
  summariseCoverage,
  type Story,
} from '../utils/stories';


/**
 * MUST stay at module scope.
 *
 * Defined inside BehavioralPage, this got a new function identity on every render — and since the
 * page re-renders on every keystroke, React saw a new component type each time and remounted the
 * whole editor, throwing away focus, cursor position and anything typed since the last commit. It
 * reads the stores directly rather than taking a dozen props.
 */
function StoryEditor({ story, onDeleted }: { story: Story; onDeleted: () => void }) {
  const { updateStory, togglePrinciple, removeStory } = useStoryStore();

  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
      <input
        value={story.title}
        onChange={(e) => updateStory(story.id, { title: e.target.value })}
        placeholder="Name this story so you can find it — “the flaky checkout test”"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-500/60"
      />

      {STAR_FIELDS.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`${story.id}-${field.key}`}
            className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
          >
            {field.label}
          </label>
          <p className="text-xs text-slate-500 mb-1.5">{field.hint}</p>
          <textarea
            id={`${story.id}-${field.key}`}
            value={story[field.key]}
            onChange={(e) => updateStory(story.id, { [field.key]: e.target.value })}
            rows={field.key === 'action' ? 5 : 3}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      ))}

      {/* One story usually serves several principles — that overlap is the point. */}
      <div>
        <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Also answers
        </span>
        <div className="flex flex-wrap gap-1">
          {LEADERSHIP_PRINCIPLES.map((p) => {
            const on = story.principles.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePrinciple(story.id, p.id)}
                aria-pressed={on}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                  on
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-700/40 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating a story schedules it, so you practise retelling it rather than re-reading it. */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700">
        <ReviewControl
          kind="story"
          itemId={story.id}
          prompt="Retell it out loud, then rate:"
          disabled={!isComplete(story)}
          disabledHint="Fill in every part of the story before scheduling it"
        />
        <button
          onClick={() => {
            removeStory(story.id);
            onDeleted();
          }}
          className="ml-auto text-xs text-slate-500 hover:text-red-300"
        >
          Delete story
        </button>
      </div>
    </div>
  );
}

export function BehavioralPage() {
  const { stories, addStory } = useStoryStore();

  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const [openPrincipleId, setOpenPrincipleId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);

  const coverage = coverageFor(stories);
  const summary = summariseCoverage(stories);

  const createFor = (principleId: string) => {
    const id = addStory([principleId]);
    setOpenStoryId(id);
    setOpenPrincipleId(principleId);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Why */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-1">Behavioral — Amazon Leadership Principles</h2>
          <p className="text-sm text-slate-400 mb-4">
            Amazon does not run one behavioral round. Leadership Principles are scored in{' '}
            <span className="text-slate-200">every</span> round, each interviewer owns two or three
            of them, and one is a Bar Raiser from another org whose job is to press hardest on
            exactly this. Reported preparation is {STORIES_PER_PRINCIPLE}–3 stories per principle.
          </p>

          <div className="flex flex-wrap gap-2 text-xs mb-4">
            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-medium">
              {summary.coreMet} / {summary.coreTotal} core principles covered
            </span>
            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
              {summary.allMet} / {summary.allTotal} overall
            </span>
            <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">
              {summary.storiesComplete} of {summary.storiesWritten} stories finished
            </span>
          </div>

          <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 leading-relaxed">
            <p className="mb-2">
              <span className="text-slate-200 font-medium">Write yours before reading mine.</span>{' '}
              The seven most-reported principles carry a worked example, and it is collapsed on
              purpose — an example you read first gets adapted; an example you read after writing
              gets used to calibrate. A recited story is both detectable and worse than a rough
              true one.
            </p>
            <p>
              One story usually serves three or four principles. Tag it against all of them and the
              twenty-one-story target turns into something closer to eight real ones.
            </p>
          </div>
        </div>

        {/* Principles */}
        {coverage.map(({ principle, stories: attached, ready, met }) => {
          const open = openPrincipleId === principle.id;
          return (
            <div key={principle.id} className="bg-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenPrincipleId(open ? null : principle.id)}
                aria-expanded={open}
                className="w-full text-left px-5 py-4 hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{principle.name}</span>
                  {principle.core && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider">
                      Core
                    </span>
                  )}
                  <span
                    className={`ml-auto text-xs font-mono ${
                      met ? 'text-green-400' : ready > 0 ? 'text-yellow-400' : 'text-slate-500'
                    }`}
                  >
                    {ready} / {STORIES_PER_PRINCIPLE}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 mt-1">{principle.probing}</p>
              </button>

              {open && (
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-slate-700 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Prompts for your story
                      </span>
                      <ul className="flex flex-col gap-1.5">
                        {principle.prompts.map((prompt) => (
                          <li key={prompt} className="text-xs text-slate-300 flex gap-2">
                            <span className="text-slate-600">·</span>
                            <span>{prompt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        What sinks this one
                      </span>
                      <ul className="flex flex-col gap-1.5">
                        {principle.antiPatterns.map((anti) => (
                          <li key={anti} className="text-xs text-red-200/70 flex gap-2">
                            <span className="text-red-400/60">×</span>
                            <span>{anti}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Your stories */}
                  <div className="flex flex-col gap-2">
                    {attached.map((story) => (
                      <div key={story.id}>
                        <button
                          onClick={() =>
                            setOpenStoryId(openStoryId === story.id ? null : story.id)
                          }
                          aria-expanded={openStoryId === story.id}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 transition-colors text-left text-sm"
                        >
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isComplete(story) ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                          />
                          <span className="flex-1 truncate">
                            {story.title.trim() || 'Untitled story'}
                          </span>
                          <span className="text-xs text-slate-500 flex-shrink-0">
                            {story.principles.length} principle
                            {story.principles.length === 1 ? '' : 's'}
                          </span>
                        </button>
                        {openStoryId === story.id && (
                          <div className="mt-2">
                            <StoryEditor
                              story={story}
                              onDeleted={() => setOpenStoryId(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => createFor(principle.id)}
                      className="self-start px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors"
                    >
                      + Write a story for this
                    </button>
                  </div>

                  {/* Worked example, collapsed */}
                  {principle.example ? (
                    <div className="border-t border-slate-700 pt-3">
                      <button
                        onClick={() =>
                          setRevealed((prev) =>
                            prev.includes(principle.id)
                              ? prev.filter((p) => p !== principle.id)
                              : [...prev, principle.id]
                          )
                        }
                        aria-expanded={revealed.includes(principle.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        {revealed.includes(principle.id)
                          ? 'Hide the worked example'
                          : 'See a worked example — after you have written yours'}
                      </button>
                      {revealed.includes(principle.id) && (
                        <div className="mt-3 flex flex-col gap-2">
                          {STAR_FIELDS.map((field) => (
                            <div key={field.key}>
                              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                {field.label}
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {principle.example?.[field.key]}
                              </p>
                            </div>
                          ))}
                          <p className="text-[11px] text-slate-500 mt-1">
                            Somebody else&apos;s story. Notice the specificity — named tools, real
                            numbers, an explicit trade-off — and match that level, not the content.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 border-t border-slate-700 pt-3">
                      No worked example for this one. It is reported less often than the seven
                      marked core, so the prompts above are the useful part.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Where to start */}
        {summary.uncovered.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-1">Where to start</h3>
            <p className="text-sm text-slate-400 mb-3">
              {summary.uncovered.length} principle
              {summary.uncovered.length === 1 ? ' has' : 's have'} nothing attached. Core ones
              first — they come up in every round.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...summary.uncovered]
                .sort((a, b) => Number(b.core) - Number(a.core))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setOpenPrincipleId(p.id);
                      setOpenStoryId(null);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      p.core
                        ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
