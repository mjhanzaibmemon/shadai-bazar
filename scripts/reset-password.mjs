#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-password.mjs <email> <new-password>');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI env var first');
  process.exit(1);
}

await mongoose.connect(uri);
const Users = mongoose.connection.collection('users');

const hashed = await bcrypt.hash(newPassword, 10);
const result = await Users.updateOne(
  { email: email.toLowerCase() },
  { $set: { password: hashed } }
);

console.log(
  result.matchedCount ? `✓ Password reset for ${email}` : `✗ User not found: ${email}`
);
await mongoose.disconnect();
