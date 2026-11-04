import { TextField, IconButton, Button } from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUnpaidInvoicesForCustomer } from '../salesSelectors';
import { formatINR } from '../../../lib/currency';

export default function ReceiptAllocationPanel({ customerId, allocations, onChange, control, register, errors, disabled }) {
  const invoices = useSelector(selectUnpaidInvoicesForCustomer(customerId || ''));

  const totalAllocated = allocations.reduce((s, a) => s + (Number(a.amountRupees) || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">Invoice Allocations</h3>
        <span className="text-xs text-gray-500">
          Allocated: <span className="font-semibold tabular-nums">{formatINR(totalAllocated * 100)}</span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>
              <th className="text-left px-3 py-2">Invoice</th>
              <th className="text-right px-3 py-2">Due</th>
              <th className="text-right px-3 py-2" style={{ width: '140px' }}>Allocate</th>
              <th className="px-2" style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-xs">
                  {customerId ? 'No unpaid invoices for this customer.' : 'Select a customer first.'}
                </td>
              </tr>
            )}
            {allocations.map((alloc, i) => {
              const inv = invoices.find((x) => x.id === alloc.invoiceId);
              return (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-1.5">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                      {...register(`allocations.${i}.invoiceId`)}
                      disabled={disabled}
                    >
                      <option value="">Select invoice…</option>
                      {invoices.map((iv) => (
                        <option key={iv.id} value={iv.id}>
                          {iv.invoiceNumber} (due {formatINR(iv.duePaise)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                    {inv ? formatINR(inv.duePaise) : '—'}
                  </td>
                  <td className="px-3 py-1.5">
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0, step: '0.01', max: inv ? inv.duePaise / 100 : undefined }}
                      {...register(`allocations.${i}.amountRupees`, { valueAsNumber: true })}
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <IconButton size="small" onClick={() => onChange(allocations.filter((_, j) => j !== i))} disabled={disabled}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-2 border-t border-gray-200">
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => onChange([...allocations, { invoiceId: '', amountRupees: 0 }])}
          disabled={disabled || !customerId}
        >
          Add Allocation
        </Button>
      </div>
      {errors?.allocations?.message && (
        <div className="px-3 py-2 text-xs text-red-600">{errors.allocations.message}</div>
      )}
    </div>
  );
}