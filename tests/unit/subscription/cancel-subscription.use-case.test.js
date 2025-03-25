const CancelSubscriptionUseCase = require('../../../src/suscription/application/use-case/cancel-subscription.use-case');

describe('CancelSubscriptionUseCase', () => {
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
      error: jest.fn()
    };
    
    useCase = new CancelSubscriptionUseCase({
      subscriptionRepository: mockSubscriptionRepository,
      eventEmitter: mockEventEmitter,
      logger: mockLogger
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('debería cancelar una suscripción inmediatamente', async () => {
    const mockDate = new Date('2023-01-01');
    global.Date = jest.fn(() => mockDate);
    
    const subscriptionId = 'sub_123';
    const cancelReason = 'No longer needed';
    
    const mockSubscription = {
      id: subscriptionId,
      status: 'active',
      currentPeriodEnd: new Date('2023-02-01')
    };
    
    const expectedUpdateData = {
      status: 'canceled',
      canceledAt: mockDate,
      cancelReason: cancelReason,
      cancelAtPeriodEnd: false
    };
    
    const updatedSubscription = {
      ...mockSubscription,
      ...expectedUpdateData
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    mockSubscriptionRepository.update.mockResolvedValue(updatedSubscription);
    
    const result = await useCase.execute(subscriptionId, false, cancelReason);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(subscriptionId, expectedUpdateData);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.canceled', updatedSubscription);
    expect(result).toEqual(updatedSubscription);
  });
  
  it('debería marcar una suscripción para cancelación al final del período', async () => {
    const mockDate = new Date('2023-01-01');
    global.Date = jest.fn(() => mockDate);
    
    const subscriptionId = 'sub_123';
    const cancelReason = 'No longer needed';
    
    const mockSubscription = {
      id: subscriptionId,
      status: 'active',
      currentPeriodEnd: new Date('2023-02-01')
    };
    
    const expectedUpdateData = {
      status: 'active',
      canceledAt: mockDate,
      cancelReason: cancelReason,
      cancelAtPeriodEnd: true,
      willCancelAt: mockSubscription.currentPeriodEnd
    };
    
    const updatedSubscription = {
      ...mockSubscription,
      ...expectedUpdateData
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    mockSubscriptionRepository.update.mockResolvedValue(updatedSubscription);
    
    const result = await useCase.execute(subscriptionId, true, cancelReason);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(subscriptionId, expectedUpdateData);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.canceled', updatedSubscription);
    expect(result).toEqual(updatedSubscription);
  });
  
  it('debería retornar null si la suscripción no existe', async () => {
    mockSubscriptionRepository.findById.mockResolvedValue(null);
    
    const result = await useCase.execute('non_existent_id', false, 'reason');
    
    expect(result).toBeNull();
    expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
  
  it('debería retornar null si la suscripción ya está cancelada', async () => {
    mockSubscriptionRepository.findById.mockResolvedValue({
      id: 'sub_123',
      status: 'canceled'
    });
    
    const result = await useCase.execute('sub_123', false, 'reason');
    
    expect(result).toBeNull();
    expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
  
  it('debería manejar errores correctamente', async () => {
    const error = new Error('DB error');
    mockSubscriptionRepository.findById.mockRejectedValue(error);
    
    await expect(useCase.execute('sub_123', false, 'reason')).rejects.toThrow('DB error');
    expect(mockLogger.error).toHaveBeenCalledWith(`Error when unsubscribing: ${error.message}`);
  });
}); 