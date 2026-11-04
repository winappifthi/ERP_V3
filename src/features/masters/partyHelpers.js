export const PARTY_TYPES = [
  { value: 'customer', label: 'Customer', plural: 'Customers', color: 'text-blue-700' },
  { value: 'vendor', label: 'Vendor', plural: 'Vendors', color: 'text-emerald-700' },
  { value: 'lead', label: 'Lead', plural: 'Leads', color: 'text-amber-700' },
];

export const LEAD_STAGES = [
  { value: 'new', label: 'New', color: 'bg-gray-100 text-gray-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-amber-100 text-amber-800' },
  { value: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

export const INDIAN_STATES = [
  { code: '33', name: 'Tamil Nadu' },
  { code: '29', name: 'Karnataka' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '36', name: 'Telangana' },
  { code: '32', name: 'Kerala' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
];

export const typeLabel = (type) =>
  PARTY_TYPES.find((t) => t.value === type)?.label || type;

export const typePlural = (type) =>
  PARTY_TYPES.find((t) => t.value === type)?.plural || type;