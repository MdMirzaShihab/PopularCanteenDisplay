import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Hash, Trash2, Clock } from 'lucide-react';

const TokenManagementPage = () => {
  const { servingToken, tokenHistory, updateServingToken, clearServingToken } = useData();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputValue.trim() === '') return;

    updateServingToken(inputValue.trim());
    setInputValue('');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the serving token?')) {
      clearServingToken();
      setInputValue('');
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
        {servingToken ? (
          <>
            <div className="text-8xl font-bold text-white mb-4">
              {servingToken.number}
            </div>
            <div className="flex items-center justify-center gap-2 text-bg-100">
              <Clock className="w-4 h-4" />
              <p className="text-sm">
                Last updated: {formatTimestamp(servingToken.updatedAt)}
              </p>
            </div>
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
            <p className="mt-2 text-xs text-text-200">
              This can be any text or number. It will be displayed immediately on all gallery screens.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={inputValue.trim() === ''}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Token
            </button>
            {servingToken && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Recent History */}
      {tokenHistory.length > 1 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-bg-300">
          <h3 className="text-lg font-semibold text-text-100 mb-4">Recent Token History</h3>
          <div className="grid grid-cols-3 gap-4">
            {tokenHistory.slice(0, 3).map((token, index) => (
              <div
                key={index}
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
                    {index === 0 ? 'Current' : `Previous ${index}`}
                  </span>
                </div>
                <div className={`text-4xl font-bold mb-2 ${
                  index === 0 ? 'text-primary-100' : 'text-text-100'
                }`}>
                  {token.number}
                </div>
                <div className="flex items-center gap-1 text-xs text-text-200">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(token.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-primary-100/10 border border-primary-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-100 mb-2">
          How Token Display Works
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-100">
          <li>Enter a token number and press "Update Token" or hit Enter</li>
          <li>The token will immediately appear on all active gallery screens</li>
          <li>Recent tokens are shown below the current token on screens</li>
          <li>System keeps track of the last 3 tokens for customer reference</li>
          <li>Changes are instant - no need to refresh the gallery screens</li>
          <li>Use "Clear" to remove all tokens from screens</li>
          <li>Perfect for calling customers or managing queue numbers</li>
        </ul>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-bg-300">
        <h3 className="text-lg font-semibold text-text-100 mb-4">Preview on Screen</h3>
        <div className="relative bg-primary-300 rounded-lg h-48 flex items-start justify-start p-4">
          {servingToken && (
            <div className="px-6 py-3 bg-accent-100 text-white rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <Hash className="w-6 h-6" />
                <span className="text-3xl font-bold">{servingToken.number}</span>
              </div>
            </div>
          )}
          {!servingToken && (
            <p className="text-bg-100 text-sm italic">Token will appear here when set</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenManagementPage;
