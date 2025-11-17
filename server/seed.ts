#!/usr/bin/env npx tsx
// @ts-ignore
import bcrypt from 'bcryptjs';
import { initializeMongoDB, getCollection, COLLECTIONS } from './mongoDb';
import type { User } from '@shared/mongoSchema';
import dotenv from 'dotenv';

dotenv.config();

interface SeedAdminData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  matricNumber?: string;
}

class AdminSeeder {
  private async createAdminUser(adminData: SeedAdminData): Promise<User> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ 
      $or: [
        { email: adminData.email },
        { role: 'admin' }
      ]
    });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists with email: ${existingAdmin.email}`);
      return { ...existingAdmin, _id: existingAdmin._id.toString() };
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 12);
    
    // Create admin user document
    const adminDoc: Omit<User, '_id'> = {
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      matricNumber: adminData.matricNumber,
      gender: undefined,
      location: undefined,
      address: undefined,
      phoneNumber: undefined,
      level: undefined,
      occupation: 'Administrator',
      role: 'super_admin',
      approvalStatus: 'approved', // Auto-approve admin
      profileCompletion: 80, // High completion for admin
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await usersCollection.insertOne(adminDoc as any);
    const newAdmin = await usersCollection.findOne({ _id: result.insertedId });
    
    if (!newAdmin) {
      throw new Error('Failed to create admin user');
    }
    
    return { ...newAdmin, _id: newAdmin._id.toString() };
  }

  async seedDefaultAdmin(): Promise<User> {
    try {
      console.log('🌱 Starting admin user seeding...');
      
      // Initialize MongoDB connection
      await initializeMongoDB();
      
      // Default admin credentials
      const defaultAdmin: SeedAdminData = {
        email: 'admin@nsasa.edu.ng',
        password: 'admin123!', // Change this in production!
        firstName: 'System',
        lastName: 'Administrator',
        matricNumber: 'ADM/ADMIN/001',
      };
      
      const admin = await this.createAdminUser(defaultAdmin);
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password: admin123! (PLEASE CHANGE THIS!)');
      console.log('👤 Role:', admin.role);
      console.log('✅ Status:', admin.approvalStatus);
      console.log();
      console.log('🚨 IMPORTANT: Change the default password immediately after first login!');
      
      return admin;
    } catch (error) {
      console.error('❌ Failed to seed admin user:', error);
      throw error;
    }
  }

  async seedCustomAdmin(email: string, password: string, firstName: string, lastName: string, matricNumber?: string): Promise<User> {
    try {
      console.log('🌱 Creating custom admin user...');
      
      // Initialize MongoDB connection
      await initializeMongoDB();
      
      const customAdmin: SeedAdminData = {
        email,
        password,
        firstName,
        lastName,
        matricNumber,
      };
      
      const admin = await this.createAdminUser(customAdmin);
      
      console.log('✅ Custom admin user created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', `${admin.firstName} ${admin.lastName}`);
      console.log('🔑 Role:', admin.role);
      console.log('✅ Status:', admin.approvalStatus);
      
      return admin;
    } catch (error) {
      console.error('❌ Failed to create custom admin user:', error);
      throw error;
    }
  }
}

// Command line interface
async function main() {
  const seeder = new AdminSeeder();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Seed default admin
    await seeder.seedDefaultAdmin();
  } else if (args.length >= 4) {
    // Seed custom admin: email password firstName lastName [matricNumber]
    const [email, password, firstName, lastName, matricNumber] = args;
    await seeder.seedCustomAdmin(email, password, firstName, lastName, matricNumber);
  } else {
    console.log('Usage:');
    console.log('  npm run seed:admin                              # Create default admin');
    console.log('  npm run seed:admin email pass firstName lastName [matricNumber]  # Create custom admin');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

export { AdminSeeder };