import { Customer, CustomerCreate, CustomerUpdate } from '@/types/customer';
import { fetchApi } from './common';

/**
 * Get all customers with optional filters
 */
export async function getCustomers(params?: Record<string, any>): Promise<Customer[]> {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  return fetchApi<Customer[]>(`/customers${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get a customer by ID
 */
export async function getCustomer(id: string): Promise<Customer> {
  return fetchApi<Customer>(`/customers/${id}`);
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: CustomerCreate): Promise<Customer> {
  return fetchApi<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
}

/**
 * Update a customer
 */
export async function updateCustomer(id: string, customerData: CustomerUpdate): Promise<Customer> {
  return fetchApi<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  });
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  return fetchApi<void>(`/customers/${id}`, {
    method: 'DELETE',
  });
} 