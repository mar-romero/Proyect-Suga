const mongoose = require('mongoose');

class BaseRepository {
  constructor({ logger, dbConnection, model, entityClass }) {
    this.logger = logger;
    this.dbConnection = dbConnection;
    this.model = model;
    this.entityClass = entityClass;
  }

  async findById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        this.logger.warn(`Invalid id format: ${id}`);
        return null;
      }
      
      const doc = await this.model.findById(id);
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      this.logger.error(`Error finding document by id: ${error.message}`);
      throw error;
    }
  }

  async findOne(filter) {
    try {
      const doc = await this.model.findOne(filter);
      if (!doc) return null;
      return this._mapToEntity(doc);
    } catch (error) {
      this.logger.error(`Error finding document: ${error.message}`);
      throw error;
    }
  }

  async findAll(filter = {}) {
    try {
      const docs = await this.model.find(filter);
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      this.logger.error(`Error finding documents: ${error.message}`);
      throw error;
    }
  }

  async create(data) {
    try {
      const newDoc = new this.model({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedDoc = await newDoc.save();
      return this._mapToEntity(savedDoc);
    } catch (error) {
      this.logger.error(`Error creating document: ${error.message}`);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      this.logger.info(`Updating document with id: ${id}`);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid document id: ${id}`);
      }

      const updatedDoc = await this.model.findByIdAndUpdate(
        id,
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          } 
        },
        { new: true } 
      );

      if (!updatedDoc) {
        this.logger.warn(`Document with id ${id} not found for update`);
        return null;
      }

      this.logger.info(`Successfully updated document with id: ${id}`);
      return this._mapToEntity(updatedDoc);
    } catch (error) {
      this.logger.error(`Error updating document with id ${id}: ${error.message}`);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid document id: ${id}`);
      }
      
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      this.logger.error(`Error deleting document with id ${id}: ${error.message}`);
      throw error;
    }
  }

  async createWithSession(data, session) {
    try {
      const newDoc = new this.model({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedDoc = await newDoc.save({ session });
      return this._mapToEntity(savedDoc);
    } catch (error) {
      this.logger.error(`Error creating document with session: ${error.message}`);
      throw error;
    }
  }
  
  async updateWithSession(id, updateData, session) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid document id: ${id}`);
      }
  
      const updatedDoc = await this.model.findByIdAndUpdate(
        id,
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          } 
        },
        { new: true, session }
      );
  
      if (!updatedDoc) {
        return null;
      }
  
      return this._mapToEntity(updatedDoc);
    } catch (error) {
      this.logger.error(`Error updating document with session: ${error.message}`);
      throw error;
    }
  }
  
  async bulkWrite(operations) {
    try {
      const result = await this.model.bulkWrite(operations);
      return result;
    } catch (error) {
      this.logger.error(`Error performing bulk operations: ${error.message}`);
      throw error;
    }
  }

  _mapToEntity(doc) {
    const rawData = doc.toObject ? doc.toObject() : doc;
    return new this.entityClass({
      id: rawData._id.toString(),
      ...rawData,
      _id: undefined
    });
  }
}

module.exports = BaseRepository;
