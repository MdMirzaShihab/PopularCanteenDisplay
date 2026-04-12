import { useMemo } from 'react';
import { format } from 'date-fns';
import { Hash, Clock, User, Timer, TrendingUp, Crown } from 'lucide-react';
import { calcDurations, calcDayStats } from '../../utils/tokenArchiveUtils';

const HourlyChart = ({ stats }) => {
  const { hourCounts, firstHour, lastHour } = stats;
  const maxCount = Math.max(...hourCounts);

  // Show only the active range of hours (with 1hr padding)
  const start = Math.max(0, firstHour - 1);
  const end = Math.min(23, lastHour + 1);
  const visibleHours = hourCounts.slice(start, end + 1).map((count, i) => ({
    hour: start + i,
    count,
  }));

  return (
    <div className="flex items-end gap-1 h-12">
      {visibleHours.map(({ hour, count }) => (
        <div key={hour} className="flex flex-col items-center gap-0.5 flex-1">
          <div
            className="w-full rounded-sm transition-all"
            style={{
              height: count > 0 ? `${Math.max(4, (count / maxCount) * 40)}px` : '2px',
              backgroundColor: hour === stats.peakHour
                ? 'rgb(143, 151, 121)'
                : count > 0
                  ? 'rgba(143, 151, 121, 0.35)'
                  : 'rgba(143, 151, 121, 0.1)',
            }}
            title={`${formatHourShort(hour)}: ${count} token${count !== 1 ? 's' : ''}`}
          />
          {hour % 3 === 0 && (
            <span className="text-[9px] text-text-300 leading-none">{formatHourShort(hour)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const formatHourShort = (hour) => {
  const h = hour % 12 || 12;
  return `${h}${hour >= 12 ? 'p' : 'a'}`;
};

const DayStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 py-3 mb-2 rounded-lg bg-bg-200/60">
      {/* Total */}
      <div className="flex items-center gap-1.5 text-sm">
        <Hash className="w-3.5 h-3.5 text-primary-100" />
        <span className="font-semibold text-text-100">{stats.total}</span>
        <span className="text-text-200">tokens</span>
      </div>

      {/* Peak hour */}
      <div className="flex items-center gap-1.5 text-sm">
        <TrendingUp className="w-3.5 h-3.5 text-primary-100" />
        <span className="text-text-200">Peak:</span>
        <span className="font-semibold text-text-100">{stats.peakHourLabel}</span>
        <span className="text-text-300">({stats.peakHourCount})</span>
      </div>

      {/* Top operator */}
      {stats.topOperator && (
        <div className="flex items-center gap-1.5 text-sm">
          <Crown className="w-3.5 h-3.5 text-primary-100" />
          <span className="font-semibold text-text-100">{stats.topOperator.name}</span>
          <span className="text-text-300">({stats.topOperator.count})</span>
        </div>
      )}

      {/* Hourly chart */}
      <div className="flex-1 min-w-[200px]">
        <HourlyChart stats={stats} />
      </div>
    </div>
  );
};

const TokenArchiveGroup = ({ label, entries }) => {
  const durations = useMemo(() => calcDurations(entries), [entries]);
  const stats = useMemo(() => calcDayStats(entries), [entries]);

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

      <DayStats stats={stats} />

      <div className="divide-y divide-bg-300">
        {entries.map((entry) => {
          const duration = durations.get(entry.updatedAt);
          return (
            <div
              key={entry.updatedAt}
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

              <div className="flex items-center gap-4">
                {/* Duration */}
                {duration && (
                  <div className="flex items-center gap-1.5 text-sm text-text-300">
                    <Timer className="w-3.5 h-3.5" />
                    <span>{duration}</span>
                  </div>
                )}

                {/* Operator name */}
                {(entry.calledByName || entry.calledBy) && (
                  <div className="flex items-center gap-1.5 text-sm text-text-200">
                    <User className="w-3.5 h-3.5" />
                    <span>{entry.calledByName || entry.calledBy}</span>
                  </div>
                )}

                {/* Time */}
                <div
                  className="flex items-center gap-1.5 text-sm text-text-200"
                  title={format(new Date(entry.updatedAt), 'PPpp')}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(entry.updatedAt), 'hh:mm a')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenArchiveGroup;
