import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';

export const keys = {
  products: ['products'],
  transactions: ['transactions'],
  logs: ['logs'],
};

export function useProducts() {
  return useQuery({ queryKey: keys.products, queryFn: dataService.getProducts });
}

export function useTransactions() {
  return useQuery({ queryKey: keys.transactions, queryFn: dataService.getTransactions });
}

export function useLogs() {
  return useQuery({ queryKey: keys.logs, queryFn: dataService.getLogs });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => dataService.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.products });
      qc.invalidateQueries({ queryKey: keys.logs });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => dataService.updateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.products }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => dataService.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.products }),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => dataService.createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.products });
      qc.invalidateQueries({ queryKey: keys.transactions });
      qc.invalidateQueries({ queryKey: keys.logs });
    },
  });
}

export function useRecordMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => dataService.recordMovement(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.products });
      qc.invalidateQueries({ queryKey: keys.logs });
    },
  });
}
