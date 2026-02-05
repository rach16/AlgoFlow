import { useState } from 'react';
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
import { useProgressStore } from '../store/progressStore';

export function VisualizerPage() {
  const { currentAlgorithm, steps, currentStepIndex, language } = useVisualizerStore();
  const { solvedProblems, toggleSolved } = useProgressStore();
  const [showCode, setShowCode] = useState(false);

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
            NeetCode 150 • Algorithm Visualizer
          </p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const state = currentStep?.state as Record<string, unknown> | undefined;

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
  const bits = state?.bits as { value: number; bits?: number; label?: string } | undefined;
  const bits2 = state?.bits2 as { value: number; bits?: number; label?: string } | undefined;
  const count = state?.count as Record<string, number> | undefined;
  const queue = state?.queue as (string | number)[] | undefined;
  const result = state?.result;
  const dpLabels = state?.dpLabels as string[] | undefined;
  const dpHighlights = state?.dpHighlights as number[] | undefined;
  const dpSecondary = state?.dpSecondary as number[] | undefined;
  const matrixHighlights = state?.matrixHighlights as [number, number][] | undefined;
  const matrixSecondary = state?.matrixSecondary as [number, number][] | undefined;
  const graphHighlights = state?.graphHighlights as (number | string)[] | undefined;
  const graphSecondary = state?.graphSecondary as (number | string)[] | undefined;
  const graphVisitedEdges = state?.graphVisitedEdges as [number | string, number | string][] | undefined;
  const graphDirected = state?.graphDirected as boolean | undefined;
  const linkedListHighlights = state?.linkedListHighlights as number[] | undefined;
  const linkedListSecondary = state?.linkedListSecondary as number[] | undefined;
  const linkedListPointers = state?.linkedListPointers as Record<string, number> | undefined;
  const treeHighlights = state?.treeHighlights as number[] | undefined;
  const treeSecondary = state?.treeSecondary as number[] | undefined;
  const treePointers = state?.treePointers as Record<string, number> | undefined;
  const bitHighlights = state?.bitHighlights as number[] | undefined;
  const bitSecondary = state?.bitSecondary as number[] | undefined;
  const intervalHighlights = state?.intervalHighlights as number[] | undefined;
  const intervalSecondary = state?.intervalSecondary as number[] | undefined;

  return (
    <div className="flex flex-col lg:flex-row lg:flex-1 gap-4 p-4 lg:overflow-hidden">
      {/* Visualization Panel */}
      <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0">
        {/* Algorithm info bar — compact on mobile */}
        <div className="bg-slate-800 rounded-xl p-3 lg:p-4 flex flex-wrap gap-2 lg:gap-3 items-center text-sm">
          <span className="font-medium lg:hidden truncate max-w-[160px]">{currentAlgorithm.name}</span>
          <span className={`px-2 py-0.5 rounded font-medium ${
            currentAlgorithm.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
            currentAlgorithm.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>{currentAlgorithm.difficulty}</span>
          <span className="hidden sm:inline text-slate-400">Time: <span className="text-slate-200 font-mono">{currentAlgorithm.timeComplexity}</span></span>
          <span className="hidden sm:inline text-slate-400">Space: <span className="text-slate-200 font-mono">{currentAlgorithm.spaceComplexity}</span></span>
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
          <span className="text-slate-400">T: <span className="text-slate-300 font-mono">{currentAlgorithm.timeComplexity}</span></span>
          <span className="text-slate-400">S: <span className="text-slate-300 font-mono">{currentAlgorithm.spaceComplexity}</span></span>
          <span className="text-indigo-400">{currentAlgorithm.pattern}</span>
        </div>

        {/* Mobile code view */}
        {showCode && (
          <div className="lg:hidden h-[60vh]">
            <CodeBlock
              code={currentAlgorithm.code[language]}
              currentLine={currentStep?.codeLine}
            />
          </div>
        )}

        {/* Visualization area (hidden on mobile when showing code) */}
        <div className={`${showCode ? 'hidden' : ''} lg:block lg:flex-1 bg-slate-800 rounded-xl p-4 overflow-auto lg:min-h-0`}>
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
          {bits && (
            <BitView
              value={bits.value}
              bits={bits.bits}
              label={bits.label}
              highlights={bitHighlights}
              secondary={bitSecondary}
            />
          )}
          {bits2 && (
            <div className="mt-4">
              <BitView value={bits2.value} bits={bits2.bits} label={bits2.label} highlights={[]} title="Result" />
            </div>
          )}

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

      {/* Code Panel — desktop only (mobile uses toggle above) */}
      <div className="hidden lg:block lg:w-[400px]">
        <CodeBlock
          code={currentAlgorithm.code[language]}
          currentLine={currentStep?.codeLine}
        />
      </div>
    </div>
  );
}
