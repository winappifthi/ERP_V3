import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import JournalLineEditor from '../components/JournalLineEditor';
import BalanceIndicator from '../components/BalanceIndicator';
import { createJournal, generateJournalId, generateJournalNumber } from '../financeSlice';
import { selectJournalsForCompany } from '../financeSelectors';
import { selectCurrentCompany, selectCurrentBranch } from '../../../store/selectors/contextSelectors';
import { toPaise } from '../../../lib/currency';
import dayjs from '../../../lib/dayjs';

export default function JournalCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const journals = useSelector(selectJournalsForCompany);
  const [snack, setSnack] = useState(null);

  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState([
    { accountCode: '', debitRupees: 0, creditRupees: 0, narration: '' },
    { accountCode: '', debitRupees: 0, creditRupees: 0, narration: '' },
  ]);

  const voucherNumber = useMemo(() => generateJournalNumber(journals, branch), [journals, branch]);

  const totalDebitPaise = lines.reduce((s, l) => s + toPaise(l.debitRupees || 0), 0);
  const totalCreditPaise = lines.reduce((s, l) => s + toPaise(l.creditRupees || 0), 0);

  const handlePost = (asDraft) => {
    if (totalDebitPaise !== totalCreditPaise || totalDebitPaise === 0) {
      setSnack({ severity: 'error', message: 'Debit and credit must be equal and non-zero' });
      return;
    }
    if (lines.some((l) => !l.accountCode)) {
      setSnack({ severity: 'error', message: 'All lines need an account' });
      return;
    }
    if (!narration) {
      setSnack({ severity: 'error', message: 'Narration required' });
      return;
    }
    const id = generateJournalId();
    dispatch(createJournal({
      id,
      companyId: company.id,
      branchId: branch.id,
      voucherNumber,
      date,
      status: asDraft ? 'draft' : 'posted',
      narration,
      lines: lines.map((l) => ({
        accountCode: l.accountCode,
        debitPaise: toPaise(l.debitRupees || 0),
        creditPaise: toPaise(l.creditRupees || 0),
        narration: l.narration || narration,
      })),
      createdAt: new Date().toISOString(),
    }));
    setSnack({ severity: 'success', message: asDraft ? 'Draft saved' : 'Journal posted' });
    setTimeout(() => navigate('/app/finance/journals'), 800);
  };

  return (
    <div>
      <PageHeader title="New Journal Entry" description={`${company?.displayName || ''} · ${branch?.name || ''}`} />
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Voucher #" size="small" value={voucherNumber} InputProps={{ readOnly: true }} />
          <TextField label="Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
          <TextField label="Narration" size="small" value={narration} onChange={(e) => setNarration(e.target.value)} />
        </div>
        <JournalLineEditor lines={lines} onChange={setLines} />
        <BalanceIndicator totalDebit={totalDebitPaise} totalCredit={totalCreditPaise} />
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/finance/journals')}>Cancel</Button>
          <Button variant="outlined" onClick={() => handlePost(true)}>Save Draft</Button>
          <Button variant="contained" onClick={() => handlePost(false)} disabled={totalDebitPaise !== totalCreditPaise || totalDebitPaise === 0}>Post Journal</Button>
        </div>
      </div>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>{snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}</Snackbar>
    </div>
  );
}