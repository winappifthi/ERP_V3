import { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import GstPeriodFilter from '../components/GstPeriodFilter';
import { selectGstr3bSummary } from '../taxSelectors';
import { selectCurrentCompany, selectCurrentTaxSettings } from '../taxSelectors';
import { selectCurrentCompany as selectCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function Gstr3bPreview() {
  const company = useSelector(selectCompany);
  const settings = useSelector(selectCurrentTaxSettings);
  const [period, setPeriod] = useState({ fromDate: '', toDate: '' });
  const summary = useSelector(selectGstr3bSummary(period.fromDate, period.toDate));

  const isRefund = summary.net.total < 0;
  const isPayable = summary.net.total > 0;

  return (
    <div>
      <PageHeader
        title="GSTR-3B Preview"
        description={`Monthly summary · ${company?.displayName || ''} · GSTIN ${settings?.gstin || '—'}`}
      />

      <GstPeriodFilter fromDate={period.fromDate} toDate={period.toDate} onChange={setPeriod} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 3.1 Outward Supplies */}
        <Section title="3.1 — Outward taxable supplies">
          <Line label="Taxable value" value={formatINR(summary.outward.taxable)} />
          <Line label="CGST" value={formatINR(summary.outward.cgst)} />
          <Line label="SGST" value={formatINR(summary.outward.sgst)} />
          <Line label="IGST" value={formatINR(summary.outward.igst)} />
          <Line label="Total tax" value={formatINR(summary.outward.totalTax)} bold />
        </Section>

        {/* 4 Eligible ITC */}
        <Section title="4 — Eligible ITC (Input Tax Credit)">
          <Line label="Taxable value" value={formatINR(summary.inward.taxable)} />
          <Line label="CGST" value={formatINR(summary.inward.cgst)} />
          <Line label="SGST" value={formatINR(summary.inward.sgst)} />
          <Line label="IGST" value={formatINR(summary.inward.igst)} />
          <Line label="Total ITC" value={formatINR(summary.inward.totalTax)} bold />
        </Section>
      </div>

      {/* 5 Net tax payable */}
      <Section title="5 — Net Tax Payable">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <NetHead label="CGST" value={summary.net.cgst} />
          <NetHead label="SGST" value={summary.net.sgst} />
          <NetHead label="IGST" value={summary.net.igst} />
        </div>
        <div className={`p-3 rounded text-sm font-semibold text-center ${isPayable ? 'bg-amber-50 text-amber-900 border border-amber-200' : isRefund ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
          {isPayable && `Net Payable: ${formatINR(summary.net.total)}`}
          {isRefund && `Net Refund: ${formatINR(-summary.net.total)}`}
          {!isPayable && !isRefund && 'No net tax due — fully offset by ITC'}
        </div>
      </Section>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 mt-4">
        <strong>Prototype:</strong> This preview aggregates posted invoices and returns. It is not a statutory GSTR-3B filing. Reverse-charge, blocked ITC, and ineligible credit adjustments are not modelled.
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 mb-3">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Line({ label, value, bold }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'font-semibold border-t border-gray-200 pt-2 mt-1' : 'text-gray-700'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function NetHead({ label, value }) {
  const isCredit = value < 0;
  return (
    <div className={`border rounded p-3 ${isCredit ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${isCredit ? 'text-green-700' : ''}`}>{formatINR(Math.abs(value))}</div>
      <div className="text-xs text-gray-500 mt-0.5">{isCredit ? 'Credit' : 'Payable'}</div>
    </div>
  );
}