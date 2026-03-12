import { Highlight, themes } from 'prism-react-renderer';

interface AnimationCodeBlockProps {
  code: string;
  activeLine: number;
}

export default function AnimationCodeBlock({ code, activeLine }: AnimationCodeBlockProps) {
  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language="python">
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className="text-xs font-mono leading-relaxed overflow-auto">
          {tokens.map((line, i) => {
            const lineNum = i + 1;
            const isActive = lineNum === activeLine;
            return (
              <div
                key={i}
                {...getLineProps({ line })}
                className={`px-3 py-0.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-green-400/10 border-l-2 border-green-400'
                    : 'border-l-2 border-transparent'
                }`}
              >
                <span className={`inline-block w-6 mr-3 text-right select-none ${isActive ? 'text-green-400' : 'text-gray-600'}`}>
                  {lineNum}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}
