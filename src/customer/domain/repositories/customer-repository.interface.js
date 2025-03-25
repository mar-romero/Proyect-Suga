
/**
 
 * 
 * @interface
 */
class ICustomerRepository {
  /**
   * @param {string} id 
   * @returns {Promise<Customer|null>} 
   */
  findById(id) {
    throw new Error('ICustomerRepository.findById must be implemented by subclasses');
  }
  
  /**

   * @param {string} email 
   * @returns {Promise<Customer|null>}
   */
  findByEmail(email) {
    throw new Error('ICustomerRepository.findByEmail must be implemented by subclasses');
  }
  
  /**
   * @param {Object} customerData
   * @returns {Promise<Customer>}
   */
  create(customerData) {
    throw new Error('ICustomerRepository.create must be implemented by subclasses');
  }
  
  /**
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Customer|null>}
   */
  update(id, updateData) {
    throw new Error('ICustomerRepository.update must be implemented by subclasses');
  }
  
  /**
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  delete(id) {
    throw new Error('ICustomerRepository.delete must be implemented by subclasses');
  }
}

module.exports = ICustomerRepository;
