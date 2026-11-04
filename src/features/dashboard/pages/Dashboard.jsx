import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { selectCurrentCompany, selectCurrentBranch, selectProducts, selectCustomers, selectVendors } from '../../../store/selectors/contextSelectors';
import { formatINR } from '../../../lib/currency';

function SummaryCard({ label, value, hint }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 600, mt: 0.5 }} className="tabular-nums">{value}</Typography>
      {hint && <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{hint}</Typography>}
    </Paper>
  );
}

export default function Dashboard() {
  const company = useSelector(selectCurrentCompany);
  const branch = useSelector(selectCurrentBranch);
  const products = useSelector(selectProducts);
  const customers = useSelector(selectCustomers);
  const vendors = useSelector(selectVendors);

  // Derived summary — from seed data (each customer has `outstanding` in paise-equivalent rupees)
  const stats = useMemo(() => {
    const companyCustomers = customers.filter((c) => c.companyId === company?.id);
    const companyVendors = vendors.filter((v) => v.companyId === company?.id);
    const totalReceivables = companyCustomers.reduce((s, c) => s + (c.outstanding || 0), 0);
    const totalPayables = companyVendors.reduce((s, v) => s + (v.outstanding || 0), 0);
    return {
      totalProducts: products.length,
      totalCustomers: companyCustomers.length,
      totalVendors: companyVendors.length,
      totalReceivables,
      totalPayables,
    };
  }, [company, products, customers, vendors]);

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description={`${company?.legalName || ''} · ${branch?.name || ''}`}
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        <SummaryCard label="Active Products" value={stats.totalProducts} hint="Across all categories" />
        <SummaryCard label="Customers" value={stats.totalCustomers} hint="In current company" />
        <SummaryCard
          label="Receivables"
          value={formatINR(stats.totalReceivables * 100)}
          hint="Outstanding from customers"
        />
        <SummaryCard
          label="Payables"
          value={formatINR(stats.totalPayables * 100)}
          hint="Outstanding to vendors"
        />
      </Box>

      <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Recent Activity</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Sales, purchase, and inventory activity will be summarised here as those modules are connected in Phases 8–11.
          </Typography>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Quick Links</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Masters are available under <strong>Masters</strong> in the sidebar. Products and customers lists are functional in this phase.
          </Typography>
        </Paper>
      </Box>
    </div>
  );
}