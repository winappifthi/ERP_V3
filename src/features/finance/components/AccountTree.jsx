import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from '@mui/icons-material';
import { formatINR } from '../../../lib/currency';

/**
 * Renders a tree of accounts grouped by parentCode.
 * `balances` is an optional map of accountCode -> net balance (paise, positive=debit).
 * Clicking a leaf node calls onLeafClick(code).
 */
export default function AccountTree({ accounts, balances = {}, onLeafClick }) {
  const rootAccounts = accounts.filter((a) => !a.parentCode);
  return (
    <div className="text-sm">
      {rootAccounts.map((root) => (
        <TreeRow key={root.code} account={root} accounts={accounts} balances={balances} onLeafClick={onLeafClick} depth={0} />
      ))}
    </div>
  );
}

function TreeRow({ account, accounts, balances, onLeafClick, depth }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const children = accounts.filter((a) => a.parentCode === account.code);
  const hasChildren = children.length > 0;
  const balance = balances[account.code] || 0;

  return (
    <>
      <div
        className={`flex items-center px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer ${!account.isGroup ? 'text-gray-800' : 'text-gray-900 font-medium'}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          if (hasChildren) setExpanded((v) => !v);
          else if (onLeafClick) onLeafClick(account.code);
        }}
      >
        <span className="w-5 flex-shrink-0 text-gray-400">
          {hasChildren ? (expanded ? <ChevronDown fontSize="small" /> : <ChevronRight fontSize="small" />) : <Folder fontSize="small" style={{ opacity: 0.5 }} />}
        </span>
        <span className="flex-1">{account.name}</span>
        <span className="font-mono text-xs text-gray-500 mr-3">{account.code}</span>
        {balance !== 0 && <span className="tabular-nums text-xs w-28 text-right">{formatINR(balance)}</span>}
      </div>
      {expanded && hasChildren && (
        <>
          {children.map((c) => (
            <TreeRow key={c.code} account={c} accounts={accounts} balances={balances} onLeafClick={onLeafClick} depth={depth + 1} />
          ))}
        </>
      )}
    </>
  );
}