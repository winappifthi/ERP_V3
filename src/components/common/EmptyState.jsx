import { InboxOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';

const VARIANTS = {
  inbox: { icon: InboxOutlined, color: 'text-gray-300' },
};

export default function EmptyState({ title = 'No records', description, action, secondaryAction, icon, variant = 'inbox' }) {
  const preset = VARIANTS[variant] || VARIANTS.inbox;
  const Icon = icon || preset.icon;
  return (
    <div className="text-center py-12 px-4">
      <div className={`flex justify-center mb-3 ${preset.color}`}>
        <Icon style={{ fontSize: 56, opacity: 0.5 }} />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-4 flex justify-center gap-2">
          {action && (
            <Button variant="contained" size="small" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outlined" size="small" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}