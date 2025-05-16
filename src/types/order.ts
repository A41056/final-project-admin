export enum OrderStatus {
  Draft = 1,
  Pending = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
}

export const getOrderStatusLabel = (status: number): string => {
  switch (status) {
    case OrderStatus.Draft:
      return "Draft";
    case OrderStatus.Pending:
      return "Pending";
    case OrderStatus.Completed:
      return "Completed";
    case OrderStatus.Failed:
      return "Failed";
    case OrderStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
};
