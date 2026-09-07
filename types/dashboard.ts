import type { LeadStatus, Treatment } from "@/types/leads";

export type DashboardStatusMetric = {
  status: LeadStatus;
  count: number;
};

export type DashboardClinicMetric = {
  clinicId: string;
  clinicName: string;
  city: string;
  color: string;
  count: number;
};

export type DashboardTreatmentMetric = {
  treatment: Treatment;
  count: number;
};

export type DashboardStats = {
  totalLeads: number;
  newLeads: number;
  scheduledAppointments: number;
  implantLeads: number;
  statusDistribution: DashboardStatusMetric[];
  clinicDistribution: DashboardClinicMetric[];
  treatmentDistribution: DashboardTreatmentMetric[];
};
