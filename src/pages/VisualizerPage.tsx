import { useState, useRef, useEffect, useCallback } from 'react';
import { useVisualizerStore } from '../store/visualizerStore';
import { ArrayBar } from '../components/visualizer/ArrayBar';
import { HashMapView } from '../components/visualizer/HashMapView';
import { StackView } from '../components/visualizer/StackView';
import { LinkedListView } from '../components/visualizer/LinkedListView';
import { TreeView } from '../components/visualizer/TreeView';
import { GraphView } from '../components/visualizer/GraphView';
import { MatrixView } from '../components/visualizer/MatrixView';
import { DPTableView } from '../components/visualizer/DPTableView';
import { IntervalView } from '../components/visualizer/IntervalView';
import { BitView } from '../components/visualizer/BitView';
import { Controls } from '../components/visualizer/Controls';
import { CodeBlock } from '../components/common/CodeBlock';
import { DataStructureInfoPanel } from '../components/visualizer/data-structure-info/DataStructureInfoPanel';
import { detectDataStructures } from '../utils/detectDataStructures';
import { getActiveApproach } from '../utils/approaches';
import { COMPLEXITY_NOTES, noteKey } from '../data/complexity';
import { DerivationBody } from '../components/common/DerivationBody';
import { useProgressStore } from '../store/progressStore';
import { CONFIDENCE_META, dueLabel } from '../utils/review';
import { useNow } from '../utils/useNow';

export function VisualizerPage() {
  const { currentAlgorithm, steps, currentStepIndex, approachId } = useVisualizerStore();
  const { solvedProblems, toggleSolved, reviews, rateProblem } = useProgressStore();
  const [showCode, setShowCode] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const now = useNow();
  const [codePanelWidth, setCodePanelWidth] = useState(400);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerRight = containerRef.current.getBoundingClientRect().right;
      const newWidth = Math.min(700, Math.max(300, containerRight - e.clientX));
      setCodePanelWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  if (!currentAlgorithm) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to AlgoFlow</h2>
          <p className="text-slate-400 mb-4">
            Select an algorithm from the sidebar to start visualizing
          </p>
          <p className="text-sm text-slate-500">
            NeetCode 250 • Algorithm Visualizer
          </p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const state = currentStep?.state as Record<string, unknown> | undefined;
  const activeApproach = getActiveApproach(currentAlgorithm, approachId);
  const complexityNote = COMPLEXITY_NOTES[noteKey(currentAlgorithm.id, activeApproach.id)];
  const reviewRecord = reviews[currentAlgorithm.id];

  const nums = state?.nums as number[] | undefined;
  const chars = state?.chars as string[] | undefined;
  const hashMap = state?.hashMap as Record<string, number> | undefined;
  const seen = state?.seen as number[] | undefined;
  const stack = state?.stack as string[] | undefined;
  const sCount = state?.sCount as Record<string, number> | undefined;
  const tCount = state?.tCount as Record<string, number> | undefined;
  const linkedList = state?.linkedList as { val: number | string; id: number }[] | undefined;
  const linkedList2 = state?.linkedList2 as { val: number | string; id: number }[] | undefined;
  const tree = state?.tree as { val: number | string | null; id: number }[] | undefined;
  const tree2 = state?.tree2 as { val: number | string | null; id: number }[] | undefined;
  const graph = state?.graph as { nodes: { id: number | string; label: string }[]; edges: { from: number | string; to: number | string; weight?: number }[] } | undefined;
  const matrix = state?.matrix as (number | string)[][] | undefined;
  const dp = state?.dp as (number | string | null)[] | undefined;
  const dp2d = state?.dp2d as (number | string)[][] | undefined;
  const intervals = state?.intervals as [number, number][] | undefined;
  const resultIntervals = state?.resultIntervals as [number, number][] | undefined;
  // Bit-manipulation algorithms emit `bits` as an array of rows ({value, bits: binary
  // string, label}); a few emit a single row object. Normalize to a row list, and read the
  // bit width off the binary string when present. In the array form `bitHighlights` selects
  // which ROW is emphasized rather than which bit position.
  type BitRow = { value: number; bits?: number | string; label?: string };
  const toBitRows = (raw: unknown): BitRow[] =>
    Array.isArray(raw) ? (raw as BitRow[]) : raw ? [raw as BitRow] : [];
  const bitWidth = (row: BitRow): number =>
    typeof row.bits === 'string' ? row.bits.length : (row.bits ?? 8);

  const bitRows = toBitRows(state?.bits);
  const bitRows2 = toBitRows(state?.bits2);
  const bitsIsRowList = Array.isArray(state?.bits);
  const count = state?.count as Record<string, number> | undefined;
  const queue = state?.queue as (string | number)[] | undefined;
  const result = state?.result;
  const dpLabels = state?.dpLabels as string[] | undefined;
  const dpHighlights = state?.dpHighlights as number[] | undefined;
  const dpSecondary = state?.dpSecondary as number[] | undefined;
  // View-specific highlight keys belong in `state`, but a number of algorithms emit them
  // at the step level instead. Accept either so those highlights aren't silently dropped.
  const stepExtras = currentStep as unknown as Record<string, unknown> | undefined;
  const viewKey = <T,>(key: string): T | undefined =>
    (state?.[key] ?? stepExtras?.[key]) as T | undefined;

  const matrixHighlights = viewKey<[number, number][]>('matrixHighlights');
  const matrixSecondary = viewKey<[number, number][]>('matrixSecondary');
  const graphHighlights = viewKey<(number | string)[]>('graphHighlights');
  const graphSecondary = viewKey<(number | string)[]>('graphSecondary');
  const graphVisitedEdges = viewKey<[number | string, number | string][]>('graphVisitedEdges');
  const graphDirected = viewKey<boolean>('graphDirected');
  const linkedListHighlights = viewKey<number[]>('linkedListHighlights');
  const linkedListSecondary = viewKey<number[]>('linkedListSecondary');
  const linkedListPointers = viewKey<Record<string, number>>('linkedListPointers');
  const treeHighlights = viewKey<number[]>('treeHighlights');
  const treeSecondary = viewKey<number[]>('treeSecondary');
  const treePointers = viewKey<Record<string, number>>('treePointers');
  const bitHighlights = viewKey<number[]>('bitHighlights');
  const bitSecondary = viewKey<number[]>('bitSecondary');
  const intervalHighlights = viewKey<number[]>('intervalHighlights');
  const intervalSecondary = viewKey<number[]>('intervalSecondary');

  const activeDataStructures = detectDataStructures(state, currentAlgorithm.category);

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row lg:h-full gap-4 lg:gap-0 p-4 lg:overflow-hidden">
      {/* Visualization Panel */}
      <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0 lg:overflow-hidden lg:mr-1">
        {/* Algorithm info bar — compact on mobile */}
        <div className="bg-slate-800 rounded-xl p-3 lg:p-4 flex flex-wrap gap-2 lg:gap-3 items-center text-sm">
          <span className="font-medium lg:hidden truncate max-w-[160px]">{currentAlgorithm.name}</span>
          <span className={`px-2 py-0.5 rounded font-medium ${
            currentAlgorithm.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
            currentAlgorithm.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>{currentAlgorithm.difficulty}</span>
          <span className="hidden sm:inline text-slate-400">Time: <span className="text-slate-200 font-mono">{activeApproach.timeComplexity}</span></span>
          <span className="hidden sm:inline text-slate-400">Space: <span className="text-slate-200 font-mono">{activeApproach.spaceComplexity}</span></span>
          {complexityNote && (
            <button
              onClick={() => setShowWhy(!showWhy)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                showWhy ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="How these bounds are derived"
            >
              {showWhy ? 'Hide why' : 'Why?'}
            </button>
          )}
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-indigo-400 font-medium">{currentAlgorithm.pattern}</span>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {/* Code toggle (mobile only) */}
            <button
              onClick={() => setShowCode(!showCode)}
              className={`lg:hidden px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                showCode
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {showCode ? 'Viz' : 'Code'}
            </button>
            <button
              onClick={() => window.open(`/animate/${currentAlgorithm.id}`, '_blank')}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
            >
              Animate
            </button>
            <button
              onClick={() => toggleSolved(currentAlgorithm.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                solvedProblems.includes(currentAlgorithm.id)
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
              }`}
            >
              {solvedProblems.includes(currentAlgorithm.id) ? '✓ Solved' : 'Mark Solved'}
            </button>
          </div>
        </div>

        {/* Mobile: pattern + complexity row */}
        <div className="sm:hidden bg-slate-800/50 rounded-lg px-3 py-2 text-xs flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-slate-400">T: <span className="text-slate-300 font-mono">{activeApproach.timeComplexity}</span></span>
          <span className="text-slate-400">S: <span className="text-slate-300 font-mono">{activeApproach.spaceComplexity}</span></span>
          <span className="text-indigo-400">{currentAlgorithm.pattern}</span>
        </div>
        {/* Spaced-repetition rating — the study loop, so it stays visible rather than hidden
            behind a toggle. Rating also marks the problem solved, except "Again". */}
        <div className="bg-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">
            {reviewRecord ? 'Rate again — currently ' : 'How did that go?'}
            {reviewRecord && (
              <span className="text-slate-200">{dueLabel(reviewRecord, now)}</span>
            )}
          </span>
          {CONFIDENCE_META.map((c) => (
            <button
              key={c.id}
              onClick={() => rateProblem(currentAlgorithm.id, c.id)}
              title={c.hint}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${c.accent}`}
            >
              {c.label}
            </button>
          ))}
          {reviewRecord && (
            <span className="text-[10px] text-slate-500 ml-auto">
              box {reviewRecord.streak} · {reviewRecord.reviews} review
              {reviewRecord.reviews === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* Derivation for the selected approach */}
        {showWhy && complexityNote && (
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-200">
                Why {activeApproach.timeComplexity} time and {activeApproach.spaceComplexity} space?
              </h3>
              <span className="text-xs text-slate-500">{activeApproach.name}</span>
            </div>
            <DerivationBody note={complexityNote} />
          </div>
        )}

        {/* Mobile code view */}
        {showCode && (
          <div className="lg:hidden h-[60vh]">
            <CodeBlock />
          </div>
        )}

        {/* Visualization area (hidden on mobile when showing code) */}
        <div className={`${showCode ? 'hidden' : ''} lg:block lg:flex-1 bg-slate-800 rounded-xl p-4 overflow-y-auto lg:min-h-0`}>
          <h3 className="text-sm font-medium text-slate-400 mb-4">Visualization</h3>

          {/* Array visualization */}
          {nums && Array.isArray(nums) && (
            <ArrayBar
              values={nums}
              highlights={currentStep?.highlights || []}
              secondary={currentStep?.secondary}
              pointers={currentStep?.pointers}
            />
          )}

          {/* Character array */}
          {chars && Array.isArray(chars) && (
            <div className="flex justify-center gap-1 mb-4 flex-wrap">
              {chars.map((char, idx) => (
                <div
                  key={idx}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-lg font-mono text-lg
                    transition-all duration-300
                    ${currentStep?.highlights?.includes(idx) ? 'bg-indigo-500 scale-110' : ''}
                    ${currentStep?.secondary?.includes(idx) ? 'bg-green-500' : ''}
                    ${!currentStep?.highlights?.includes(idx) && !currentStep?.secondary?.includes(idx) ? 'bg-slate-700' : ''}
                  `}
                >
                  {char}
                </div>
              ))}
            </div>
          )}

          {/* Linked List */}
          {linkedList && Array.isArray(linkedList) && (
            <LinkedListView
              nodes={linkedList}
              highlights={linkedListHighlights || currentStep?.highlights}
              secondary={linkedListSecondary || currentStep?.secondary}
              pointers={linkedListPointers || currentStep?.pointers}
            />
          )}
          {linkedList2 && Array.isArray(linkedList2) && (
            <div className="mt-4">
              <LinkedListView nodes={linkedList2} highlights={[]} title="List 2" />
            </div>
          )}

          {/* Tree */}
          {tree && Array.isArray(tree) && (
            <TreeView
              nodes={tree}
              highlights={treeHighlights || currentStep?.highlights}
              secondary={treeSecondary || currentStep?.secondary}
              pointers={treePointers || currentStep?.pointers}
            />
          )}
          {tree2 && Array.isArray(tree2) && (
            <div className="mt-4">
              <TreeView nodes={tree2} highlights={[]} title="Tree 2" />
            </div>
          )}

          {/* Graph */}
          {graph && (
            <GraphView
              nodes={graph.nodes}
              edges={graph.edges}
              highlights={graphHighlights}
              secondary={graphSecondary}
              visitedEdges={graphVisitedEdges}
              directed={graphDirected}
            />
          )}

          {/* Matrix */}
          {matrix && Array.isArray(matrix) && (
            <MatrixView
              matrix={matrix}
              highlights={matrixHighlights}
              secondary={matrixSecondary}
            />
          )}

          {/* DP table 1D */}
          {dp && Array.isArray(dp) && (
            <DPTableView
              dp={dp}
              labels={dpLabels}
              highlights={dpHighlights}
              secondary={dpSecondary}
            />
          )}

          {/* DP table 2D */}
          {dp2d && Array.isArray(dp2d) && (
            <MatrixView
              matrix={dp2d}
              highlights={matrixHighlights}
              secondary={matrixSecondary}
              title="DP Table"
            />
          )}

          {/* Intervals */}
          {intervals && Array.isArray(intervals) && (
            <IntervalView
              intervals={intervals}
              highlights={intervalHighlights}
              secondary={intervalSecondary}
              result={resultIntervals}
            />
          )}

          {/* Bits */}
          {bitRows.map((row, i) => (
            <div
              key={`bitrow-${i}`}
              className={`${i > 0 ? 'mt-2' : ''} ${
                bitsIsRowList && bitHighlights?.includes(i)
                  ? 'ring-2 ring-indigo-400 rounded-lg'
                  : ''
              }`}
            >
              <BitView
                value={row.value}
                bits={bitWidth(row)}
                label={row.label}
                highlights={bitsIsRowList ? [] : bitHighlights}
                secondary={bitsIsRowList ? [] : bitSecondary}
                title={i === 0 ? 'Bits' : ''}
              />
            </div>
          ))}
          {bitRows2.map((row, i) => (
            <div key={`bitrow2-${i}`} className="mt-4">
              <BitView
                value={row.value}
                bits={bitWidth(row)}
                label={row.label}
                highlights={[]}
                title={i === 0 ? 'Result' : ''}
              />
            </div>
          ))}

          {/* Data structures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {hashMap && typeof hashMap === 'object' && (
              <HashMapView hashMap={hashMap} />
            )}
            {seen && Array.isArray(seen) && (
              <HashMapView
                hashMap={seen.reduce<Record<string, string>>((acc, v) => ({ ...acc, [String(v)]: '✓' }), {})}
                title="Seen Set"
              />
            )}
            {stack && Array.isArray(stack) && (
              <StackView stack={stack} />
            )}
            {queue && Array.isArray(queue) && (
              <StackView stack={[...queue]} title="Queue" />
            )}
            {sCount && typeof sCount === 'object' && (
              <HashMapView hashMap={sCount} title="Count (s)" />
            )}
            {tCount && typeof tCount === 'object' && (
              <HashMapView hashMap={tCount} title="Count (t)" />
            )}
            {count && typeof count === 'object' && (
              <HashMapView hashMap={count} title="Count" />
            )}
          </div>

          {/* Data Structure Reference Panels */}
          <DataStructureInfoPanel activeTypes={activeDataStructures} />

          {/* Result */}
          {result !== undefined && result !== null && typeof state?.result !== 'undefined' && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <span className="text-green-400 text-sm font-medium">Result: </span>
              <span className="text-green-300 font-mono">
                {typeof result === 'object' ? JSON.stringify(result) : String(result)}
              </span>
            </div>
          )}

          {/* Step message */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-200">{currentStep?.message}</p>
          </div>
        </div>

        <Controls />
      </div>

      {/* Drag Handle — desktop only */}
      <div
        onMouseDown={onMouseDown}
        className="hidden lg:flex items-center justify-center cursor-col-resize group self-stretch -mx-1 z-10"
        style={{ width: 12 }}
      >
        <div className="w-[2px] h-full bg-slate-600 group-hover:w-1 group-hover:bg-indigo-400 group-active:bg-indigo-400 transition-all rounded-full" />
      </div>

      {/* Code Panel — desktop only (mobile uses toggle above) */}
      <div className="hidden lg:block flex-shrink-0 lg:ml-1" style={{ width: codePanelWidth }}>
        <CodeBlock />
      </div>
    </div>
  );
}
