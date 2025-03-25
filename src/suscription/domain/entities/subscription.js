class Subscription {
  constructor({
    id,
    customerId,
    status,
    plan,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    canceledAt,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.customerId = customerId;
    this.status = status;
    this.plan = plan;
    this.currentPeriodStart = currentPeriodStart;
    this.currentPeriodEnd = currentPeriodEnd;
    this.cancelAtPeriodEnd = cancelAtPeriodEnd || false;
    this.canceledAt = canceledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Subscription;
