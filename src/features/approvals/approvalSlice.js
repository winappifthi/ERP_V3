import { createSlice, nanoid } from '@reduxjs/toolkit';
import { approvalRules as seedRules } from '../../data/seed/approvalRules';
import { activityLog as seedLog } from '../../data/seed/activityLog';

const initialState = {
  rules: seedRules,
  activityLog: seedLog,
  notifications: [], // unread notification objects
};

const approvalSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    // ---- Activity log ----
    appendActivity(state, action) {
      state.activityLog.unshift({
        id: action.payload.id || `ACT-${nanoid(6)}`,
        ...action.payload,
      });
    },

    // ---- Rules ----
    updateRule(state, action) {
      const idx = state.rules.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.rules[idx] = { ...state.rules[idx], ...action.payload };
    },
    toggleRuleActive(state, action) {
      const rule = state.rules.find((r) => r.id === action.payload);
      if (rule) rule.active = !rule.active;
    },

    // ---- Notifications ----
    pushNotification(state, action) {
      state.notifications.unshift({
        id: action.payload.id || `NTF-${nanoid(6)}`,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        read: false,
        ...action.payload,
      });
    },
    markNotificationRead(state, action) {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n) n.read = true;
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => { n.read = true; });
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  appendActivity,
  updateRule, toggleRuleActive,
  pushNotification, markNotificationRead, markAllNotificationsRead, clearNotifications,
} = approvalSlice.actions;

/**
 * Pure helper: given a document type and amount, find the applicable approval rule.
 */
export const resolveApprovalRule = (rules, documentType, amountPaise) => {
  const amountRupees = amountPaise / 100;
  const matching = rules
    .filter((r) => r.active && r.documentType === documentType)
    .filter((r) => amountRupees >= r.minRupees && (r.maxRupees == null || amountRupees <= r.maxRupees));
  return matching[0] || null;
};

export default approvalSlice.reducer;