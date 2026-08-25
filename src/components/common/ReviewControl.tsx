import { useProgressStore } from '../../store/progressStore';
import { CONFIDENCE_META, dueLabel } from '../../utils/review';
import { reviewId, type ReviewKindId } from '../../utils/reviewKinds';
import { useNow } from '../../utils/useNow';

/**
 * The "schedule this to come back" control, in one place.
 *
 * It existed twice already — once in TestDesignPage and once in BehavioralPage — as the same four
 * buttons with the same accents and the same after-rating label. Five more copies was not the way
 * to put the newer sections into the queue.
 *
 * The buttons deliberately stay visible after a rating rather than collapsing into the due date.
 * You re-attempt these, and a re-attempt that cannot be re-rated leaves the schedule stuck on how
 * the first one went.
 */
export function ReviewControl({
  kind,
  itemId,
  /** Shown before the first rating. After that the due date replaces it. */
  prompt = 'Schedule a re-run:',
  className = '',
  /** Behavioral stories cannot be scheduled until every STAR part is filled in. */
  disabled = false,
  disabledHint,
}: {
  kind: ReviewKindId;
  itemId: string;
  prompt?: string;
  className?: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const { reviews, rateOther } = useProgressStore();
  const now = useNow();
  const id = reviewId(kind, itemId);
  const record = reviews[id];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-xs ${className}`}>
      <span className={record ? 'text-slate-400' : 'text-slate-500'}>
        {record ? dueLabel(record, now) : prompt}
      </span>
      {CONFIDENCE_META.map((c) => (
        <button
          key={c.id}
          onClick={() => rateOther(id, c.id)}
          disabled={disabled}
          title={disabled ? (disabledHint ?? c.hint) : c.hint}
          aria-label={`${c.label} — ${c.hint}`}
          className={`px-2 py-0.5 rounded font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${c.accent}`}
        >
          {c.label}
        </button>
      ))}
      {record && (
        <span className="text-slate-600">
          box {record.streak} · {record.reviews} review{record.reviews === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}
