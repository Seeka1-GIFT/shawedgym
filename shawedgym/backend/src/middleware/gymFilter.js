// Middleware to filter data by gym_id for multi-tenancy
const pool = require('../config/database');

const gymFilter = (req, res, next) => {
  // Skip gym filtering for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Skip gym filtering for public routes
  const publicRoutes = ['/api/auth', '/api/gyms/plans', '/api/database/setup'];
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Get gym_id from user
  const gymId = req.user?.gym_id;
  
  if (!gymId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Gym access not configured'
    });
  }

  // Add gym_id to request for use in controllers
  req.gymId = gymId;
  
  next();
};

// Middleware to add gym_id to database queries
const addGymFilter = (req, res, next) => {
  if (req.gymId) {
    // Add gym_id filter to common query patterns
    req.gymFilter = `WHERE gym_id = ${req.gymId}`;
    req.gymFilterParams = [req.gymId];
  }
  next();
};

// Helper function to add gym_id to INSERT queries
const addGymIdToInsert = (data, gymId) => {
  if (gymId && !data.gym_id) {
    return { ...data, gym_id: gymId };
  }
  return data;
};

// Helper function to add gym_id to UPDATE queries
const addGymIdToUpdate = (data, gymId) => {
  if (gymId && !data.gym_id) {
    return { ...data, gym_id: gymId };
  }
  return data;
};

// Helper function to build WHERE clause with gym_id
const buildGymWhereClause = (baseWhere = '', gymId) => {
  if (!gymId) return baseWhere;
  
  const gymCondition = `gym_id = ${gymId}`;
  
  if (!baseWhere) {
    return `WHERE ${gymCondition}`;
  }
  
  return `${baseWhere} AND ${gymCondition}`;
};

module.exports = {
  gymFilter,
  addGymFilter,
  addGymIdToInsert,
  addGymIdToUpdate,
  buildGymWhereClause
};
