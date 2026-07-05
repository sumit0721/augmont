require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'augmont_crud',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

const indianProducts = {
  'Electronics': [
    'Samsung 43-inch Smart TV', 'LG 1.5 Ton AC', 'Sony Bravia 55-inch TV', 'boAt Rockerz Headphones',
    'JBL Charge 4 Speaker', 'Apple iPhone 15', 'OnePlus 11R', 'Xiaomi Redmi Note 13',
    'Dell Inspiron 15 Laptop', 'HP Pavilion Gaming Laptop', 'Lenovo IdeaPad Slim', 'Apple MacBook Air M2',
    'Realme Buds Air 5', 'Noise ColorFit Smartwatch', 'Fire-Boltt Phoenix', 'Samsung Galaxy Tab S9',
    'Sony PlayStation 5', 'Microsoft Xbox Series X', 'Philips Trimmer', 'Dyson V11 Vacuum Cleaner',
    'Haier 258L Refrigerator', 'Whirlpool 7kg Washing Machine', 'IFB Front Load Washing Machine',
    'Panasonic Microwave Oven', 'Voltas Window AC'
  ],
  'Clothing': [
    'Levi\'s Men\'s Jeans', 'Allen Solly Casual Shirt', 'Biba Women\'s Kurta Set', 'Puma Running Shoes',
    'Nike Air Max', 'Adidas Track Pants', 'H&M Cotton T-Shirt', 'Zara Flowy Dress',
    'Manyavar Men\'s Kurta', 'FabIndia Silk Saree', 'W for Woman Tunic', 'Red Tape Leather Shoes',
    'Wildcraft Backpack', 'Fastrack Aviator Sunglasses', 'Titan Neo Men\'s Watch', 'Fossil Rose Gold Watch',
    'Polo Ralph Lauren T-Shirt', 'Woodland Trekking Shoes', 'Campus Men\'s Sneakers', 'Crocs Classic Clogs',
    'Jockey Cotton Trunks', 'Van Heusen Formal Trousers', 'Raymond Unstitched Suiting',
    'Aurelia Women\'s Leggings', 'Sabyasachi Bridal Lehenga'
  ],
  'Books': [
    'The White Tiger by Aravind Adiga', 'Midnight\'s Children by Salman Rushdie', 'The God of Small Things',
    'A Suitable Boy by Vikram Seth', 'Shantaram by Gregory David Roberts', 'Ikigai: The Japanese Secret',
    'Atomic Habits by James Clear', 'The Psychology of Money', 'Rich Dad Poor Dad',
    'Sapiens by Yuval Noah Harari', 'Bhagavad Gita As It Is', 'Autobiography of a Yogi',
    'Train to Pakistan by Khushwant Singh', 'Malgudi Days by R.K. Narayan', 'The Secret by Rhonda Byrne',
    'Think and Grow Rich', 'The Alchemist by Paulo Coelho', 'Harry Potter and the Sorcerer\'s Stone',
    'To Kill a Mockingbird', '1984 by George Orwell', 'My Experiments with Truth by M.K. Gandhi',
    'Ignited Minds by A.P.J. Abdul Kalam', 'The Discovery of India', 'Five Point Someone by Chetan Bhagat',
    'Immortals of Meluha by Amish Tripathi'
  ],
  'Home & Kitchen': [
    'Milton Thermosteel Water Bottle', 'Prestige Pressure Cooker', 'Butterfly Mixer Grinder',
    'Pigeon Gas Stove', 'Wonderchef Nutri-Blend', 'Cello Opalware Dinner Set', 'Borosil Glass Lunch Box',
    'Tupperware Storage Containers', 'Eureka Forbes Water Purifier', 'Kent RO Water Purifier',
    'Havells Pedestal Fan', 'Bajaj Room Heater', 'Sujata Dynamix Mixer', 'Godrej Interio Office Chair',
    'Sleepwell Ortho Mattress', 'Wakefit Teak Wood Bed', 'Nilkamal Plastic Chair',
    'Philips LED Bulb 9W', 'Syska Extension Board', 'Asian Paints Wall Color',
    'Fevicol MR Adhesive', 'Prestige Non-Stick Cookware', 'Hawkins Contura Cooker',
    'Bombay Dyeing Bedsheet', 'Swayam Cotton Curtains'
  ],
  'Sports & Outdoors': [
    'MRF Genius Cricket Bat', 'Kookaburra Cricket Ball', 'SS Ton Cricket Kit', 'Yonex Badminton Racquet',
    'Nivia Football', 'Cosco Basketball', 'Decathlon Pop-up Tent', 'Wildcraft Sleeping Bag',
    'Vector X Yoga Mat', 'Kobo Skipping Rope', 'Strauss Dumbbells Set', 'Boldfit Resistance Bands',
    'Firefox Geared Bicycle', 'Hero Sprint Pro Cycle', 'Speedo Swimming Goggles',
    'Nivia Shin Guards', 'Puma Goalkeeper Gloves', 'Adidas Tennis Racquet', 'Wilson Tennis Balls',
    'Head Squash Racquet', 'Quechua Trekking Backpack', 'Garmin Forerunner GPS Watch',
    'Segway Ninebot Kickscooter', 'Razor RipStik Caster Board', 'Stiga Table Tennis Bat'
  ]
};

async function seed() {
  try {
    const [categories] = await sequelize.query('SELECT id, name from "categories";');
    if (categories.length === 0) {
      console.log('No categories found.');
      process.exit(1);
    }

    // Delete existing products and reset ID sequence to 1
    await sequelize.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');

    const Product = sequelize.define('Product', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      uniqueId: { type: DataTypes.UUID },
      categoryId: { type: DataTypes.INTEGER },
      name: { type: DataTypes.STRING },
      price: { type: DataTypes.DECIMAL },
      stock: { type: DataTypes.INTEGER },
      image: { type: DataTypes.STRING },
      createdAt: { type: DataTypes.DATE }
    }, { tableName: 'products', timestamps: true, updatedAt: false });

    const products = [];
    for (const category of categories) {
      const names = indianProducts[category.name] || [];
      
      let categoryIcon = '';
      if (category.name === 'Electronics') categoryIcon = 'https://img.icons8.com/fluency/256/macbook.png';
      else if (category.name === 'Clothing') categoryIcon = 'https://img.icons8.com/color/256/t-shirt.png';
      else if (category.name === 'Books') categoryIcon = 'https://img.icons8.com/fluency/256/books.png';
      else if (category.name === 'Home & Kitchen') categoryIcon = 'https://img.icons8.com/fluency/256/cooking-pot.png';
      else if (category.name === 'Sports & Outdoors') categoryIcon = 'https://img.icons8.com/fluency/256/basketball.png';
      else categoryIcon = 'https://img.icons8.com/fluency/256/box.png';

      for (let i = 0; i < 25; i++) {
        // Fallback to "Generic Item X" if we don't have exactly 25 names mapped
        const productName = names[i] || `${category.name} Item ${i + 1}`;
        const uniqueId = uuidv4();
        
        products.push({
          uniqueId: uniqueId,
          categoryId: category.id,
          name: productName,
          price: Math.floor(Math.random() * 45000) + 500, // INR 500 to 45,500
          stock: Math.floor(Math.random() * 200),         // 0 to 200 stock
          image: categoryIcon,
          createdAt: new Date()
        });
      }
    }

    await Product.bulkCreate(products);
    console.log(`Successfully seeded ${products.length} realistic Indian products!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seed();
