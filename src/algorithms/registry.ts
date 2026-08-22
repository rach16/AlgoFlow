import type { Algorithm } from '../types/algorithm';
import { metaCategories } from './manifest';
import type { AlgorithmMeta } from './manifestTypes';

/**
 * Lazy access to algorithm implementations.
 *
 * `metaCategories` (19 KB gzipped) is eager, because the sidebar, search, patterns and topics
 * all need every problem's metadata immediately. The implementations — three languages of
 * source, the step generator, the line explanations — are ~3.2 MB in total and only ever needed
 * one at a time, so they are fetched on selection.
 *
 * Vite turns this glob into one chunk per module and gives us the dynamic importers.
 */
const loaders = import.meta.glob<Record<string, unknown>>('./*/*.ts');

/** Resolved implementations, so revisiting a problem is instant. */
const cache = new Map<string, Algorithm>();

export const metaById = new Map<string, AlgorithmMeta>(
  metaCategories.flatMap((c) => c.algorithms.map((a) => [a.id, a] as const))
);

export const allMeta = (): AlgorithmMeta[] => metaCategories.flatMap((c) => c.algorithms);

/** True when the implementation is already in memory, so callers can skip a loading state. */
export const isLoaded = (id: string): boolean => cache.has(id);

export const getLoaded = (id: string): Algorithm | undefined => cache.get(id);

/**
 * Load one algorithm's implementation. Resolves from cache when possible.
 * Throws if the id is unknown or the module does not export a matching Algorithm — both of
 * which the manifest test makes impossible in practice, but a bad dynamic id would hit.
 */
export async function loadAlgorithm(id: string): Promise<Algorithm> {
  const cached = cache.get(id);
  if (cached) return cached;

  const meta = metaById.get(id);
  if (!meta) throw new Error(`Unknown algorithm id: ${id}`);

  // import.meta.glob keys are relative to this file, matching the manifest's `module` field.
  const loader = loaders[`${meta.module}.ts`];
  if (!loader) throw new Error(`No module registered at ${meta.module} for ${id}`);

  const mod = await loader();
  const found = Object.values(mod).find(
    (v): v is Algorithm =>
      !!v && typeof v === 'object' && (v as Algorithm).id === id && typeof (v as Algorithm).run === 'function'
  );
  if (!found) throw new Error(`${meta.module} does not export an Algorithm with id ${id}`);

  cache.set(id, found);
  return found;
}
