export type PlanId = 'Free' | 'Pro' | 'Premium';
export type SubscriptionStatus = 'Active' | 'Inactive' | 'Cancelled';

export interface PlanInfo {
  planId: PlanId;
  name: string;
  price: number;
  currency: string;
  maxCustomers: number;
  features: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}
