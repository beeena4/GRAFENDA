const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const ServicePackage = require('../models/ServicePackage');
const {
  sendSuccess,
  sendError,
  buildSearchFilters,
  getPaginationData
} = require('../utils/helpers');

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
        pagination: getPaginationData(
          page,
          limit,
          result.pagination.total
        ),
        filters
      };

      sendSuccess(
        res,
        'Services retrieved successfully',
        response
      );

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
        return sendError(
          res,
          'Service not found',
          404
        );
      }

      // Get packages
      const packages =
        await ServicePackage.findByServiceId(id);

      const response = {
        ...service,
        packages
      };

      sendSuccess(
        res,
        'Service details retrieved successfully',
        response
      );

    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get featured services
  static async getFeaturedServices(req, res) {
    try {
      const limit =
        parseInt(req.query.limit) || 10;

      const services =
        await Service.getFeatured(limit);

      sendSuccess(
        res,
        'Featured services retrieved successfully',
        services
      );

    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Create service
  static async createService(req, res) {
    try {

      // Validation
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return sendError(
          res,
          'Validation failed',
          400,
          errors.array()
        );
      }

      // Seller profile
      const sellerProfile =
        req.user.role === 'seller'
          ? await require('../models/SellerProfile')
              .findByUserId(req.user.id)
          : null;

      const sellerId = sellerProfile?.id;

      if (!sellerId) {
        return sendError(
          res,
          'Seller profile not found',
          404
        );
      }

      const {
        category_id,
        title,
        description,
        tags,
        packages
      } = req.body;

      let parsedPackages = [];
      if (typeof packages === 'string') {
        try {
          parsedPackages = packages ? JSON.parse(packages) : [];
        } catch (parseError) {
          console.warn('CREATE SERVICE: Failed to parse packages JSON', parseError);
          parsedPackages = [];
        }
      } else if (Array.isArray(packages)) {
        parsedPackages = packages;
      }

      let imageUrl = null;
      if (req.files && req.files.length > 0) {
        imageUrl = `/uploads/${req.files[0].filename}`;
      }

      // Create service
      const serviceId =
        await Service.create({
          seller_id: sellerId,
          category_id,
          title,
          description,
          tags,
          image_url: imageUrl
        });

      // Create packages
      if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
        for (const pkg of parsedPackages) {
          await ServicePackage.create({
            service_id: serviceId,
            ...pkg
          });
        }
      }

      const service =
        await Service.findById(serviceId);

      const servicePackages =
        await ServicePackage.findByServiceId(
          serviceId
        );

      sendSuccess(
        res,
        'Service created successfully',
        {
          ...service,
          packages: servicePackages
        },
        201
      );

    } catch (error) {

      console.error(
        'CREATE SERVICE ERROR:',
        error
      );

      sendError(
        res,
        error.message || 'Internal server error',
        500
      );
    }
  }

  // Update service
  static async updateService(req, res) {
    try {

      // Validation
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return sendError(
          res,
          'Validation failed',
          400,
          errors.array()
        );
      }

      const { id } = req.params;

      // Seller profile
      const sellerProfile =
        req.user.role === 'seller'
          ? await require('../models/SellerProfile')
              .findByUserId(req.user.id)
          : null;

      const sellerId = sellerProfile?.id;

      if (!sellerId) {
        return sendError(
          res,
          'Seller profile not found',
          404
        );
      }

      // Check ownership
      const service =
        await Service.findByIdAny(id);


      if (
        !service ||
        service.seller_id !== sellerId
      ) {
        return sendError(
          res,
          'Service not found or access denied',
          404
        );
      }

      // Frontend data
      const updateData = { ...req.body };
      if (typeof updateData.packages === 'string') {
        try {
          updateData.packages = updateData.packages ? JSON.parse(updateData.packages) : [];
        } catch (parseError) {
          console.warn('UPDATE SERVICE: Failed to parse packages JSON', parseError);
          updateData.packages = [];
        }
      } else if (!Array.isArray(updateData.packages)) {
        updateData.packages = updateData.packages || [];
      }

      if (req.files && req.files.length > 0) {
        updateData.image_url = `/uploads/${req.files[0].filename}`;
      }

      console.log(
        'REQ BODY UPDATE:',
        updateData
      );

      // Update
      await Service.update(id, updateData);

      // Update packages jika ada
      if (Array.isArray(updateData.packages) && updateData.packages.length > 0) {

        // Hapus package lama
        await ServicePackage.deleteByServiceId(id);

        // Insert package baru
        for (const pkg of updateData.packages) {
          await ServicePackage.create({
            service_id: id,
            ...pkg
          });
        }
      }

      // Get updated service
      const updatedService =
        await Service.findById(id);

      sendSuccess(
        res,
        'Service updated successfully',
        updatedService
      );

    } catch (error) {

      console.error(
        'UPDATE SERVICE ERROR:',
        error
      );

      sendError(
        res,
        error.message || 'Internal server error',
        500
      );
    }
  }

  // Delete service
  static async deleteService(req, res) {
    try {

      const { id } = req.params;

      const sellerProfile =
        req.user.role === 'seller'
          ? await require('../models/SellerProfile')
              .findByUserId(req.user.id)
          : null;

      const sellerId = sellerProfile?.id;

      if (!sellerId) {
        return sendError(
          res,
          'Seller profile not found',
          404
        );
      }

      // Check ownership
      const service =
        await Service.findById(id);

      if (
        !service ||
        service.seller_id !== sellerId
      ) {
        return sendError(
          res,
          'Service not found or access denied',
          404
        );
      }

      await Service.delete(id);

      sendSuccess(
        res,
        'Service deleted successfully'
      );

    } catch (error) {

      console.error(
        'DELETE SERVICE ERROR:',
        error
      );

      sendError(
        res,
        error.message || 'Internal server error',
        500
      );
    }
  }

  // Get seller services
  static async getSellerServices(req, res) {
    try {

      const page =
        parseInt(req.query.page) || 1;

      const limit =
        parseInt(req.query.limit) || 10;

      const sellerProfile =
        req.user.role === 'seller'
          ? await require('../models/SellerProfile')
              .findByUserId(req.user.id)
          : null;

      const sellerId = sellerProfile?.id;

      if (!sellerId) {
        return sendError(
          res,
          'Seller profile not found',
          404
        );
      }

      const result =
        await Service.findBySellerId(
          sellerId,
          page,
          limit
        );

      const response = {
        services: result.services,
        pagination: getPaginationData(
          page,
          limit,
          result.pagination.total
        )
      };

      sendSuccess(
        res,
        'Seller services retrieved successfully',
        response
      );

    } catch (error) {

      console.error(
        'GET SELLER SERVICES ERROR:',
        error
      );

      sendError(
        res,
        error.message || 'Internal server error',
        500
      );
    }
  }

  // Upload or replace service image
  static async uploadServiceImage(req, res) {
    try {
      const { id } = req.params;

      const sellerProfile =
        req.user.role === 'seller'
          ? await require('../models/SellerProfile')
              .findByUserId(req.user.id)
          : null;

      const sellerId = sellerProfile?.id;

      if (!sellerId) {
        return sendError(
          res,
          'Seller profile not found',
          404
        );
      }

      const service = await Service.findByIdAny(id);
      if (!service || service.seller_id !== sellerId) {
        return sendError(
          res,
          'Service not found or access denied',
          404
        );
      }

      if (!req.files || req.files.length === 0) {
        return sendError(
          res,
          'No image uploaded',
          400
        );
      }

      const imageUrl = `/uploads/${req.files[0].filename}`;
      await Service.updateImage(id, imageUrl);

      const updatedService = await Service.findById(id);

      sendSuccess(
        res,
        'Service image uploaded successfully',
        updatedService
      );
    } catch (error) {
      console.error('UPLOAD SERVICE IMAGE ERROR:', error);
      sendError(
        res,
        error.message || 'Internal server error',
        500
      );
    }
  }
}

module.exports = ServiceController;