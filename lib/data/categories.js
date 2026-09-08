import { getDb, globiqDb } from "../db/index.js";

export async function getCategories() {
  return globiqDb.getCategories();
}

export async function getCategoryById(id) {
  return globiqDb.getCategory(id) || null;
}

export async function searchCategories(query) {
  if (!query) return [];
  const q = `%${query.toLowerCase()}%`;
  const db = getDb();
  return db.prepare("SELECT * FROM categories WHERE name LIKE ?").all(q);
}
