import { useState } from 'react';
import { useTokens } from '../hooks/useTokens';
import { useNotification } from '../context/NotificationContext';
import { Hash, Trash2, Clock, User, Volume2 } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TokenArchiveSection from '../components/token/TokenArchiveSection';

const TokenManagementPage = () => {
  const { currentToken, tokenHistory, loading: _loading, updateToken, clearToken, reannounceToken, archiveEntries } = useTokens();
  const [inputValue, setInputValue] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const notification = useNotification();

  const isDuplicate = currentToken && inputValue.trim() === currentToken.number;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isDuplicate) return;
    try {
      await updateToken(inputValue.trim());
      setInputValue('');
    } catch {
      // useTokens hook handles error notification internally
    }
  };

  const handleClear = async () => {
    try {
      await clearToken();
      setInputValue('');
    } catch {
      // useTokens hook handles error notification internally
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-100">Token Display Management</h1>
        <p className="text-text-200 mt-1">
          Update the serving token number displayed on all screens
        </p>
      </div>

      {/* Current Token Display */}
      <div className="bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl shadow-lg p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Hash className="w-8 h-8 text-white" />
          <h2 className="text-2xl font-bold text-white">Current Serving Token</h2>
        </div>
        {currentToken ? (
          <>
            <div className="text-8xl font-bold text-white mb-4">
              {currentToken.number}
            </div>
            <div className="flex items-center justify-center gap-2 text-bg-100 mb-4">
              <Clock className="w-4 h-4" />
              <p className="text-sm">
                Last updated: {formatTimestamp(currentToken.updatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReannounce}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-semibold"
            >
              <Volume2 className="w-5 h-5" />
              Call Again
            </button>
          </>
        ) : (
          <div className="py-12">
            <p className="text-2xl text-bg-100">No token set</p>
            <p className="text-sm text-white/80 mt-2">Enter a token number below to display it on all screens</p>
          </div>
        )}
      </div>

      {/* Update Token Form */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-bg-300">
        <h3 className="text-lg font-semibold text-text-100 mb-4">Update Token Number</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="input-label">
              Enter Token Number
            </label>
            <input
              type="text"
              id="token"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="input-field text-2xl font-bold text-center"
              placeholder="e.g., 24, A15, 102"
              autoComplete="off"
            />
            {isDuplicate ? (
              <p className="mt-2 text-xs text-accent-200 font-medium">
                Already the current token. Use &quot;Call Again&quot; to re-announce.
              </p>
            ) : (
              <p className="mt-2 text-xs text-text-200">
                This can be any text or number. It will be displayed immediately on all gallery screens.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={inputValue.trim() === '' || isDuplicate}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Token
            </button>
            {currentToken && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Undo
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Recent History */}
      {tokenHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-bg-300">
          <h3 className="text-lg font-semibold text-text-100 mb-4">Recent Token History</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tokenHistory.slice(0, 3).map((token, index) => (
              <div
                key={token.updatedAt}
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
                <div className={`text-4xl font-bold mb-2 ${
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
        onClose={() => setShowClearConfirm(false)}
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
