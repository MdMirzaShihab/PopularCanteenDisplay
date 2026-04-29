import { useEffect, useRef, useState } from 'react';
import { useTokens } from '../hooks/useTokens';
import { useNotification } from '../context/NotificationContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Hash, Trash2, Clock, User, Volume2, ArrowRight } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TokenArchiveSection from '../components/token/TokenArchiveSection';
import KeyboardHintsBar from '../components/token/KeyboardHintsBar';

// Cap at 15 digits so Number() conversion stays inside MAX_SAFE_INTEGER.
const isNumericToken = (value) =>
  typeof value === 'string' && value.length > 0 && value.length <= 15 && /^\d+$/.test(value);

const computeNextNumber = (current) => {
  const next = Number(current) + 1;
  // Preserve zero-padding width if the source token had leading zeros
  // (e.g. "007" → "008", not "8"). Single-zero "0" is treated as plain.
  if (current.length > 1 && current.startsWith('0')) {
    return String(next).padStart(current.length, '0');
  }
  return String(next);
};

const TokenManagementPage = () => {
  const { currentToken, tokenHistory, updateToken, clearToken, reannounceToken, archiveEntries } = useTokens();
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef(null);
  const notification = useNotification();

  const isDuplicate = currentToken && inputValue.trim() === currentToken.number;
  const canCallNext = !submitting && !!currentToken && isNumericToken(currentToken.number);
  const nextNumber = canCallNext ? computeNextNumber(currentToken.number) : null;

  // Auto-focus the input on mount so the operator can type immediately.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const callToken = async (value) => {
    if (submitting) return;
    const trimmed = value.trim();
    if (trimmed === '') return;
    if (currentToken && trimmed === currentToken.number) return;
    // Clear the input synchronously so any keystrokes the operator continues
    // to type during the API round-trip start a fresh number, not append to
    // the just-submitted one (e.g. typing "112" then "123" must call two
    // separate tokens, not one combined "112123").
    setInputValue('');
    setSubmitting(true);
    try {
      await updateToken(trimmed);
    } catch {
      // useTokens hook handles error notification internally — restore the
      // value so the operator can retry without re-typing.
      setInputValue(trimmed);
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDuplicate) return;
    callToken(inputValue);
  };

  const handleCallNext = () => {
    if (!canCallNext || !nextNumber) return;
    callToken(nextNumber);
  };

  const handleClear = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await clearToken();
      setInputValue('');
    } catch {
      // useTokens hook handles error notification internally
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleReannounce = async () => {
    try {
      await reannounceToken();
      notification.success('Token announced on all screens');
    } catch {
      notification.error('Failed to re-announce token');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const closeClearConfirm = () => {
    setShowClearConfirm(false);
    // Synchronous focus is required so iOS Safari preserves the user-gesture
    // context. Don't wrap in setTimeout — the gesture is lost across timers.
    inputRef.current?.focus();
  };

  // Wire keyboard shortcuts. Disabled while the confirm dialog is open so
  // it can manage its own focus trap and Escape handling.
  useKeyboardShortcuts(
    {
      'alt+r': () => {
        if (currentToken) handleReannounce();
      },
      'alt+z': () => {
        if (currentToken && !submitting) setShowClearConfirm(true);
      },
      'alt+n': handleCallNext,
    },
    { enabled: !showClearConfirm }
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-100">Token Display Management</h1>
        <p className="text-sm sm:text-base text-text-200 mt-1">
          Update the serving token number displayed on all screens
        </p>
      </div>

      {/* Current Token Display */}
      <div className="bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl shadow-lg p-6 sm:p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
          <Hash className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Current Serving Token</h2>
        </div>
        {currentToken ? (
          <>
            <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-3 sm:mb-4 break-words">
              {currentToken.number}
            </div>
            <div className="flex items-center justify-center gap-2 text-bg-100 mb-4">
              <Clock className="w-4 h-4" />
              <p className="text-xs sm:text-sm">
                Last updated: {formatTimestamp(currentToken.updatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReannounce}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-lg transition-colors text-sm sm:text-base font-semibold min-h-[44px]"
            >
              <Volume2 className="w-5 h-5" />
              Call Again
              <span className="hidden sm:inline text-xs text-white/70 ml-1">Alt+R</span>
            </button>
          </>
        ) : (
          <div className="py-10 sm:py-12">
            <p className="text-xl sm:text-2xl text-bg-100">No token set</p>
            <p className="text-xs sm:text-sm text-white/80 mt-2">Enter a token number below to display it on all screens</p>
          </div>
        )}
      </div>

      {/* Update Token Form */}
      <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-bg-300">
        <h3 className="text-lg font-semibold text-text-100 mb-4">Update Token Number</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="input-label">
              Enter Token Number
            </label>
            <input
              ref={inputRef}
              type="text"
              id="token"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && inputValue !== '') {
                  e.preventDefault();
                  setInputValue('');
                }
              }}
              disabled={submitting}
              className="input-field text-xl sm:text-2xl font-bold text-center disabled:opacity-60"
              placeholder="e.g., 24, A15, 102"
              autoComplete="off"
              autoCapitalize="characters"
            />
            {isDuplicate ? (
              <p className="mt-2 text-xs text-accent-200 font-medium">
                Already the current token. Use &quot;Call Again&quot; to re-announce.
              </p>
            ) : (
              <p className="mt-2 text-xs text-text-200">
                Press <span className="font-semibold">Enter</span> to call. Any text or number is accepted and will display on all screens immediately.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={submitting || inputValue.trim() === '' || isDuplicate}
              className="btn-primary flex-1 min-w-[140px] py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-h-[48px]"
            >
              {submitting ? 'Calling…' : 'Update Token'}
              {!submitting && <span className="hidden sm:inline text-xs opacity-80">⏎</span>}
            </button>
            {canCallNext && (
              <button
                type="button"
                onClick={handleCallNext}
                disabled={submitting}
                className="bg-primary-300 hover:bg-primary-200 active:bg-primary-200 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-h-[48px]"
                title={`Call next number (${nextNumber})`}
              >
                <ArrowRight className="w-5 h-5" />
                <span>Next {nextNumber}</span>
                <span className="hidden sm:inline text-xs opacity-80 ml-1">Alt+N</span>
              </button>
            )}
            {currentToken && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={submitting}
                className="btn-danger inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo last token (Alt+Z)"
              >
                <Trash2 className="w-5 h-5" />
                <span>Undo</span>
                <span className="hidden sm:inline text-xs opacity-80 ml-1">Alt+Z</span>
              </button>
            )}
          </div>

          <KeyboardHintsBar canCallNext={canCallNext} canClear={inputValue !== ''} />
        </form>
      </div>

      {/* Recent History */}
      {tokenHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 border border-bg-300">
          <h3 className="text-lg font-semibold text-text-100 mb-4">Recent Token History</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {tokenHistory.slice(0, 3).map((token, index) => (
              <div
                key={token._id || token.updatedAt}
                className={`p-4 rounded-lg border-2 ${
                  index === 0
                    ? 'bg-primary-100/20 border-primary-100'
                    : 'bg-bg-100 border-bg-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Hash className={`w-5 h-5 ${index === 0 ? 'text-primary-100' : 'text-text-200'}`} />
                  <span className={`text-xs font-semibold uppercase ${
                    index === 0 ? 'text-primary-100' : 'text-text-200'
                  }`}>
                    {index === 0 ? 'Last Called' : 'Previous'}
                  </span>
                </div>
                <div className={`text-3xl sm:text-4xl font-bold mb-2 break-words ${
                  index === 0 ? 'text-primary-100' : 'text-text-100'
                }`}>
                  {token.number}
                </div>
                {token.calledBy && (
                  <div className="flex items-center gap-1 text-xs text-text-200 mb-1">
                    <User className="w-3 h-3" />
                    <span>{token.calledBy}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-text-200">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(token.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Archive — 3 Day History */}
      <TokenArchiveSection archiveEntries={archiveEntries} />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={closeClearConfirm}
        onConfirm={handleClear}
        title="Undo Last Token"
        message="This will remove the current token and restore the previous one. The wrong call will be removed from history."
        confirmText="Undo"
        type="danger"
      />
    </div>
  );
};

export default TokenManagementPage;
