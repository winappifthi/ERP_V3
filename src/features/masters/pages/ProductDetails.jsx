import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { selectProducts, selectTaxCategories } from '../../../store/selectors/contextSelectors';
import { deleteProduct } from '../../../store/slices/mastersSlice';
import { formatINR } from '../../../lib/currency';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(selectProducts);
  const taxes = useSelector(selectTaxCategories);
  const product = products.find((p) => p.id === id);
  const tax = taxes.find((t) => t.id === product?.taxCategoryId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!product) return <div><PageHeader title="Product not found" /><Button variant="outlined" onClick={() => navigate('/app/masters/products')}>Back</Button></div>;

  const handleDelete = () => {
    dispatch(deleteProduct(product.id));
    navigate('/app/masters/products');
  };

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku}`}
        actions={
          <>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/app/masters/products/${product.id}/edit`)}>Edit</Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setConfirmDelete(true)}>Delete</Button>
          </>
        }
      />

      <div className="bg-white border border-gray-200 rounded p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold">Product Info</h2>
          <StatusBadge status={product.active ? 'active' : 'inactive'} />
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><dt className="text-xs text-gray-500">SKU</dt><dd className="font-mono">{product.sku}</dd></div>
          <div><dt className="text-xs text-gray-500">Category</dt><dd>{product.categoryId}</dd></div>
          <div><dt className="text-xs text-gray-500">UOM</dt><dd>{product.baseUom}</dd></div>
          <div><dt className="text-xs text-gray-500">HSN</dt><dd className="font-mono">{product.hsn || '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Selling Price</dt><dd className="tabular-nums font-medium">{formatINR(product.sellingPrice * 100)}</dd></div>
          <div><dt className="text-xs text-gray-500">Purchase Price</dt><dd className="tabular-nums">{formatINR(product.purchasePrice * 100)}</dd></div>
          <div><dt className="text-xs text-gray-500">Tax Category</dt><dd>{tax?.name || '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Reorder Level</dt><dd>{product.reorderLevel ?? '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Track Batch</dt><dd>{product.trackBatch ? 'Yes' : 'No'}</dd></div>
          <div><dt className="text-xs text-gray-500">Track Serial</dt><dd>{product.trackSerial ? 'Yes' : 'No'}</dd></div>
        </dl>
      </div>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {product.name} will be removed from the master. Existing transactions referencing it will not be affected, but reports may show broken links.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}