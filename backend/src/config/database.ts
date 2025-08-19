import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database file path
const dbPath = path.join(__dirname, '../../database/appointments.db');

// Database connection
let db: any;

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    db = new Database(dbPath);
    
    console.log('✅ SQLite database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Get database connection
export const getConnection = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Create tables
const createTables = async () => {
  try {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        user_type TEXT CHECK(user_type IN ('consultant', 'client')) NOT NULL,
        is_verified INTEGER DEFAULT 1,
        phone TEXT,
        expertise TEXT,
        hourly_rate REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backward compatibility: ensure new columns exist on older databases
    try { db.exec("ALTER TABLE users ADD COLUMN expertise TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN hourly_rate REAL"); } catch (e) {}

    // Appointments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consultant_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed', 'expired')) DEFAULT 'pending',
        notes TEXT,
        meeting_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consultant_id) REFERENCES users(id),
        FOREIGN KEY (client_id) REFERENCES users(id)
      )
    `);

    // Backward compatibility: ensure new columns exist on older databases
    try { db.exec("ALTER TABLE appointments ADD COLUMN meeting_link TEXT"); } catch (e) {}

    // Notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT CHECK(type IN ('appointment', 'system', 'reminder')) NOT NULL,
        is_read INTEGER DEFAULT 0,
        appointment_id INTEGER,
        action_required INTEGER DEFAULT 0,
        action_type TEXT CHECK(action_type IN ('approve', 'reject', 'reschedule')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
      )
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_appointments_consultant_id ON appointments(consultant_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');

    console.log('✅ SQLite tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async () => {
  if (db) {
    db.close();
    console.log('✅ Database connection closed');
  }
};

// Database wrapper that ensures initialization
const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

// Export the database wrapper for models to use
export default getDatabase; 