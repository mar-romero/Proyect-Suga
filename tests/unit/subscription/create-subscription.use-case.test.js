const CreateSubscriptionUseCase = require('../../../src/suscription/application/use-case/create-subscription.use-case');
const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  startSession: jest.fn()
}));

describe('CreateSubscriptionUseCase', () => {
  let useCase;
  let mockSubscriptionRepository;
  let mockCustomerRepository;
  let mockEventEmitter;
  let mockLogger;
  let mockSession;
  
  beforeEach(() => {
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      endSession: jest.fn()
    };
    
    mongoose.startSession.mockResolvedValue(mockSession);
    
    mockSubscriptionRepository = {
      create: jest.fn()
    };
    
    mockCustomerRepository = {
      findById: jest.fn()
    };
    
    mockEventEmitter = {
      emit: jest.fn()
    };
    
    mockLogger = {
      error: jest.fn(),
      info: jest.fn()
    };
    
    useCase = new CreateSubscriptionUseCase({
      subscriptionRepository: mockSubscriptionRepository,
      customerRepository: mockCustomerRepository,
      eventEmitter: mockEventEmitter,
      logger: mockLogger
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('debería crear una suscripción mensual correctamente', async () => {
    const startDate = new Date('2023-01-01T12:00:00Z');
    const endDate = new Date('2023-02-01T12:00:00Z');
    
    const originalDate = global.Date;
    global.Date = jest.fn(() => startDate);
    global.Date.now = jest.fn(() => startDate.getTime());
    
    global.Date.prototype = originalDate.prototype;
    
    const mockCustomer = { id: 'cus_123', name: 'Test Customer' };
    mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
    
    mockSubscriptionRepository.create.mockImplementation((subscription) => {
      return {
        id: 'sub_123',
        ...subscription,
        currentPeriodEnd: endDate
      };
    });
    
    const subscriptionData = {
      customerId: 'cus_123',
      plan: {
        id: 'plan_123',
        name: 'Monthly Plan',
        amount: 9.99,
        currency: 'USD',
        interval: 'month'
      }
    };
    
    const expectedSubscription = {
      ...subscriptionData,
      status: 'active',
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      cancelAtPeriodEnd: false
    };
    
    const createdSubscription = {
      id: 'sub_123',
      ...expectedSubscription
    };
    
    const result = await useCase.execute(subscriptionData);
    
    expect(mongoose.startSession).toHaveBeenCalled();
    expect(mockSession.startTransaction).toHaveBeenCalled();
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith('cus_123');
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Processing payment for subscription'));
    expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      customerId: 'cus_123',
      plan: subscriptionData.plan,
      status: 'active',
      cancelAtPeriodEnd: false
    }));
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.created', createdSubscription);
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
    expect(result).toEqual(createdSubscription);

    jest.spyOn(useCase, 'processPayment').mockImplementation(async (subscription) => {
      mockLogger.info(`Procesando pago para suscripción: ${JSON.stringify(subscription.plan)}`);
      return {
        success: true,
        transactionId: `tx_${Date.now()}`,
        amount: subscription.plan.amount,
        currency: subscription.plan.currency
      };
    });
  });
  
  
  it('debería lanzar un error si el cliente no existe', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);
    
    const subscriptionData = {
      customerId: 'non_existent_customer',
      plan: {
        id: 'plan_123',
        amount: 9.99,
        currency: 'USD',
        interval: 'month'
      }
    };
    
    await expect(useCase.execute(subscriptionData)).rejects.toThrow('Client not found');
    expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Client not found'));
  });
  
  it('debería manejar errores correctamente', async () => {
    const error = new Error('DB error');
    mockCustomerRepository.findById.mockRejectedValue(error);
    
    await expect(useCase.execute({ customerId: 'cus_123', plan: {} })).rejects.toThrow('DB error');
    expect(mockLogger.error).toHaveBeenCalledWith(`Error while creating subscription: ${error.message}`);
  });
}); 