/**
 * IndexedDB Database — Dexie.js wrapper
 * 
 * Two tables:
 * 1. operations — queued offline mutations
 * 2. entities — cached domain objects with conflict resolution
 */

import Dexie from 'dexie';

export const db = new Dexie('bsv-pwa-db');

db.version(1).stores({
  // Operations queue for offline mutations
  operations: '++id, timestamp, status, entityType, entityId',
  
  // Cached entities with composite key
  entities: '[entityType+id], entityType, updatedAt, syncedAt, isDirty',
});

/**
 * Operation status enum
 */
export const OperationStatus = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  FAILED: 'failed',
};

/**
 * Entity types enum
 */
export const EntityType = {
  TICKET: 'ticket',
  USER: 'user',
  PERSONNEL: 'personnel',
  TIMELINE: 'timeline',
};

/**
 * Add an operation to the queue
 * @param {Object} operation
 * @param {string} operation.method - HTTP method (POST, PUT, PATCH, DELETE)
 * @param {string} operation.url - API endpoint
 * @param {Object} operation.body - Request body
 * @param {Object} operation.headers - Request headers
 * @param {string} operation.entityType - Entity type
 * @param {string|number} operation.entityId - Entity ID
 * @returns {Promise<number>} Operation ID
 */
export async function addOperation(operation) {
  return await db.operations.add({
    ...operation,
    timestamp: Date.now(),
    retryCount: 0,
    status: OperationStatus.PENDING,
  });
}

/**
 * Get all pending operations ordered by timestamp
 * @returns {Promise<Array>}
 */
export async function getPendingOperations() {
  return await db.operations
    .where('status')
    .equals(OperationStatus.PENDING)
    .sortBy('timestamp');
}

/**
 * Update operation status
 * @param {number} id - Operation ID
 * @param {string} status - New status
 * @returns {Promise<number>}
 */
export async function updateOperationStatus(id, status) {
  return await db.operations.update(id, { status });
}

/**
 * Delete operation
 * @param {number} id - Operation ID
 * @returns {Promise<void>}
 */
export async function deleteOperation(id) {
  return await db.operations.delete(id);
}

/**
 * Increment retry count
 * @param {number} id - Operation ID
 * @returns {Promise<number>}
 */
export async function incrementRetryCount(id) {
  const op = await db.operations.get(id);
  if (op) {
    return await db.operations.update(id, { retryCount: (op.retryCount || 0) + 1 });
  }
}

/**
 * Save entity to cache
 * @param {string} entityType - Entity type
 * @param {string|number} id - Entity ID
 * @param {Object} data - Entity data
 * @param {number} version - Version number for conflict resolution
 * @param {boolean} isDirty - Has local unsynced changes
 * @returns {Promise<void>}
 */
export async function saveEntity(entityType, id, data, version = 1, isDirty = false) {
  const now = Date.now();
  return await db.entities.put({
    entityType,
    id: String(id),
    data,
    version,
    updatedAt: now,
    syncedAt: isDirty ? null : now,
    isDirty,
  });
}

/**
 * Get entity from cache
 * @param {string} entityType - Entity type
 * @param {string|number} id - Entity ID
 * @returns {Promise<Object|undefined>}
 */
export async function getEntity(entityType, id) {
  return await db.entities.get([entityType, String(id)]);
}

/**
 * Get all entities of a type
 * @param {string} entityType - Entity type
 * @returns {Promise<Array>}
 */
export async function getEntitiesByType(entityType) {
  return await db.entities.where('entityType').equals(entityType).toArray();
}

/**
 * Get all dirty entities (with unsynced changes)
 * @returns {Promise<Array>}
 */
export async function getDirtyEntities() {
  return await db.entities.where('isDirty').equals(1).toArray();
}

/**
 * Delete entity from cache
 * @param {string} entityType - Entity type
 * @param {string|number} id - Entity ID
 * @returns {Promise<void>}
 */
export async function deleteEntity(entityType, id) {
  return await db.entities.delete([entityType, String(id)]);
}

/**
 * Clear all cached entities (use with caution)
 * @returns {Promise<void>}
 */
export async function clearAllEntities() {
  return await db.entities.clear();
}

/**
 * Clear all operations (use with caution)
 * @returns {Promise<void>}
 */
export async function clearAllOperations() {
  return await db.operations.clear();
}

export default db;
