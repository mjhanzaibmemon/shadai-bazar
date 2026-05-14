#!/usr/bin/env node
import mongoose from 'mongoose';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI env var first');
  process.exit(1);
}

await mongoose.connect(uri);
const User = mongoose.connection.collection('users');
const result = await User.updateOne(
  { email: email.toLowerCase() },
  { $set: { role: 'admin' } }
);
console.log(
  result.matchedCount ? `✓ ${email} is now admin` : `✗ User not found: ${email}`
);
await mongoose.disconnect();
