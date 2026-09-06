import { getDb } from "../db/index.js";

export async function getCategories() {
  const db = getDb();
  return db.prepare("SELECT * FROM categories").all();
}

export async function getCategoryById(id) {
  const db = getDb();
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) || null;
}

export async function searchCategories(query) {
  if (!query) return [];
  const q = `%${query.toLowerCase()}%`;
  const db = getDb();
  return db.prepare("SELECT * FROM categories WHERE name LIKE ?").all(q);
}
