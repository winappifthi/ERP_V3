import { formatINR } from '../../lib/currency';
import StatusBadge from '../../components/common/StatusBadge';

export const MASTER_CONFIGS = {
  // ══════════════════════════════════════════════════════════
  // 1. PARTIES (Customers + Vendors + Leads — unified!)
  // ══════════════════════════════════════════════════════════
  parties: {
    title: 'Parties',
    singular: 'Party',
    description: 'Customers, vendors, and leads',
    icon: 'storefront',
    
    // Type tabs at top
    types: [
      { value: 'customer', label: 'Customers', color: 'text-blue-700' },
      { value: 'vendor', label: 'Vendors', color: 'text-emerald-700' },
      { value: 'lead', label: 'Leads', color: 'text-amber-700' },
    ],
    defaultType: 'customer',
    
    // Fetch from slice, filter by type in the component
    getRows: (state, type) =>
      (state.masters.parties || []).filter((p) => p.type === type),
    
    // Columns per type
    getColumns: (type) => {
      const base = [
        { 
          key: 'code', 
          label: 'Code', 
          render: (r) => <span className="font-mono text-xs">{r.code}</span> 
        },
        { 
          key: 'name', 
          label: 'Name', 
          editPath: '/app/masters/parties/:id/edit',
          render: (r) => <span className="font-medium">{r.name}</span> 
        },
      ];
      
      if (type === 'lead') {
        return [
          ...base,
          { key: 'phone', label: 'Phone', hideOnMobile: true },
          { key: 'email', label: 'Email', hideOnMobile: true },
          { 
            key: 'stage', 
            label: 'Stage',
            render: (r) => <StatusBadge status={r.stage || 'new'} />
          },
        ];
      }
      
      return [
        ...base,
        { key: 'gstin', label: 'GSTIN', hideOnMobile: true, render: (r) => <span className="font-mono text-xs">{r.gstin || '—'}</span> },
        { key: 'state', label: 'State', hideOnMobile: true },
        { 
          key: 'outstanding', 
          label: 'Outstanding', 
          align: 'right',
          render: (r) => formatINR((r.outstanding || 0) * 100),
        },
        { 
          key: 'active', 
          label: 'Status', 
          render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> 
        },
      ];
    },
    
    // Form fields per type (shared + type-specific)
    getFormFields: (type) => {
      const base = [
        { name: 'code', label: 'Code', type: 'text', size: 1, required: true },
        { name: 'name', label: 'Name', type: 'text', size: 2, required: true },
        { name: 'phone', label: 'Phone', type: 'text', size: 1 },
        { name: 'email', label: 'Email', type: 'text', size: 1 },
      ];
      
      if (type === 'lead') {
        return [
          ...base,
          { 
            name: 'stage', 
            label: 'Stage', 
            type: 'select', 
            size: 1, 
            required: true,
            defaultValue: 'new',
            options: [
              { value: 'new', label: 'New' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' },
            ],
          },
          { name: 'notes', label: 'Notes', type: 'textarea', size: 3 },
        ];
      }
      
      return [
        ...base,
        { name: 'gstin', label: 'GSTIN', type: 'text', size: 1 },
        { 
          name: 'stateCode', 
          label: 'State', 
          type: 'select', 
          size: 1, 
          required: true,
          options: [
            { value: '33', label: 'Tamil Nadu (33)' },
            { value: '29', label: 'Karnataka (29)' },
            { value: '27', label: 'Maharashtra (27)' },
          ],
        },
        ...(type === 'customer' ? [
          { name: 'creditLimit', label: 'Credit Limit (₹)', type: 'currency', size: 1, defaultValue: 0 },
        ] : []),
        { name: 'active', label: 'Active', type: 'checkbox', size: 1, defaultValue: true },
      ];
    },
    
    defaultValues: { type: 'customer', active: true },
  },

  // ══════════════════════════════════════════════════════════
  // 2. ITEMS (Products)
  // ══════════════════════════════════════════════════════════
  items: {
    title: 'Items',
    singular: 'Item',
    description: 'Products and services',
    
    getRows: (state) => state.masters.products || [],
    
    getColumns: () => [
      { 
        key: 'sku', 
        label: 'SKU', 
        editPath: '/app/masters/items/:id/edit',
        render: (r) => <span className="font-mono text-xs">{r.sku}</span> 
      },
      { 
        key: 'name', 
        label: 'Name', 
        render: (r) => <span className="font-medium">{r.name}</span> 
      },
      { key: 'baseUom', label: 'UOM', align: 'center' },
      { key: 'hsn', label: 'HSN', hideOnMobile: true },
      { 
        key: 'sellingPrice', 
        label: 'Selling (₹)', 
        align: 'right', 
        render: (r) => formatINR((r.sellingPrice || 0) * 100) 
      },
      { 
        key: 'purchasePrice', 
        label: 'Purchase (₹)', 
        align: 'right', 
        hideOnMobile: true,
        render: (r) => formatINR((r.purchasePrice || 0) * 100) 
      },
      { 
        key: 'active', 
        label: 'Status', 
        render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> 
      },
    ],
    
    getFormFields: () => [
      { name: 'sku', label: 'SKU', type: 'text', size: 1, required: true },
      { name: 'name', label: 'Name', type: 'text', size: 2, required: true },
      { 
        name: 'categoryId', 
        label: 'Category', 
        type: 'select', 
        size: 1, 
        required: true,
        selector: (state) => state.masters.categories || [],
        getOptionLabel: (o) => o.name,
        optionsKey: 'id',
        labelKey: 'name',
      },
      { 
        name: 'baseUom', 
        label: 'UOM', 
        type: 'select', 
        size: 1, 
        required: true,
        options: [
          { value: 'PCS', label: 'Pieces' },
          { value: 'KG', label: 'Kilograms' },
          { value: 'MTR', label: 'Meters' },
          { value: 'LTR', label: 'Liters' },
        ],
        defaultValue: 'PCS',
      },
      { name: 'hsn', label: 'HSN Code', type: 'text', size: 1 },
      { name: 'sellingPrice', label: 'Selling Price (₹)', type: 'currency', size: 1, defaultValue: 0 },
      { name: 'purchasePrice', label: 'Purchase Price (₹)', type: 'currency', size: 1, defaultValue: 0 },
      { 
        name: 'taxRatePercent', 
        label: 'GST Rate', 
        type: 'select', 
        size: 1, 
        options: [
          { value: 0, label: '0%' },
          { value: 5, label: '5%' },
          { value: 12, label: '12%' },
          { value: 18, label: '18%' },
          { value: 28, label: '28%' },
        ],
        defaultValue: 18,
      },
      { name: 'reorderLevel', label: 'Reorder Level', type: 'number', size: 1, defaultValue: 0 },
      { name: 'trackBatch', label: 'Track Batch', type: 'checkbox', size: 1, defaultValue: false },
      { name: 'trackSerial', label: 'Track Serial', type: 'checkbox', size: 1, defaultValue: false },
      { name: 'active', label: 'Active', type: 'checkbox', size: 1, defaultValue: true },
    ],
    
    defaultValues: { baseUom: 'PCS', taxRatePercent: 18, active: true },
  },

  // ══════════════════════════════════════════════════════════
  // 3. CATEGORIES
  // ══════════════════════════════════════════════════════════
  categories: {
    title: 'Categories',
    singular: 'Category',
    description: 'Item groupings',
    
    getRows: (state) => state.masters.categories || [],
    
    getColumns: () => [
      { 
        key: 'name', 
        label: 'Category', 
        editPath: '/app/masters/categories/:id/edit',
        render: (r) => <span className="font-medium">{r.name}</span> 
      },
      { key: 'description', label: 'Description' },
    ],
    
    getFormFields: () => [
      { name: 'name', label: 'Category Name', type: 'text', size: 2, required: true },
      { name: 'description', label: 'Description', type: 'textarea', size: 3 },
    ],
    
    defaultValues: { name: '', description: '' },
  },

  // ══════════════════════════════════════════════════════════
  // 4. UOM
  // ══════════════════════════════════════════════════════════
  uom: {
    title: 'Units of Measurement',
    singular: 'UOM',
    description: 'Measurement units',
    
    getRows: (state) => state.masters.uoms || [],
    
    getColumns: () => [
      { 
        key: 'id', 
        label: 'Code', 
        editPath: '/app/masters/uom/:id/edit',
        render: (r) => <span className="font-mono text-xs">{r.id}</span> 
      },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
    ],
    
    getFormFields: () => [
      { name: 'id', label: 'Code', type: 'text', size: 1, required: true },
      { name: 'name', label: 'Name', type: 'text', size: 1, required: true },
      { 
        name: 'type', 
        label: 'Type', 
        type: 'select', 
        size: 1,
        options: [
          { value: 'Count', label: 'Count' },
          { value: 'Weight', label: 'Weight' },
          { value: 'Length', label: 'Length' },
          { value: 'Volume', label: 'Volume' },
        ],
        defaultValue: 'Count',
      },
    ],
    
    defaultValues: { type: 'Count' },
  },

  // ══════════════════════════════════════════════════════════
  // 5. BARCODES
  // ══════════════════════════════════════════════════════════
  barcodes: {
    title: 'Barcodes',
    singular: 'Barcode',
    description: 'SKU to barcode mapping',
    
    getRows: (state) => state.masters.barcodes || [],
    
    getColumns: () => [
      { 
        key: 'sku', 
        label: 'Barcode / SKU', 
        editPath: '/app/masters/barcodes/:id/edit',
        render: (r) => <span className="font-mono text-sm">{r.sku}</span> 
      },
      { key: 'name', label: 'Item' },
      { key: 'type', label: 'Format' },
    ],
    
    getFormFields: () => [
      { 
        name: 'sku', 
        label: 'Barcode Value', 
        type: 'text', 
        size: 2, 
        required: true 
      },
      { 
        name: 'type', 
        label: 'Format', 
        type: 'select', 
        size: 1,
        options: [
          { value: 'EAN-13', label: 'EAN-13' },
          { value: 'UPC-A', label: 'UPC-A' },
          { value: 'CODE-128', label: 'CODE-128' },
        ],
        defaultValue: 'EAN-13',
      },
      { 
        name: 'name', 
        label: 'Item Name', 
        type: 'text', 
        size: 3, 
        required: true 
      },
    ],
    
    defaultValues: { type: 'EAN-13' },
  },

  // ══════════════════════════════════════════════════════════
  // 6. WAREHOUSES
  // ══════════════════════════════════════════════════════════
  warehouses: {
    title: 'Warehouses',
    singular: 'Warehouse',
    description: 'Storage locations',
    
    getRows: (state) => state.masters.warehouses || [],
    
    getColumns: () => [
      { 
        key: 'code', 
        label: 'Code', 
        editPath: '/app/masters/warehouses/:id/edit',
        render: (r) => <span className="font-mono text-xs">{r.code}</span> 
      },
      { 
        key: 'name', 
        label: 'Name', 
        render: (r) => <span className="font-medium">{r.name}</span> 
      },
      { key: 'branchId', label: 'Branch', hideOnMobile: true },
      { 
        key: 'type', 
        label: 'Type',
        render: (r) => <span className="capitalize">{r.type}</span>
      },
      { 
        key: 'active', 
        label: 'Status', 
        render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> 
      },
    ],
    
    getFormFields: () => [
      { name: 'code', label: 'Code', type: 'text', size: 1, required: true },
      { name: 'name', label: 'Name', type: 'text', size: 2, required: true },
      { 
        name: 'type', 
        label: 'Type', 
        type: 'select', 
        size: 1,
        options: [
          { value: 'retail', label: 'Retail' },
          { value: 'distribution', label: 'Distribution' },
          { value: 'raw-material', label: 'Raw Material' },
          { value: 'finished-goods', label: 'Finished Goods' },
        ],
        defaultValue: 'retail',
      },
      { name: 'active', label: 'Active', type: 'checkbox', size: 1, defaultValue: true },
    ],
    
    defaultValues: { type: 'retail', active: true },
  },

  // ══════════════════════════════════════════════════════════
  // 7. BINS
  // ══════════════════════════════════════════════════════════
  bins: {
    title: 'Bins / Locations',
    singular: 'Bin',
    description: 'Sub-locations in warehouses',
    
    getRows: (state) => state.masters.bins || [],
    
    getColumns: () => [
      { 
        key: 'code', 
        label: 'Bin Code', 
        editPath: '/app/masters/bins/:id/edit',
        render: (r) => <span className="font-mono text-xs">{r.code}</span> 
      },
      { key: 'warehouseId', label: 'Warehouse' },
      { key: 'aisle', label: 'Aisle', hideOnMobile: true },
      { key: 'rack', label: 'Rack', hideOnMobile: true },
      { 
        key: 'active', 
        label: 'Status', 
        render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> 
      },
    ],
    
    getFormFields: () => [
      { name: 'code', label: 'Bin Code', type: 'text', size: 1, required: true },
      { name: 'warehouseId', label: 'Warehouse', type: 'text', size: 2, required: true },
      { name: 'aisle', label: 'Aisle', type: 'text', size: 1 },
      { name: 'rack', label: 'Rack', type: 'text', size: 1 },
      { name: 'shelf', label: 'Shelf', type: 'text', size: 1 },
      { name: 'active', label: 'Active', type: 'checkbox', size: 1, defaultValue: true },
    ],
    
    defaultValues: { active: true },
  },
};