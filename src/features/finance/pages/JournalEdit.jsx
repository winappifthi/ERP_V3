import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TextField, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import JournalLineEditor from '../components/JournalLineEditor';
import BalanceIndicator from '../components/BalanceIndicator';
import { updateJournal } from '../financeSlice';
import { selectJournalsInContext } from '../financeSelectors';
import { formatINR, toPaise } from '../../../lib/currency';

export default function JournalEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const journals = useSelector(selectJournalsInContext);
  const journal = journals.find((j) => j.id === id);
  const [snack, setSnack] = useState(null);

  const [date, setDate] = useState('');
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (journal) {
      setDate(journal.date);
      setNarration(journal.narration);
      setLines(
        journal.lines.map((l) => ({
          accountCode: l.accountCode,
          debitRupees: (l.debitPaise || 0) / 100,
          creditRupees: (l.creditPaise || 0) / 100,
          narration: l.narration || '',
        }))
      );
    }
  }, [journal]);

  const totalDebitPaise = useMemo(
    () => lines.reduce((s, l) => s + toPaise(l.debitRupees || 0), 0),
    [lines]
  );
  const totalCreditPaise = useMemo(
    () => lines.reduce((s, l) => s + toPaise(l.creditRupees || 0), 0),
    [lines]
  );

  if (!journal) {
    return <div><PageHeader title="Journal not found" /><Button variant="outlined" onClick={() => navigate('/app/finance/journals')}>Back</Button></div>;
  }

  if (journal.status !== 'draft') {
    return (
      <div>
        <PageHeader title="Cannot edit" description="Only draft journals are editable. Posted journals must be reversed." />
        <Button variant="outlined" onClick={() => navigate('/app/finance/journals')}>Back to Journals</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (totalDebitPaise !== totalCreditPaise || totalDebitPaise === 0) {
      setSnack({ severity: 'error', message: 'Debit and credit must be equal and non-zero' });
      return;
    }
    if (lines.some((l) => !l.accountCode)) {
      setSnack({ severity: 'error', message: 'All lines need an account' });
      return;
    }
    dispatch(updateJournal({
      id,
      date,
      narration,
      lines: lines.map((l) => ({
        accountCode: l.accountCode,
        debitPaise: toPaise(l.debitRupees || 0),
        creditPaise: toPaise(l.creditRupees || 0),
        narration: l.narration || narration,
      })),
    }));
    setSnack({ severity: 'success', message: 'Journal updated' });
    setTimeout(() => navigate('/app/finance/journals'), 700);
  };

  return (
    <div>
      <PageHeader title={`Edit ${journal.voucherNumber}`} description="Draft journals only" />
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField label="Voucher #" size="small" value={journal.voucherNumber} InputProps={{ readOnly: true }} />
          <TextField label="Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
          <TextField label="Narration" size="small" value={narration} onChange={(e) => setNarration(e.target.value)} />
        </div>
        <JournalLineEditor lines={lines} onChange={setLines} />
        <BalanceIndicator totalDebit={totalDebitPaise} totalCredit={totalCreditPaise} />
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
          <Button variant="text" onClick={() => navigate('/app/finance/journals')}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={totalDebitPaise !== totalCreditPaise || totalDebitPaise === 0}>Save Changes</Button>
        </div>
      </div>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}>
        {snack ? <Alert severity={snack.severity}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </div>
  );
}