import { createSlice, nanoid } from '@reduxjs/toolkit';
import { chartOfAccounts as seedAccounts } from '../../data/seed/chartOfAccounts';
import { glPostings as seedPostings } from '../../data/seed/glPostings';
import { journalEntries as seedJournals } from '../../data/seed/journalEntries';

const initialState = {
  accounts: seedAccounts,
  postings: seedPostings,
  journals: seedJournals,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addPosting(state, action) {
      state.postings.push({ ...action.payload, id: action.payload.id || `GL-${nanoid(6)}` });
    },
    addPostings(state, action) {
      action.payload.forEach((p) => state.postings.push({ ...p, id: p.id || `GL-${nanoid(6)}` }));
    },
    createJournal(state, action) {
      const journal = action.payload;
      state.journals.unshift(journal);
      // Post to GL if posted
      if (journal.status === 'posted') {
        for (const line of journal.lines) {
          state.postings.push({
            id: `GL-${nanoid(6)}`,
            companyId: journal.companyId,
            branchId: journal.branchId,
            date: journal.date,
            accountCode: line.accountCode,
            debitPaise: line.debitPaise || 0,
            creditPaise: line.creditPaise || 0,
            narration: line.narration || journal.narration,
            referenceType: 'journal',
            referenceId: journal.id,
            createdAt: new Date().toISOString(),
          });
        }
      }
    },
    postJournal(state, action) {
      const journal = state.journals.find((j) => j.id === action.payload);
      if (journal && journal.status === 'draft') {
        journal.status = 'posted';
        journal.postedAt = new Date().toISOString();
        for (const line of journal.lines) {
          state.postings.push({
            id: `GL-${nanoid(6)}`,
            companyId: journal.companyId,
            branchId: journal.branchId,
            date: journal.date,
            accountCode: line.accountCode,
            debitPaise: line.debitPaise || 0,
            creditPaise: line.creditPaise || 0,
            narration: line.narration || journal.narration,
            referenceType: 'journal',
            referenceId: journal.id,
            createdAt: new Date().toISOString(),
          });
        }
      }
    },
    updateJournal(state, action) {
  const idx = state.journals.findIndex((j) => j.id === action.payload.id);
  if (idx >= 0 && state.journals[idx].status === 'draft') {
    state.journals[idx] = { ...state.journals[idx], ...action.payload };
  }
},
  },
});

export const { addPosting, addPostings, createJournal, postJournal, updateJournal } = financeSlice.actions;

export const generateJournalId = () => `JV-${nanoid(6)}`;

export const generateJournalNumber = (journals, branch) => {
  const prefix = `JV/${branch?.code || 'XX'}/2425/`;
  const matching = journals.filter((j) => j.voucherNumber?.startsWith(prefix));
  const maxSeq = matching.reduce((max, j) => {
    const seq = parseInt(j.voucherNumber.split('/').pop(), 10) || 0;
    return Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

export default financeSlice.reducer;