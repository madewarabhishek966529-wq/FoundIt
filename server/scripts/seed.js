import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Item } from '../src/models/Item.js';

const seed = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clear existing data in dev
    console.log('[Seed] Cleaning collections...');
    await User.deleteMany({});
    await Item.deleteMany({});

    // Create Admin User
    const adminPasswordHash = await bcrypt.hash('admin12345', 12);
    const admin = await User.create({
      name: 'Security Admin',
      email: env.ALLOWED_EMAIL_DOMAIN === '*' ? 'admin@foundit.edu' : `admin@${env.ALLOWED_EMAIL_DOMAIN}`,
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Campus Security',
      phone: '9876543210'
    });

    // Create Demo Student 1
    const student1PasswordHash = await bcrypt.hash('password123', 12);
    const student1 = await User.create({
      name: 'Alex Johnson',
      email: env.ALLOWED_EMAIL_DOMAIN === '*' ? 'alex@foundit.edu' : `alex@${env.ALLOWED_EMAIL_DOMAIN}`,
      passwordHash: student1PasswordHash,
      role: 'student',
      department: 'Computer Science',
      phone: '9876543211'
    });

    // Create Demo Student 2
    const student2PasswordHash = await bcrypt.hash('password123', 12);
    const student2 = await User.create({
      name: 'Priya Sharma',
      email: env.ALLOWED_EMAIL_DOMAIN === '*' ? 'priya@foundit.edu' : `priya@${env.ALLOWED_EMAIL_DOMAIN}`,
      passwordHash: student2PasswordHash,
      role: 'student',
      department: 'Mechanical Eng',
      phone: '9876543212'
    });

    console.log(`[Seed] Created users: ${admin.email}, ${student1.email}, ${student2.email}`);

    // Create sample lost item
    const lostPhone = await Item.create({
      type: 'lost',
      title: 'Midnight Blue iPhone 13 in black bumper case',
      description: 'Lost my iPhone 13 during morning lecture. Has a clear bumper case with a sticker of Rick & Morty on the back.',
      category: 'phone',
      zone: 'CS Dept',
      dateEvent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      color: 'Midnight Blue',
      brand: 'Apple',
      reporter: student1._id,
      status: 'open',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=60',
          publicId: 'seed-lost-iphone'
        }
      ]
    });

    // Create sample found item
    const foundPhone = await Item.create({
      type: 'found',
      title: 'Found dark blue iPhone near 2nd floor lab',
      description: 'Found a smartphone on the bench near CS Lab 2. Turned over to security desk.',
      category: 'phone',
      zone: 'CS Dept',
      dateEvent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      color: 'Dark Blue',
      brand: 'Apple',
      reporter: student2._id,
      status: 'open',
      heldAtDesk: true,
      verificationQuestion: 'What sticker is on the back of the case?',
      verificationAnswerHash: '96cae35ce8a9b0244178bf1b006608a3f73f5496997085fb57954572595841cc', // "rick and morty"
      images: [
        {
          url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60',
          publicId: 'seed-found-iphone'
        }
      ]
    });

    // Create sample lost keys
    await Item.create({
      type: 'lost',
      title: 'Hostel room keys with iron man keychain',
      description: 'Bunch of 3 keys with a metallic Iron Man helmet keychain attached.',
      category: 'keys',
      zone: 'Hostel A',
      dateEvent: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      color: 'Silver / Metallic',
      reporter: student2._id,
      status: 'open'
    });

    console.log('[Seed] Database successfully seeded with demo users and items!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seed();
