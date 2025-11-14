import mongoose from 'mongoose';
import Ad from '../models/Ad.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const checkAds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');
    
    const ads = await Ad.find({ isActive: true });
    console.log(`✅ Found ${ads.length} active ads in database\n`);
    
    if (ads.length > 0) {
      console.log('Sample ad:');
      console.log(JSON.stringify(ads[0], null, 2));
    } else {
      console.log('⚠️  No ads found! Run seedAds.js to populate database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkAds();
