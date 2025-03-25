const RenewSubscriptionUseCase = require('../../../src/suscription/application/use-case/renew-subscription.use-case');

describe('RenewSubscriptionUseCase', () => {
  let useCase;
  let mockSubscriptionRepository;
  let mockEventEmitter;
  let mockLogger;
  
  beforeEach(() => {
    mockSubscriptionRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };
    
    mockEventEmitter = {
      emit: jest.fn()
    };
    
    mockLogger = {
      error: jest.fn(),
      info: jest.fn()
    };
    
    useCase = new RenewSubscriptionUseCase({
      subscriptionRepository: mockSubscriptionRepository,
      eventEmitter: mockEventEmitter,
      logger: mockLogger
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('debería renovar una suscripción mensual correctamente', async () => {
    const subscriptionId = 'sub_123';
    const currentDate = new Date('2023-03-03T12:00:00Z');
    
    const originalDate = global.Date;
    const mockDate = jest.fn((...args) => {
      if (args.length === 0) {
        return currentDate; 
      }
      return new originalDate(...args);
    });
    
    mockDate.now = jest.fn(() => currentDate.getTime());
    global.Date = mockDate;
    global.Date.prototype = originalDate.prototype;
    
    const mockSubscription = {
      id: subscriptionId,
      customerId: 'cus_123',
      status: 'active',
      currentPeriodStart: new Date('2023-02-01T12:00:00Z'),
      currentPeriodEnd: new Date('2023-03-01T12:00:00Z'),
      plan: {
        id: 'plan_123',
        name: 'Monthly Plan',
        amount: 9.99,
        currency: 'USD',
        interval: 'month'
      },
      cancelAtPeriodEnd: false
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    
    mockSubscriptionRepository.update.mockImplementation((id, updateData) => {
      return {
        ...mockSubscription,
        ...updateData
      };
    });
    
    jest.spyOn(useCase, 'processPayment').mockImplementation(async (subscription) => {
      mockLogger.info(`Procesando pago para renovación: ${JSON.stringify(subscription.plan)}`);
      return {
        success: true,
        transactionId: `tx_${currentDate.getTime()}`,
        amount: subscription.plan.amount,
        currency: subscription.plan.currency
      };
    });
    
    const result = await useCase.execute(subscriptionId);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Procesando pago para renovación'));
    
    expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
      subscriptionId,
      expect.any(Object) 
    );
    
    expect(result).toEqual(expect.objectContaining({
      id: subscriptionId,
      status: 'active'
    }));
  });
  
  it('debería renovar una suscripción anual correctamente', async () => {
    const subscriptionId = 'sub_456';
    const currentPeriodEnd = new Date('2023-12-31T12:00:00Z');
    const newPeriodStart = new Date('2023-12-31T12:00:00Z');
    const newPeriodEnd = new Date('2024-12-31T12:00:00Z');
    const currentDate = new Date('2023-03-03T12:00:00Z');
    
    const originalDate = global.Date;
    global.Date = jest.fn(() => currentDate);
    global.Date.now = jest.fn(() => currentDate.getTime());
    global.Date.prototype = originalDate.prototype;
    
    const mockSubscription = {
      id: subscriptionId,
      customerId: 'cus_456',
      status: 'active',
      currentPeriodStart: new Date('2022-12-31T12:00:00Z'),
      currentPeriodEnd: currentPeriodEnd,
      plan: {
        id: 'plan_456',
        name: 'Annual Plan',
        amount: 99.99,
        currency: 'USD',
        interval: 'year'
      },
      cancelAtPeriodEnd: false
    };
    
    const updatedSubscription = {
      ...mockSubscription,
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      updatedAt: currentDate
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    mockSubscriptionRepository.update.mockResolvedValue(updatedSubscription);
    
    jest.spyOn(useCase, 'processPayment').mockImplementation(async (subscription) => {
      mockLogger.info(`Procesando pago para renovación: ${JSON.stringify(subscription.plan)}`);
      return {
        success: true,
        transactionId: `tx_${currentDate.getTime()}`,
        amount: subscription.plan.amount,
        currency: subscription.plan.currency
      };
    });
    
    const result = await useCase.execute(subscriptionId);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
      subscriptionId, 
      expect.objectContaining({
        updatedAt: currentDate
      })
    );
    expect(result).toEqual(updatedSubscription);
  });
  
  it('debería cancelar una suscripción marcada para cancelación cuando llega a su fin', async () => {
    const subscriptionId = 'sub_123';
    const now = new Date('2023-02-01T00:00:00Z');
    
    jest.spyOn(global, 'Date')
      .mockImplementation(() => now);
    
    const mockSubscription = {
      id: subscriptionId,
      customerId: 'cus_123',
      status: 'active',
      currentPeriodStart: new Date('2023-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2023-01-31T23:59:59Z'),
      cancelAtPeriodEnd: true,
      plan: {
        id: 'plan_123',
        interval: 'month'
      }
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    
    const result = await useCase.execute(subscriptionId);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    expect(mockLogger.info).toHaveBeenCalledWith(`Subscription ${subscriptionId} marked for cancellation, will not be renewed`);
    expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
      subscriptionId, 
      expect.objectContaining({
        status: 'canceled',
        updatedAt: now
      })
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.ended', mockSubscription);
    expect(result).toBeNull();
  });
  
  it('no debería renovar una suscripción que no existe', async () => {
    mockSubscriptionRepository.findById.mockResolvedValue(null);
    
    await expect(useCase.execute('non_existent_id')).rejects.toThrow('Cannot renew: subscription not found or not active');
    expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
  
  it('no debería renovar una suscripción que no está activa', async () => {
    const mockSubscription = {
      id: 'sub_123',
      status: 'canceled'
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    
    await expect(useCase.execute('sub_123')).rejects.toThrow('Cannot renew: subscription not found or not active');
    expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
  
  it('debería manejar fallos de pago correctamente', async () => {
    const subscriptionId = 'sub_123';
    const currentDate = new Date('2023-04-03T12:00:00Z');
    
    const originalDate = global.Date;
    global.Date = jest.fn(() => currentDate);
    global.Date.now = jest.fn(() => currentDate.getTime());
    global.Date.prototype = originalDate.prototype;
    
    const mockSubscription = {
      id: subscriptionId,
      customerId: 'cus_123',
      status: 'active',
      currentPeriodStart: new Date('2023-03-01T00:00:00Z'),
      currentPeriodEnd: new Date('2023-03-31T23:59:59Z'),
      plan: {
        id: 'plan_123',
        interval: 'month',
        amount: 9.99,
        currency: 'USD'
      },
      cancelAtPeriodEnd: false
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    
    mockSubscriptionRepository.update.mockImplementation((_id, _updateData) => {
      return {
        ...mockSubscription,
        status: 'past_due',
        updatedAt: currentDate
      };
    });
    
    jest.spyOn(useCase, 'processPayment').mockResolvedValueOnce({
      success: false,
      error: 'Payment declined'
    });
    
    const result = await useCase.execute(subscriptionId);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    
    expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
      subscriptionId,
      expect.objectContaining({
        status: 'past_due'
      })
    );
    
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'subscription.payment_failed',
      expect.objectContaining({
        subscription: mockSubscription,
        paymentError: 'Payment declined'
      })
    );
    
    expect(result).toBeNull();
  });
  
  it('debería manejar errores correctamente', async () => {
    const error = new Error('DB error');
    mockSubscriptionRepository.findById.mockRejectedValue(error);
    
    await expect(useCase.execute('sub_123')).rejects.toThrow('DB error');
    expect(mockLogger.error).toHaveBeenCalledWith(`Error renewing subscription: ${error.message}`);
  });
}); 