// utils/calculateScore.ts

export type ServiceType = "Compute" | "Storage" | "Network" | "Database" | "Security" | "Monitoring";

export interface Inputs {
  workload?: number;
  tps?: number;
  responseTime?: number;
  size?: number;
  access?: number;
  growth?: number;
  latency?: number;
  cdn?: number;
  residency?: number;
  dbType?: number;
  compliance?: number;
  encryption?: number;
  replication?: number;
  metrics?: number;
  alerts?: number;
  retention?: number;
}

export function calculateScore(type: ServiceType, inputs: Inputs): number {
  switch (type) {
    case "Compute":
      return (inputs.workload ?? 0) * 0.5 +
             (inputs.tps ?? 0) * 0.3 +
             (inputs.responseTime ?? 0) * 0.2;

    case "Storage":
      return (inputs.size ?? 0) * 0.4 +
             (inputs.access ?? 0) * 0.4 +
             (inputs.growth ?? 0) * 0.2;

    case "Network":
      return (inputs.latency ?? 0) * 0.5 +
             (inputs.cdn ?? 0) * 0.3 +
             (inputs.residency ?? 0) * 0.2;

    case "Database":
      return (inputs.dbType ?? 0) * 0.5 +
             (inputs.workload ?? 0) * 0.3 +
             (inputs.tps ?? 0) * 0.2;

    case "Security":
      return (inputs.compliance ?? 0) * 0.5 +
             (inputs.encryption ?? 0) * 0.3 +
             (inputs.replication ?? 0) * 0.2;

    case "Monitoring":
      return (inputs.metrics ?? 0) * 0.4 +
             (inputs.alerts ?? 0) * 0.3 +
             (inputs.retention ?? 0) * 0.3;

    default:
      return 0;
  }
}
