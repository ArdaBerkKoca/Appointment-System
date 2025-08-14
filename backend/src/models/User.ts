import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User, CreateUserRequest } from '../types';

export class UserModel {
  static async create(userData: CreateUserRequest): Promise<User> {
    const { email, password, full_name, user_type, phone } = userData;
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, user_type, phone, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, passwordHash, full_name, user_type, phone || null, 1);
    
    // Get the created user
    const createdUser = await this.findById(result.lastInsertRowid as number);
    if (!createdUser) {
      throw new Error('Failed to create user');
    }
    return createdUser;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | undefined;
    
    return user || null;
  }

  static async findById(id: number): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    
    return user || null;
  }

  static async update(id: number, updateData: Partial<User>): Promise<User | null> {
    const fields = Object.keys(updateData).filter(key => key !== 'id' && key !== 'password_hash');
    const values = fields.map(field => (updateData as any)[field] ?? null);
    
    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;
    
    const stmt = db.prepare(query);
    const result = stmt.run(...values, id);
    
    if (result.changes > 0) {
      return this.findById(id);
    }
    return null;
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    const result = stmt.run(passwordHash, id);
    
    return result.changes > 0;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    const stmt = db.prepare('SELECT password_hash FROM users WHERE id = ?');
    const result = stmt.get(user.id) as { password_hash: string } | undefined;
    
    if (!result) {
      return false;
    }
    
    return bcrypt.compare(password, result.password_hash);
  }

  static async getConsultants(): Promise<User[]> {
    const stmt = db.prepare(`
      SELECT id, email, full_name, user_type, created_at
      FROM users 
      WHERE user_type = 'consultant'
      ORDER BY full_name
    `);
    
    return stmt.all() as User[];
  }

  static async delete(id: number): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }
} 