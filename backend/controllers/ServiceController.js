const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const ServicePackage = require('../models/ServicePackage');
const { sendSuccess, sendError, buildSearchFilters, getPaginationData } = require('../utils/helpers');

class ServiceController {
  // Get all services with search and filters
  static async getServices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = buildSearchFilters(req.query);

      const result = await Service.search(filters, page, limit);

      const response = {
        services: result.services,
        pagination: getPaginationData(page, limit, result.pagination.total),
        filters: filters
      };

      sendSuccess(res, 'Services retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get service details
  static async getServiceById(req, res) {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);
      if (!service) {
        return sendError(res, 'Service not found', 404);
      }

      // Get service packages
      const packages = await ServicePackage.findByServiceId(id);

      const response = {
        ...service,
        packages
      };

      sendSuccess(res, 'Service details retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get featured services
  static async getFeaturedServices(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const services = await Service.getFeatured(limit);

      sendSuccess(res, 'Featured services retrieved successfully', services);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Create service (seller only)
  static async createService(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const sellerId = req.user.role === 'seller' ? 
        (await require('../models/SellerProfile').findByUserId(req.user.id)).id : null;

      if (!sellerId) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const { category_id, title, description, tags, packages } = req.body;

      // Create service
      const serviceId = await Service.create({
        seller_id: sellerId,
        category_id,
        title,
        description,
        tags
      });

      // Create service packages
      if (packages && packages.length > 0) {
        for (const pkg of packages) {
          await ServicePackage.create({
            service_id: serviceId,
            ...pkg
          });
        }
      }

      const service = await Service.findById(serviceId);
      const servicePackages = await ServicePackage.findByServiceId(serviceId);

      sendSuccess(res, 'Service created successfully', {
        ...service,
        packages: servicePackages
      }, 201);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Update service (seller only)
  static async updateService(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const sellerId = req.user.role === 'seller' ? 
        (await require('../models/SellerProfile').findByUserId(req.user.id)).id : null;

      if (!sellerId) {
        return sendError(res, 'Seller profile not found', 404);
      }

      // Check if service belongs to seller
      const service = await Service.findById(id);
      if (!service || service.seller_id !== sellerId) {
        return sendError(res, 'Service not found or access denied', 404);
      }

      const updateData = req.body;
      await Service.update(id, updateData);

      const updatedService = await Service.findById(id);
      sendSuccess(res, 'Service updated successfully', updatedService);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Delete service (seller only)
  static async deleteService(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.user.role === 'seller' ? 
        (await require('../models/SellerProfile').findByUserId(req.user.id)).id : null;

      if (!sellerId) {
        return sendError(res, 'Seller profile not found', 404);
      }

      // Check if service belongs to seller
      const service = await Service.findById(id);
      if (!service || service.seller_id !== sellerId) {
        return sendError(res, 'Service not found or access denied', 404);
      }

      await Service.delete(id);
      sendSuccess(res, 'Service deleted successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get seller's services
  static async getSellerServices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const sellerId = req.user.role === 'seller' ? 
        (await require('../models/SellerProfile').findByUserId(req.user.id)).id : null;

      if (!sellerId) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const result = await Service.findBySellerId(sellerId, page, limit);

      const response = {
        services: result.services,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Seller services retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = ServiceController;