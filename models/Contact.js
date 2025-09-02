const db = require('../config/database');

class Contact {
  // Create a new contact message
  static async create(contactData) {
    const { name, email, subject, message } = contactData;
    const query = `
      INSERT INTO contact_messages (name, email, subject, message) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, email, subject, message]);
    return result.insertId;
  }

  // Get all contact messages
  static async findAll() {
    const query = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Get contact message by ID
  static async findById(id) {
    const query = 'SELECT * FROM contact_messages WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Update contact message
  static async update(id, contactData) {
    const { name, email, subject, message } = contactData;
    const query = `
      UPDATE contact_messages 
      SET name = ?, email = ?, subject = ?, message = ? 
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [name, email, subject, message, id]);
    return result.affectedRows > 0;
  }

  // Delete contact message
  static async delete(id) {
    const query = 'DELETE FROM contact_messages WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get messages by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM contact_messages WHERE email = ? ORDER BY created_at DESC';
    const [rows] = await db.execute(query, [email]);
    return rows;
  }
}

module.exports = Contact;
