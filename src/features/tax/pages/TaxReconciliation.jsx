import { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../../components/common/PageHeader';
import GstPeriodFilter from '../components/GstPeriodFilter';
import { selectTaxReconciliation } from '../taxSelectors';
import { selectCurrentCompany } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

export default function TaxReconciliation() {
  const company = useSelector(selectCurrentCompany);
  const [period, setPeriod] = useState({ fromDate: '', toDate: '' });
  const rec = useSelector(selectTaxReconciliation(period.fromDate, period.toDate));

  return (
    <div>
      <PageHeader
        title="GST Reconciliation"
        description={`Register totals vs GL postings · ${company?.displayName || ''}`}
      />
      <GstPeriodFilter fromDate={period.fromDate} toDate={period.toDate} onChange={setPeriod} />

      <div className={`mb-4 px-4 py-3 rounded text-sm font-medium ${rec.reconciled ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
        {rec.reconciled ? '✓ Fully reconciled — registers match GL postings' : '⚠ Discrepancy detected — review each section below'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReconSection
          title="Output GST (Sales Register vs GL 2120/2121/2122)"
          register={rec.output.register}
          gl={rec.output.gl}
          difference={rec.output.difference}
        />
        <ReconSection
          title="Input GST (Purchase Register vs GL 1160/1161/1162)"
          register={rec.input.register}
          gl={rec.input.gl}
          difference={rec.input.difference}
        />
      </div>
    </div>
  );
}

function ReconSection({ title, register, gl, difference }) {
  const ok = difference === 0;
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Register total</span>
          <span className="tabular-nums font-medium">{formatINR(register)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">GL total</span>
          <span className="tabular-nums font-medium">{formatINR(gl)}</span>
        </div>
        <div className={`flex justify-between pt-2 border-t border-gray-200 font-semibold ${ok ? 'text-green-700' : 'text-red-600'}`}>
          <span>Difference</span>
          <span className="tabular-nums">{formatINR(difference)}</span>
        </div>
      </div>
      {!ok && (
        <div className="mt-3 text-xs text-gray-600">
          Common causes: a document was posted but GL auto-posting was not triggered; a manual journal was posted directly to a GST account; or a document was cancelled without a reversing entry.
        </div>
      )}
    </div>
  );
}