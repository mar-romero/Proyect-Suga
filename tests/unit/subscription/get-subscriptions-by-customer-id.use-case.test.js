const GetSubscriptionsByCustomerIdUseCase = require('../../../src/suscription/application/use-case/get-subscriptions-by-customer-id.use-case');

describe('GetSubscriptionsByCustomerIdUseCase', () => {
  let useCase;
  let mockSubscriptionRepository;
  let mockLogger;
  
  beforeEach(() => {
    mockSubscriptionRepository = {
      findByCustomerId: jest.fn()
    };
    
    mockLogger = {
      error: jest.fn()
    };
    
    useCase = new GetSubscriptionsByCustomerIdUseCase({
      subscriptionRepository: mockSubscriptionRepository,
      logger: mockLogger
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('debería obtener las suscripciones de un cliente correctamente', async () => {
    const customerId = 'cus_123';
    const mockSubscriptions = [
      {
        id: 'sub_123',
        customerId: customerId,
        status: 'active',
        plan: { id: 'plan_123', name: 'Monthly Plan' }
      },
      {
        id: 'sub_456',
        customerId: customerId,
        status: 'canceled',
        plan: { id: 'plan_456', name: 'Annual Plan' }
      }
    ];
    
    mockSubscriptionRepository.findByCustomerId.mockResolvedValue(mockSubscriptions);
    
    const result = await useCase.execute(customerId);
    
    expect(mockSubscriptionRepository.findByCustomerId).toHaveBeenCalledWith(customerId);
    expect(result).toEqual(mockSubscriptions);
    expect(result.length).toBe(2);
  });
  
  it('debería retornar un array vacío si el cliente no tiene suscripciones', async () => {
    mockSubscriptionRepository.findByCustomerId.mockResolvedValue([]);
    
    const result = await useCase.execute('cus_456');
    
    expect(mockSubscriptionRepository.findByCustomerId).toHaveBeenCalledWith('cus_456');
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
  
  it('debería manejar errores correctamente', async () => {
    const error = new Error('DB error');
    mockSubscriptionRepository.findByCustomerId.mockRejectedValue(error);
    
    await expect(useCase.execute('cus_123')).rejects.toThrow('DB error');
    expect(mockLogger.error).toHaveBeenCalledWith(`Error getting subscriptions by client id: ${error.message}`);
  });
}); 