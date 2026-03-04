import { HashMapDiagram } from './diagrams/HashMapDiagram';
import { HashSetDiagram } from './diagrams/HashSetDiagram';
import { StackDiagram } from './diagrams/StackDiagram';
import { QueueDiagram } from './diagrams/QueueDiagram';
import { LinkedListDiagram } from './diagrams/LinkedListDiagram';
import { BinaryTreeDiagram } from './diagrams/BinaryTreeDiagram';
import { GraphDiagram } from './diagrams/GraphDiagram';
import { HeapDiagram } from './diagrams/HeapDiagram';
import { TrieDiagram } from './diagrams/TrieDiagram';

const diagramMap: Record<string, React.FC> = {
  hashmap: HashMapDiagram,
  hashset: HashSetDiagram,
  stack: StackDiagram,
  queue: QueueDiagram,
  linkedlist: LinkedListDiagram,
  binarytree: BinaryTreeDiagram,
  graph: GraphDiagram,
  heap: HeapDiagram,
  trie: TrieDiagram,
};

interface DataStructureDiagramProps {
  type: string;
}

export function DataStructureDiagram({ type }: DataStructureDiagramProps) {
  const Diagram = diagramMap[type];
  if (!Diagram) return null;
  return (
    <div className="flex justify-center py-2">
      <Diagram />
    </div>
  );
}
