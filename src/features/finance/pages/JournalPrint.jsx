import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { Print } from '@mui/icons-material';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { selectJournalsInContext } from '../financeSelectors';
import { selectAccounts } from '../financeSelectors';
import { formatINR } from '../../../lib/currency';
import { formatDate } from '../../../lib/dayjs';

export default function JournalPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const journals = useSelector(selectJournalsInContext);
  const accounts = useSelector(selectAccounts);
  const journal = journals.find((j) => j.id === id);

  if (!journal) return <div className="p-6">Journal not found.</div>;

  const accountByCode = Object.fromEntries(accounts.map((a) => [a.code, a]));
  const totalDebit = journal.lines.reduce((s, l) => s + (l.debitPaise || 0), 0);
  const totalCredit = journal.lines.reduce((s, l) => s + (l.creditPaise || 0), 0);

  return (
    <div className="print-wrapper">
      <div className="no-print mb-3 flex gap-2 justify-end">
        <Button variant="text" onClick={() => navigate('/app/finance/journals')}>Back</Button>
        <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
      </div>

      <div className="invoice-sheet bg-white mx-auto p-8 max-w-[800px] border border-gray-200">
        <div className="flex justify-between border-b-2 border-gray-900 pb-3">
          <div>
            <div className="text-lg font-bold">{company?.legalName}</div>
            <div className="text-xs text-gray-600">{company?.address}</div>
            <div className="text-xs text-gray-600">Branch: {branch?.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-700">JOURNAL VOUCHER</div>
            <div className="text-xs mt-1">Voucher # <span className="font-mono font-semibold">{journal.voucherNumber}</span></div>
            <div className="text-xs">Date: {formatDate(journal.date)}</div>
            <div className="text-xs">Status: {journal.status}</div>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="text-xs text-gray-500">Narration</div>
          <div className="font-medium">{journal.narration}</div>
        </div>

        <table className="w-full text-xs mt-4">
          <thead className="bg-gray-100 uppercase text-gray-700">
            <tr>
              <th className="text-left px-2 py-2">Account</th>
              <th className="text-left px-2 py-2">Narration</th>
              <th className="text-right px-2 py-2">Debit</th>
              <th className="text-right px-2 py-2">Credit</th>
            </tr>
          </thead>
          <tbody>
            {journal.lines.map((l, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-2 py-1.5">
                  <div className="font-medium">{accountByCode[l.accountCode]?.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{l.accountCode}</div>
                </td>
                <td className="px-2 py-1.5">{l.narration || '—'}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{l.debitPaise ? formatINR(l.debitPaise) : ''}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{l.creditPaise ? formatINR(l.creditPaise) : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-900 font-semibold">
              <td className="px-2 py-2" colSpan={2}>Total</td>
              <td className="px-2 py-2 text-right tabular-nums">{formatINR(totalDebit)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{formatINR(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 flex justify-between text-[10px] text-gray-500">
          <div>Prepared by: {journal.createdBy || 'System'}</div>
          <div className="text-right">
            <div className="mt-8 border-t border-gray-400 pt-1">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}