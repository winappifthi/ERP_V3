import {
  IconButton,
  TextField,
  Checkbox,
  Tooltip,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../../store/selectors/contextSelectors';
import { calculateLine } from '../../../domain/calculations/lineCalculator';
import { formatINR } from '../../../lib/currency';
import ProductSelector from './ProductSelector';
import { selectWarehousesForBranch } from '../../../store/selectors/contextSelectors';

const emptyLine = {
  productId: '',
  quantity: 1,
  unitPriceRupees: 0,
  discountPercent: 0,
  taxRatePercent: 18,
  taxTreatment: 'intra',
  taxInclusive: false,
};

export default function SalesLineItems({
  control,
  errors,
  fields,
  append,
  remove,
  watch,
  setValue,
}) {
  const products = useSelector(selectProducts);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const warehouses = useSelector(selectWarehousesForBranch);
  const showWarehouse = props.showWarehouse;

  const lines = watch('lines') || [];

  return (
    <div className="border border-gray-200 rounded overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>
              <th
                className="text-left px-2 py-2 font-medium"
                style={{ width: '28%' }}
              >
                Product
              </th>
              <th
                className="text-right px-2 py-2 font-medium"
                style={{ width: '8%' }}
              >
                Qty
              </th>
              <th
                className="text-right px-2 py-2 font-medium"
                style={{ width: '12%' }}
              >
                Rate (₹)
              </th>
              <th
                className="text-right px-2 py-2 font-medium"
                style={{ width: '8%' }}
              >
                Disc %
              </th>
              <th
                className="text-right px-2 py-2 font-medium"
                style={{ width: '8%' }}
              >
                Tax %
              </th>
              <th
                className="text-center px-2 py-2 font-medium"
                style={{ width: '8%' }}
              >
                Incl.
              </th>
              <th
                className="text-right px-2 py-2 font-medium"
                style={{ width: '12%' }}
              >
                Taxable
              </th>
              <th
                className="text-right px-2 py-2 font-medium"
                style={{ width: '12%' }}
              >
                Total
              </th>
              <th className="px-2 py-2" style={{ width: '4%' }}></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const line = lines[index] || emptyLine;
              const calc = calculateLine({
                ...line,
                headerDiscountAllocationPaise: 0,
              });
              const err = errors?.lines?.[index];

              return (
                <tr key={field.id} className={`border-t border-gray-100 ${err ? 'bg-red-50' : ''}`}>
                  <td className="px-2 py-1.5">
                    <ProductSelector
                      value={line.productId}
                      onChange={(p) => {
                        if (!p) return;
                        setValue(`lines.${index}.productId`, p.productId, {
                          shouldValidate: true,
                        });
                        setValue(
                          `lines.${index}.unitPriceRupees`,
                          p.unitPriceRupees,
                        );
                        setValue(
                          `lines.${index}.taxRatePercent`,
                          p.taxRatePercent,
                        );
                        // Auto-set product name (for display when no product found)
                        const prod = productById[p.productId];
                        if (prod)
                          setValue(`lines.${index}.productName`, prod.name);
                      }}
                      error={err?.productId}
                    />
                    {err?.productId && (
                      <div className="text-xs text-red-600 mt-0.5">
                        {err.productId.message}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{
                        min: 0,
                        step: 'any',
                        style: { textAlign: 'right' },
                      }}
                      {...control.register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      error={!!err?.quantity}
                      fullWidth
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{
                        min: 0,
                        step: '0.01',
                        style: { textAlign: 'right' },
                      }}
                      {...control.register(`lines.${index}.unitPriceRupees`, {
                        valueAsNumber: true,
                      })}
                      error={!!err?.unitPriceRupees}
                      fullWidth
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: '0.01',
                        style: { textAlign: 'right' },
                      }}
                      {...control.register(`lines.${index}.discountPercent`, {
                        valueAsNumber: true,
                      })}
                      fullWidth
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Select
                      size="small"
                      value={line.taxRatePercent}
                      onChange={(e) =>
                        setValue(
                          `lines.${index}.taxRatePercent`,
                          Number(e.target.value),
                        )
                      }
                      fullWidth
                    >
                      {[0, 5, 12, 18, 28].map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}%
                        </MenuItem>
                      ))}
                    </Select>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <Checkbox
                      size="small"
                      checked={!!line.taxInclusive}
                      onChange={(e) =>
                        setValue(
                          `lines.${index}.taxInclusive`,
                          e.target.checked,
                        )
                      }
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">
                    {formatINR(calc.taxablePaise)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-medium text-gray-900">
                    {formatINR(calc.lineTotalPaise)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <Tooltip title="Remove line">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label="Remove line"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => append({ ...emptyLine })}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50"
        >
          <Add fontSize="small" /> Add Line
        </button>
      </div>

      {errors?.lines?.message && (
        <div className="px-3 py-2 text-xs text-red-600 border-t border-gray-100">
          {errors.lines.message}
        </div>
      )}
    </div>
  );
}
