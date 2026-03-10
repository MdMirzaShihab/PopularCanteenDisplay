import { format } from 'date-fns';
import { Hash, Clock } from 'lucide-react';

const TokenArchiveGroup = ({ label, entries }) => {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-100 py-2 px-1 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-200">
          {label}
        </span>
        <span className="ml-2 text-xs text-text-300">
          ({entries.length} token{entries.length !== 1 ? 's' : ''})
        </span>
      </div>

      <div className="divide-y divide-bg-300">
        {entries.map((entry) => (
          <div
            key={entry.id ?? entry.recordedAt}
            className="flex items-center justify-between py-3 px-2 hover:bg-bg-200/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100/15 flex items-center justify-center">
                <Hash className="w-4 h-4 text-primary-100" />
              </div>
              <span className="text-lg font-bold text-text-100 font-heading tracking-wide">
                {entry.number}
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 text-sm text-text-200"
              title={format(new Date(entry.recordedAt), 'PPpp')}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(entry.recordedAt), 'HH:mm')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenArchiveGroup;
