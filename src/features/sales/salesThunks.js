// src/features/sales/salesThunks.js
export const createSalesOrder = createAsyncThunk('sales/createOrder', async (orderData) => {
  return api.post('/sales/orders', orderData);
});

export const updateSalesOrder = createAsyncThunk('sales/updateOrder', async ({ id, ...changes }) => {
  return api.put(`/sales/orders/${id}`, changes);
});