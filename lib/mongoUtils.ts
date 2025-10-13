import { Types, Document } from 'mongoose'

// Utility function to safely convert MongoDB document to plain object with string ID
export function mongoDocToObject<T extends Document & { _id: Types.ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
  const obj = doc.toObject()
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined
  }
}

// Utility function for lean queries that return plain objects
export function mongoLeanToObject<T extends { _id: Types.ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
  return {
    ...doc,
    id: doc._id.toString(),
    _id: undefined
  }
}

// Type-safe ObjectId validation
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id)
}

// Convert string to ObjectId
export function stringToObjectId(id: string): Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`)
  }
  return new Types.ObjectId(id)
}