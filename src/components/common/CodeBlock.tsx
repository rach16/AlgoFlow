import { Highlight, themes } from 'prism-react-renderer';
import { useVisualizerStore } from '../../store/visualizerStore';

interface CodeBlockProps {
  code: string;
  currentLine?: number;
  lineExplanations?: Record<number, string>;
}

export function CodeBlock({ code, currentLine, lineExplanations }: CodeBlockProps) {
  const { language, setLanguage } = useVisualizerStore();

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Language tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setLanguage('python')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            language === 'python'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Python
        </button>
        <button
          onClick={() => setLanguage('javascript')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            language === 'javascript'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          JavaScript
        </button>
        <button
          onClick={() => setLanguage('java')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            language === 'java'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Java
        </button>
      </div>

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
