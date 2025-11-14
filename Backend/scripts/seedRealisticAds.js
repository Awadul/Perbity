import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Ad from '../models/Ad.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const icons = ['fa-mobile-screen', 'fa-sim-card', 'fa-graduation-cap', 'fa-bag-shopping', 'fa-laptop-code', 'fa-heart-pulse', 'fa-plane', 'fa-utensils', 'fa-film', 'fa-house-chimney', 'fa-car', 'fa-book', 'fa-gamepad', 'fa-music', 'fa-camera'];
const colors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'indigo', 'orange', 'teal', 'cyan'];

const adTemplates = [
  { title: 'Tech Gadgets', description: 'Latest smartphones and electronics', url: 'https://www.amazon.com/electronics' },
  { title: 'Mobile Packages', description: 'Best mobile data and call packages', url: 'https://www.att.com/plans/' },
  { title: 'Online Learning', description: 'Learn new skills with top courses', url: 'https://www.udemy.com/' },
  { title: 'Shopping Deals', description: 'Incredible deals on fashion', url: 'https://www.ebay.com/deals' },
  { title: 'Freelance Work', description: 'Find freelance jobs and projects', url: 'https://www.upwork.com/' },
  { title: 'Health Products', description: 'Premium health and wellness products', url: 'https://www.iherb.com/' },
  { title: 'Travel Offers', description: 'Best flight and hotel deals', url: 'https://www.booking.com/' },
  { title: 'Food Delivery', description: 'Order your favorite food online', url: 'https://www.ubereats.com/' },
  { title: 'Entertainment', description: 'Stream movies and shows unlimited', url: 'https://www.netflix.com/' },
  { title: 'Home Services', description: 'Professional home repair services', url: 'https://www.taskrabbit.com/' },
  { title: 'Car Insurance', description: 'Get the best car insurance rates', url: 'https://www.geico.com/' },
  { title: 'Online Books', description: 'Read unlimited books online', url: 'https://www.audible.com/' },
  { title: 'Gaming Store', description: 'Latest games and gaming gear', url: 'https://www.gamestop.com/' },
  { title: 'Music Streaming', description: 'Listen to millions of songs', url: 'https://www.spotify.com/' },
  { title: 'Photography', description: 'Professional camera equipment', url: 'https://www.bhphotovideo.com/' },
  { title: 'Fitness Tracker', description: 'Track your health and fitness', url: 'https://www.fitbit.com/' },
  { title: 'Cloud Storage', description: 'Secure cloud storage solutions', url: 'https://www.dropbox.com/' },
  { title: 'Web Hosting', description: 'Reliable web hosting services', url: 'https://www.bluehost.com/' },
  { title: 'VPN Service', description: 'Secure and private browsing', url: 'https://www.nordvpn.com/' },
  { title: 'Meal Kits', description: 'Fresh ingredients delivered', url: 'https://www.hellofresh.com/' },
  { title: 'Fashion Store', description: 'Trendy fashion and accessories', url: 'https://www.zara.com/' },
  { title: 'Pet Supplies', description: 'Everything for your pets', url: 'https://www.chewy.com/' },
  { title: 'Home Decor', description: 'Beautiful home decoration items', url: 'https://www.wayfair.com/' },
  { title: 'Office Supplies', description: 'All your office needs', url: 'https://www.staples.com/' },
  { title: 'Beauty Products', description: 'Premium beauty and skincare', url: 'https://www.sephora.com/' },
  { title: 'Sports Gear', description: 'Quality sports equipment', url: 'https://www.nike.com/' },
  { title: 'Outdoor Adventure', description: 'Camping and hiking gear', url: 'https://www.rei.com/' },
  { title: 'Baby Products', description: 'Safe products for your baby', url: 'https://www.target.com/c/baby/' },
  { title: 'Gardening Tools', description: 'Everything for your garden', url: 'https://www.homedepot.com/garden' },
  { title: 'Smart Home', description: 'Automate your home devices', url: 'https://www.bestbuy.com/smarthome' },
  { title: 'Coffee Shop', description: 'Premium coffee and beverages', url: 'https://www.starbucks.com/' },
  { title: 'Pizza Delivery', description: 'Hot pizza delivered fast', url: 'https://www.dominos.com/' },
  { title: 'Grocery Online', description: 'Fresh groceries delivered', url: 'https://www.walmart.com/grocery' },
  { title: 'Pharmacy', description: 'Medicines and health products', url: 'https://www.cvs.com/' },
  { title: 'Eyewear', description: 'Stylish glasses and sunglasses', url: 'https://www.warbyparker.com/' },
  { title: 'Mattress Store', description: 'Comfortable sleep solutions', url: 'https://www.casper.com/' },
  { title: 'Jewelry Shop', description: 'Elegant jewelry and watches', url: 'https://www.bluenile.com/' },
  { title: 'Shoe Store', description: 'Footwear for every occasion', url: 'https://www.zappos.com/' },
  { title: 'Electronics', description: 'Latest electronic gadgets', url: 'https://www.newegg.com/' },
  { title: 'Toy Store', description: 'Fun toys for all ages', url: 'https://www.toysrus.com/' },
  { title: 'Art Supplies', description: 'Creative art materials', url: 'https://www.michaels.com/' },
  { title: 'Bike Shop', description: 'Quality bicycles and accessories', url: 'https://www.specialized.com/' },
  { title: 'Watch Store', description: 'Premium watches collection', url: 'https://www.fossil.com/' },
  { title: 'Luggage Shop', description: 'Durable travel luggage', url: 'https://www.samsonite.com/' },
  { title: 'Protein Shakes', description: 'Nutrition and supplements', url: 'https://www.gnc.com/' }
];

const realisticAds = adTemplates.map((template, index) => ({
  title: template.title,
  description: template.description,
  url: template.url,
  icon: icons[index % icons.length],
  color: `from-${colors[index % colors.length]}-500 to-${colors[index % colors.length]}-400`,
  earning: 1.00,
  isActive: true,
  isPremium: false
}));

const seedAds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    // Clear existing ads
    await Ad.deleteMany({});
    console.log('Cleared existing ads');

    // Insert realistic ads
    const insertedAds = await Ad.insertMany(realisticAds);
    console.log(`✅ Successfully inserted ${insertedAds.length} realistic ads`);

    insertedAds.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title} - ${ad.url}`);
    });

    console.log('\n✨ Database seeded with realistic ads!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding ads:', error);
    process.exit(1);
  }
};

seedAds();
