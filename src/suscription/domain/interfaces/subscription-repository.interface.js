
/**

 * @interface
 */
class ISubscriptionRepository {
  /**
   * @param {string} id 
   * @returns {Promise<Subscription|null>} 
   */
  findById(id) {
    throw new Error('ISubscriptionRepository.findById must be implemented by subclasses');
  }
  
  /**
   * @param {string} customerId 
   * @returns {Promise<Array<Subscription>>} 
   */
  findByCustomerId(customerId) {
    throw new Error('ISubscriptionRepository.findByCustomerId must be implemented by subclasses');
  }
  
  /**
   * @param {Object} subscriptionData 
   * @returns {Promise<Subscription>} 
   */
  create(subscriptionData) {
    throw new Error('ISubscriptionRepository.create must be implemented by subclasses');
  }
  
  /**
   * @param {string} id
   * @param {Object} updateData 
   * @returns {Promise<Subscription|null>} 
   */
  update(id, updateData) {
    throw new Error('ISubscriptionRepository.update must be implemented by subclasses');
  }
  
  /**
   * @param {string} id 
   * @returns {Promise<boolean>} 
   */
  delete(id) {
    throw new Error('ISubscriptionRepository.delete must be implemented by subclasses');
  }
  
  /**
   * @param {string} status 
   * @returns {Promise<Array<Subscription>>}
   */
  findByStatus(status) {
    throw new Error('ISubscriptionRepository.findByStatus must be implemented by subclasses');
  }
  
  /**
   * @param {Date} startDate 
   * @param {Date} endDate
   * @returns {Promise<Array<Subscription>>}
   */
  findExpiringBetweenDates(startDate, endDate) {
    throw new Error('ISubscriptionRepository.findExpiringBetweenDates must be implemented by subclasses');
  }
}

module.exports = ISubscriptionRepository;
