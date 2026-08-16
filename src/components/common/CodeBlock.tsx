import { Highlight, themes } from 'prism-react-renderer';
import { useVisualizerStore } from '../../store/visualizerStore';
import { getApproaches, getActiveApproach } from '../../utils/approaches';

const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
] as const;

export function CodeBlock() {
  const { currentAlgorithm, steps, currentStepIndex, language, setLanguage, approachId, setApproachId } =
    useVisualizerStore();

  if (!currentAlgorithm) return null;

  const approaches = getApproaches(currentAlgorithm);
  const approach = getActiveApproach(currentAlgorithm, approachId);
  const code = approach.code[language];
  const lineExplanations = approach.lineExplanations?.[language];
  const currentLine = steps[currentStepIndex]?.codeLine;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Approach tabs (only when there are multiple solutions) */}
      {approaches.length > 1 && (
        <div className="flex flex-wrap gap-1 px-2 pt-2 border-b border-slate-700 bg-slate-900/40">
          {approaches.map((a) => (
            <button
              key={a.id}
              onClick={() => setApproachId(a.id)}
              title={`${a.timeComplexity} time · ${a.spaceComplexity} space`}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                approach.id === a.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-b-0 border-indigo-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* Language tabs */}
      <div className="flex border-b border-slate-700">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              language === lang.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Approach description */}
      {approach.description && (
        <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700/60 bg-slate-900/30">
          {approach.description}
        </div>
      )}

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="p-4 text-sm font-mono">
              {tokens.flatMap((line, i) => {
                const lineNumber = i + 1;
                const isCurrentLine = lineNumber === currentLine;
                const explanation = lineExplanations?.[lineNumber];

                const elements = [
                  <div
                    key={`line-${i}`}
                    {...getLineProps({ line })}
                    className={`flex transition-colors ${
                      isCurrentLine ? 'bg-indigo-500/30 -mx-4 px-4' : ''
                    }`}
                  >
                    <span
                      className={`w-8 text-right mr-4 select-none ${
                        isCurrentLine ? 'text-indigo-300' : 'text-slate-600'
                      }`}
                    >
                      {lineNumber}
                    </span>
                    <span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>,
                ];

                if (explanation) {
                  elements.push(
                    <div
                      key={`exp-${i}`}
                      className="text-slate-500 text-[11px] italic pl-12 py-0.5"
                    >
                      ↳ {explanation}
                    </div>
                  );
                }

                return elements;
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
