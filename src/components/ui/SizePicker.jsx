import { SIZE_STEPS, DEFAULT_SIZE } from '../../utils/constants';

const SizePicker = ({ label, value, onChange }) => {
  const current = value || DEFAULT_SIZE;
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-200 mb-2">{label}</label>
      )}
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {SIZE_STEPS.map((step) => {
          const isSelected = current === step;
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(step)}
              className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold tabular-nums transition-colors ${
                isSelected
                  ? 'border-primary-100 bg-primary-50 text-primary-100'
                  : 'border-bg-300 bg-white text-text-200 hover:border-primary-100/50'
              }`}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizePicker;
