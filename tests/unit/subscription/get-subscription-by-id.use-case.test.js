const GetSubscriptionByIdUseCase = require('../../../src/suscription/application/use-case/get-subscription-by-id.use-case');

describe('GetSubscriptionByIdUseCase', () => {
  let useCase;
  let mockSubscriptionRepository;
  let mockLogger;
  
  beforeEach(() => {
    mockSubscriptionRepository = {
      findById: jest.fn()
    };
    
    mockLogger = {
      error: jest.fn()
    };
    
    useCase = new GetSubscriptionByIdUseCase({
      subscriptionRepository: mockSubscriptionRepository,
      logger: mockLogger
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('debería obtener una suscripción por su ID correctamente', async () => {
    const subscriptionId = 'sub_123';
    const mockSubscription = {
      id: subscriptionId,
      customerId: 'cus_123',
      status: 'active',
      plan: { id: 'plan_123', name: 'Monthly Plan' }
    };
    
    mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
    
    const result = await useCase.execute(subscriptionId);
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(subscriptionId);
    expect(result).toEqual(mockSubscription);
  });
  
  it('debería retornar null si la suscripción no existe', async () => {
    mockSubscriptionRepository.findById.mockResolvedValue(null);
    
    const result = await useCase.execute('non_existent_id');
    
    expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith('non_existent_id');
    expect(result).toBeNull();
  });
  
  it('debería manejar errores correctamente', async () => {
    const error = new Error('DB error');
    mockSubscriptionRepository.findById.mockRejectedValue(error);
    
    await expect(useCase.execute('sub_123')).rejects.toThrow('DB error');
    expect(mockLogger.error).toHaveBeenCalledWith(`Error getting subscription by id: ${error.message}`);
  });
}); 