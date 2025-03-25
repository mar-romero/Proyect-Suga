class Customer {
    constructor({
      id,
      name,
      email,
      phone,
      address,
      status,
      createdAt,
      updatedAt
    }) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.address = address;
      this.status = status;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  }
  
  module.exports = Customer;
  