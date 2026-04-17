import bcrypt from "bcryptjs";
import pool from "../configs/db.js";

const ADMIN_PASSWORD = "Admin@123";
const SELLER_PASSWORD = "Seller@123";
const CUSTOMER_PASSWORD = "Customer@123";

// 6 verified sellers
const sellers = [
  {
    name: "Aarav Mehta",
    email: "seller.techkart@shopsphere.test",
    business_name: "TechKart India",
    gst: "27ABCDE1234F1Z5",
  },
  {
    name: "Neha Bansal",
    email: "seller.homeharvest@shopsphere.test",
    business_name: "HomeHarvest Living",
    gst: "29FGHIJ5678K1Z2",
  },
  {
    name: "Riya Kapoor",
    email: "seller.fittrail@shopsphere.test",
    business_name: "FitTrail Sports",
    gst: "09KLMNO9012P1Z7",
  },
  {
    name: "Vikram Rao",
    email: "seller.gadgetworld@shopsphere.test",
    business_name: "GadgetWorld Electronics",
    gst: "07QRSTU3456V1Z9",
  },
  {
    name: "Priya Sharma",
    email: "seller.luxehomes@shopsphere.test",
    business_name: "LuxeHomes Interiors",
    gst: "24WXYZA7890B1Z3",
  },
  {
    name: "Arjun Patel",
    email: "seller.sportshub@shopsphere.test",
    business_name: "SportsHub Pro",
    gst: "12CDEFG2345H1Z8",
  },
];

// 10 customers for diverse orders
const customers = [
  {
    name: "Milan Bhimani",
    email: "milanhbhimani@gmail.com",
    phone: "+91 98111 22001",
    city: "Ahmedabad",
    state: "Gujarat",
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@shopsphere.test",
    phone: "+91 98111 22002",
    city: "Gurugram",
    state: "Haryana",
  },
  {
    name: "Ananya Sen",
    email: "ananya.sen@shopsphere.test",
    phone: "+91 98111 22003",
    city: "Kolkata",
    state: "West Bengal",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@shopsphere.test",
    phone: "+91 98111 22004",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    name: "Sneha Gupta",
    email: "sneha.gupta@shopsphere.test",
    phone: "+91 98111 22005",
    city: "Delhi",
    state: "Delhi",
  },
  {
    name: "Amit Khanna",
    email: "amit.khanna@shopsphere.test",
    phone: "+91 98111 22006",
    city: "Bangalore",
    state: "Karnataka",
  },
  {
    name: "Divya Iyer",
    email: "divya.iyer@shopsphere.test",
    phone: "+91 98111 22007",
    city: "Chennai",
    state: "Tamil Nadu",
  },
  {
    name: "Neeraj Joshi",
    email: "neeraj.joshi@shopsphere.test",
    phone: "+91 98111 22008",
    city: "Pune",
    state: "Maharashtra",
  },
  {
    name: "Kavita Reddy",
    email: "kavita.reddy@shopsphere.test",
    phone: "+91 98111 22009",
    city: "Hyderabad",
    state: "Telangana",
  },
  {
    name: "Suresh Menon",
    email: "suresh.menon@shopsphere.test",
    phone: "+91 98111 22010",
    city: "Kochi",
    state: "Kerala",
  },
];

// Generate 200 realistic products
function generateProducts() {
  const products = [];

  // Electronics - Smartphones (25 products)
  const smartphoneBrands = [
    {
      brand: "Apple",
      models: [
        "iPhone 15 Pro Max",
        "iPhone 15 Pro",
        "iPhone 15 Plus",
        "iPhone 14 Pro Max",
        "iPhone 14",
      ],
      basePrice: [149900, 129900, 119900, 139900, 99900],
    },
    {
      brand: "Samsung",
      models: [
        "Galaxy S24 Ultra",
        "Galaxy S24+",
        "Galaxy S24",
        "Galaxy Z Fold 5",
        "Galaxy Z Flip 5",
      ],
      basePrice: [134999, 114999, 99999, 179999, 99999],
    },
    {
      brand: "Google",
      models: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel Fold"],
      basePrice: [106999, 75999, 43999, 155000],
    },
    {
      brand: "OnePlus",
      models: ["OnePlus 12", "OnePlus 12R", "OnePlus Open"],
      basePrice: [64999, 42999, 139999],
    },
    {
      brand: "Xiaomi",
      models: ["Xiaomi 14 Ultra", "Xiaomi 14", "Redmi Note 13 Pro+"],
      basePrice: [99999, 74999, 29999],
    },
  ];

  smartphoneBrands.forEach(({ brand, models, basePrice }, idx) => {
    models.forEach((model, i) => {
      products.push({
        owner:
          idx < 2
            ? "TechKart India"
            : idx < 4
              ? "GadgetWorld Electronics"
              : "platform",
        category_path: ["Electronics", "Mobiles", "Smartphones"],
        name: `${brand.toLowerCase().replace(/\s+/g, "-")}-${model.toLowerCase().replace(/\s+/g, "-")}`,
        display_name: `${brand} ${model}`,
        description: `Premium ${brand} smartphone with cutting-edge features, exceptional camera quality, and all-day battery life.`,
        base_price: basePrice[i],
        stock: Math.floor(Math.random() * 50) + 20,
        portions: [
          { value: "128GB", price: basePrice[i], stock: 15 },
          { value: "256GB", price: basePrice[i] + 10000, stock: 12 },
          { value: "512GB", price: basePrice[i] + 25000, stock: 8 },
        ],
        modifiers: [
          {
            name: "Color",
            values: ["Black", "White", "Blue", "Silver"].slice(
              0,
              3 + Math.floor(Math.random() * 2),
            ),
            additional_price: 0,
          },
        ],
      });
    });
  });

  // Electronics - Laptops (20 products)
  const laptops = [
    { name: "MacBook Pro 16 M3 Max", brand: "Apple", price: 349900 },
    { name: "MacBook Pro 14 M3 Pro", brand: "Apple", price: 249900 },
    { name: "MacBook Air 15 M3", brand: "Apple", price: 169900 },
    { name: "Dell XPS 15 OLED", brand: "Dell", price: 179999 },
    { name: "Dell XPS 13 Plus", brand: "Dell", price: 149999 },
    { name: "HP Spectre x360", brand: "HP", price: 164999 },
    { name: "HP Omen 16 Gaming", brand: "HP", price: 139999 },
    { name: "Lenovo ThinkPad X1 Carbon", brand: "Lenovo", price: 189999 },
    { name: "Lenovo Yoga 9i", brand: "Lenovo", price: 159999 },
    { name: "ASUS ROG Zephyrus G14", brand: "ASUS", price: 179999 },
    { name: "ASUS ZenBook Pro 14", brand: "ASUS", price: 144999 },
    { name: "MSI Stealth 16 Studio", brand: "MSI", price: 219999 },
    { name: "Razer Blade 15", brand: "Razer", price: 249999 },
    { name: "Acer Swift 5", brand: "Acer", price: 89999 },
    { name: "Acer Predator Helios 16", brand: "Acer", price: 169999 },
    { name: "Samsung Galaxy Book4 Ultra", brand: "Samsung", price: 189999 },
    { name: "Microsoft Surface Laptop 5", brand: "Microsoft", price: 124999 },
    { name: "LG Gram 17", brand: "LG", price: 139999 },
    { name: "Alienware m16 R2", brand: "Alienware", price: 279999 },
    { name: "Framework Laptop 16", brand: "Framework", price: 119999 },
  ];

  laptops.forEach((laptop, idx) => {
    products.push({
      owner:
        idx < 5
          ? "TechKart India"
          : idx < 12
            ? "GadgetWorld Electronics"
            : "platform",
      category_path: ["Electronics", "Computers", "Laptops"],
      name: laptop.name.toLowerCase().replace(/\s+/g, "-"),
      display_name: laptop.name,
      description: `High-performance ${laptop.brand} laptop for professionals and creators.`,
      base_price: laptop.price,
      stock: Math.floor(Math.random() * 30) + 10,
      portions: [
        { value: "16GB/512GB", price: laptop.price, stock: 8 },
        { value: "32GB/1TB", price: laptop.price + 50000, stock: 5 },
      ],
      modifiers: [
        {
          name: "Color",
          values: ["Space Gray", "Silver"],
          additional_price: 0,
        },
      ],
    });
  });

  // Electronics - Audio (20 products)
  const audioProducts = [
    {
      name: "Sony WH-1000XM5",
      type: "Headphones",
      price: 29990,
      brand: "Sony",
    },
    {
      name: "Bose QuietComfort Ultra",
      type: "Headphones",
      price: 34900,
      brand: "Bose",
    },
    {
      name: "Apple AirPods Max",
      type: "Headphones",
      price: 59900,
      brand: "Apple",
    },
    {
      name: "Sennheiser Momentum 4",
      type: "Headphones",
      price: 34990,
      brand: "Sennheiser",
    },
    { name: "JBL Tour One M2", type: "Headphones", price: 24999, brand: "JBL" },
    { name: "Sony WF-1000XM5", type: "Earbuds", price: 24990, brand: "Sony" },
    {
      name: "Apple AirPods Pro 2",
      type: "Earbuds",
      price: 24900,
      brand: "Apple",
    },
    {
      name: "Samsung Galaxy Buds3 Pro",
      type: "Earbuds",
      price: 19999,
      brand: "Samsung",
    },
    { name: "Nothing Ear (2)", type: "Earbuds", price: 9999, brand: "Nothing" },
    {
      name: "Jabra Elite 8 Active",
      type: "Earbuds",
      price: 17999,
      brand: "Jabra",
    },
    {
      name: "Marshall Stanmore III",
      type: "Speakers",
      price: 44999,
      brand: "Marshall",
    },
    { name: "Sonos Era 100", type: "Speakers", price: 29999, brand: "Sonos" },
    { name: "JBL Boombox 3", type: "Speakers", price: 49999, brand: "JBL" },
    {
      name: "Bose SoundLink Flex",
      type: "Speakers",
      price: 16900,
      brand: "Bose",
    },
    { name: "Sony SRS-XV900", type: "Speakers", price: 69990, brand: "Sony" },
    {
      name: "Audio-Technica AT2020",
      type: "Microphones",
      price: 12999,
      brand: "Audio-Technica",
    },
    { name: "Blue Yeti X", type: "Microphones", price: 16999, brand: "Blue" },
    { name: "Rode NT-USB", type: "Microphones", price: 14999, brand: "Rode" },
    { name: "Shure SM7B", type: "Microphones", price: 44999, brand: "Shure" },
    {
      name: "Focusrite Scarlett 2i2",
      type: "Audio Interfaces",
      price: 14999,
      brand: "Focusrite",
    },
  ];

  audioProducts.forEach((item, idx) => {
    const categoryMap = {
      Headphones: ["Electronics", "Audio", "Headphones"],
      Earbuds: ["Electronics", "Audio", "Earbuds"],
      Speakers: ["Electronics", "Audio", "Speakers"],
      Microphones: ["Electronics", "Audio", "Microphones"],
      "Audio Interfaces": ["Electronics", "Audio", "Audio Interfaces"],
    };
    products.push({
      owner: idx < 10 ? "TechKart India" : "GadgetWorld Electronics",
      category_path: categoryMap[item.type],
      name: item.name
        .toLowerCase()
        .replace(/[\s()]+/g, "-")
        .replace(/--+/g, "-"),
      display_name: item.name,
      description: `Premium ${item.type.toLowerCase()} from ${item.brand} with exceptional sound quality.`,
      base_price: item.price,
      stock: Math.floor(Math.random() * 60) + 20,
      portions: [
        {
          value: "Standard",
          price: item.price,
          stock: Math.floor(Math.random() * 40) + 15,
        },
      ],
      modifiers:
        item.type === "Headphones" || item.type === "Earbuds"
          ? [
              {
                name: "Color",
                values: ["Black", "White", "Navy"],
                additional_price: 0,
              },
            ]
          : null,
    });
  });

  // Home & Kitchen - Appliances (25 products)
  const appliances = [
    {
      name: "Dyson V15 Detect Absolute",
      category: "Vacuum Cleaners",
      price: 59900,
    },
    { name: "iRobot Roomba j9+", category: "Vacuum Cleaners", price: 89900 },
    { name: "Dreame L20 Ultra", category: "Vacuum Cleaners", price: 64900 },
    {
      name: "Breville Barista Express",
      category: "Coffee Machines",
      price: 62999,
    },
    {
      name: "DeLonghi La Specialista",
      category: "Coffee Machines",
      price: 84999,
    },
    { name: "Nespresso Vertuo Pop", category: "Coffee Machines", price: 14999 },
    { name: "Philips 5400 Series", category: "Coffee Machines", price: 89999 },
    {
      name: "KitchenAid Artisan Stand Mixer",
      category: "Mixers",
      price: 49999,
    },
    { name: "Bosch MUM5", category: "Mixers", price: 34999 },
    { name: "Vitamix A3500i", category: "Blenders", price: 54999 },
    { name: "NutriBullet Pro 1000", category: "Blenders", price: 8999 },
    { name: "Philips Air Fryer XL", category: "Air Fryers", price: 14999 },
    { name: "Ninja Foodi Dual Zone", category: "Air Fryers", price: 24999 },
    { name: "LG 687L Side-by-Side", category: "Refrigerators", price: 124999 },
    { name: "Samsung Bespoke 635L", category: "Refrigerators", price: 149999 },
    { name: "Whirlpool 265L", category: "Refrigerators", price: 34999 },
    {
      name: "Bosch 13 Place Dishwasher",
      category: "Dishwashers",
      price: 49999,
    },
    { name: "IFB Neptune VX Plus", category: "Dishwashers", price: 45999 },
    { name: "LG 8kg Front Load", category: "Washing Machines", price: 42999 },
    {
      name: "Samsung 9kg AI EcoBubble",
      category: "Washing Machines",
      price: 48999,
    },
    { name: "Bajaj Majesty OTG", category: "Ovens", price: 7999 },
    { name: "Morphy Richards 60RCSS", category: "Ovens", price: 12999 },
    { name: "Kent Grand Plus RO", category: "Water Purifiers", price: 19999 },
    { name: "Aquaguard Aura RO+UV", category: "Water Purifiers", price: 16999 },
    {
      name: "Philips Series 9000 Air Purifier",
      category: "Air Purifiers",
      price: 54999,
    },
  ];

  const applianceCategoryMap = {
    "Vacuum Cleaners": ["Home & Kitchen", "Home Appliances", "Vacuum Cleaners"],
    "Coffee Machines": [
      "Home & Kitchen",
      "Kitchen Appliances",
      "Coffee Machines",
    ],
    Mixers: ["Home & Kitchen", "Kitchen Appliances", "Mixers"],
    Blenders: ["Home & Kitchen", "Kitchen Appliances", "Blenders"],
    "Air Fryers": ["Home & Kitchen", "Kitchen Appliances", "Air Fryers"],
    Refrigerators: ["Home & Kitchen", "Large Appliances", "Refrigerators"],
    Dishwashers: ["Home & Kitchen", "Large Appliances", "Dishwashers"],
    "Washing Machines": [
      "Home & Kitchen",
      "Large Appliances",
      "Washing Machines",
    ],
    Ovens: ["Home & Kitchen", "Kitchen Appliances", "Ovens"],
    "Water Purifiers": ["Home & Kitchen", "Home Appliances", "Water Purifiers"],
    "Air Purifiers": ["Home & Kitchen", "Home Appliances", "Air Purifiers"],
  };

  appliances.forEach((item, idx) => {
    products.push({
      owner:
        idx < 8
          ? "HomeHarvest Living"
          : idx < 18
            ? "LuxeHomes Interiors"
            : "platform",
      category_path: applianceCategoryMap[item.category],
      name: item.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      display_name: item.name,
      description: `Premium ${item.category.toLowerCase()} for modern homes.`,
      base_price: item.price,
      stock: Math.floor(Math.random() * 40) + 10,
      portions: [
        {
          value: "Standard",
          price: item.price,
          stock: Math.floor(Math.random() * 30) + 8,
        },
      ],
      modifiers: null,
    });
  });

  // Home & Kitchen - Furniture (20 products)
  const furniture = [
    { name: "Herman Miller Aeron", category: "Office Chairs", price: 89999 },
    { name: "Steelcase Gesture", category: "Office Chairs", price: 94999 },
    { name: "Haworth Zody", category: "Office Chairs", price: 64999 },
    { name: "IKEA Markus", category: "Office Chairs", price: 14999 },
    { name: "Green Soul Monster", category: "Gaming Chairs", price: 18999 },
    { name: "Secretlab Titan Evo", category: "Gaming Chairs", price: 54999 },
    { name: "West Elm Mid-Century Sofa", category: "Sofas", price: 89999 },
    { name: "Urban Ladder Apollo", category: "Sofas", price: 64999 },
    { name: "Pepperfry Adorn", category: "Sofas", price: 42999 },
    { name: "Wakefit Cloud", category: "Mattresses", price: 14999 },
    { name: "Sleepwell Deccan", category: "Mattresses", price: 21999 },
    { name: "Duroflex Energise", category: "Mattresses", price: 18999 },
    { name: "Godrej Interio King Bed", category: "Beds", price: 39999 },
    { name: "Urban Ladder Boho", category: "Beds", price: 29999 },
    { name: "Home Centre Dining Set", category: "Dining", price: 49999 },
    { name: "Nilkamal Athens", category: "Storage", price: 8999 },
    { name: "IKEA Billy Bookcase", category: "Storage", price: 4999 },
    { name: "AmazonBasics Study Table", category: "Tables", price: 7999 },
    { name: "Spacewood Wardrobe", category: "Storage", price: 24999 },
    { name: "Durian Recliner", category: "Chairs", price: 34999 },
  ];

  const furnitureCategoryMap = {
    "Office Chairs": ["Home & Kitchen", "Furniture", "Office Chairs"],
    "Gaming Chairs": ["Home & Kitchen", "Furniture", "Gaming Chairs"],
    Sofas: ["Home & Kitchen", "Furniture", "Sofas"],
    Mattresses: ["Home & Kitchen", "Furniture", "Mattresses"],
    Beds: ["Home & Kitchen", "Furniture", "Beds"],
    Dining: ["Home & Kitchen", "Furniture", "Dining Sets"],
    Storage: ["Home & Kitchen", "Furniture", "Storage"],
    Tables: ["Home & Kitchen", "Furniture", "Tables"],
    Chairs: ["Home & Kitchen", "Furniture", "Chairs"],
  };

  furniture.forEach((item, idx) => {
    products.push({
      owner: idx < 10 ? "HomeHarvest Living" : "LuxeHomes Interiors",
      category_path: furnitureCategoryMap[item.category],
      name: item.name.toLowerCase().replace(/\s+/g, "-"),
      display_name: item.name,
      description: `Comfortable and stylish ${item.category.toLowerCase()} for your home.`,
      base_price: item.price,
      stock: Math.floor(Math.random() * 25) + 5,
      portions: [
        {
          value: "Standard",
          price: item.price,
          stock: Math.floor(Math.random() * 20) + 3,
        },
      ],
      modifiers:
        item.category === "Office Chairs" || item.category === "Gaming Chairs"
          ? [
              {
                name: "Color",
                values: ["Black", "Gray", "Blue"],
                additional_price: 0,
              },
            ]
          : null,
    });
  });

  // Sports & Fitness (30 products)
  const fitnessProducts = [
    { name: "Garmin Forerunner 965", category: "Smartwatches", price: 73990 },
    { name: "Apple Watch Ultra 2", category: "Smartwatches", price: 89900 },
    {
      name: "Samsung Galaxy Watch6 Classic",
      category: "Smartwatches",
      price: 44999,
    },
    { name: "Fitbit Sense 2", category: "Smartwatches", price: 24999 },
    { name: "Garmin Fenix 7X", category: "Smartwatches", price: 94990 },
    { name: "Amazfit GTR 4", category: "Smartwatches", price: 16999 },
    { name: "Theragun Prime", category: "Recovery", price: 24999 },
    { name: "Hypervolt 2 Pro", category: "Recovery", price: 39999 },
    { name: "Theragun Mini", category: "Recovery", price: 14999 },
    { name: "Foam Roller Pro", category: "Recovery", price: 2999 },
    { name: "NordicTrack T 7.5S", category: "Cardio", price: 149999 },
    { name: "Peloton Bike+", category: "Cardio", price: 249999 },
    { name: "Concept2 RowErg", category: "Cardio", price: 89999 },
    { name: "Bowflex SelectTech 552", category: "Weights", price: 34999 },
    { name: "PowerBlock Elite 90", category: "Weights", price: 54999 },
    { name: "Rogue Ohio Bar", category: "Weights", price: 29999 },
    { name: "Yoga Mat Manduka PRO", category: "Yoga", price: 8999 },
    { name: "Liforme Yoga Mat", category: "Yoga", price: 11999 },
    { name: "TRX Suspension Trainer", category: "Training", price: 14999 },
    { name: "Kettlebell Set 4-12kg", category: "Weights", price: 7999 },
    { name: "Resistance Bands Set", category: "Training", price: 1999 },
    { name: "Jump Rope Crossrope", category: "Cardio", price: 4999 },
    { name: "Ab Roller Perfect", category: "Training", price: 1499 },
    { name: "Pull-up Bar Iron Gym", category: "Training", price: 2999 },
    { name: "Adjustable Bench", category: "Weights", price: 12999 },
    { name: "Nike Metcon 9", category: "Footwear", price: 12995 },
    { name: "Adidas Ultraboost Light", category: "Footwear", price: 16999 },
    { name: "Under Armour HOVR", category: "Footwear", price: 11999 },
    { name: "Puma Deviate Nitro", category: "Footwear", price: 14999 },
    { name: "Asics Gel-Kayano 30", category: "Footwear", price: 15999 },
  ];

  const fitnessCategoryMap = {
    Smartwatches: ["Sports & Fitness", "Fitness", "Wearables"],
    Recovery: ["Sports & Fitness", "Fitness", "Recovery"],
    Cardio: ["Sports & Fitness", "Fitness", "Cardio Equipment"],
    Weights: ["Sports & Fitness", "Fitness", "Strength Training"],
    Yoga: ["Sports & Fitness", "Fitness", "Yoga"],
    Training: ["Sports & Fitness", "Fitness", "Training Gear"],
    Footwear: ["Sports & Fitness", "Fitness", "Footwear"],
  };

  fitnessProducts.forEach((item, idx) => {
    products.push({
      owner: idx < 15 ? "FitTrail Sports" : "SportsHub Pro",
      category_path: fitnessCategoryMap[item.category],
      name: item.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      display_name: item.name,
      description: `High-quality ${item.category.toLowerCase()} gear for your fitness journey.`,
      base_price: item.price,
      stock: Math.floor(Math.random() * 50) + 15,
      portions: [
        {
          value: "Standard",
          price: item.price,
          stock: Math.floor(Math.random() * 40) + 10,
        },
      ],
      modifiers:
        item.category === "Smartwatches" || item.category === "Footwear"
          ? [
              {
                name: "Size",
                values: ["S", "M", "L", "XL"],
                additional_price: 0,
              },
            ]
          : null,
    });
  });

  // Fashion & Accessories (40 products)
  const fashionProducts = [
    { name: "Ray-Ban Aviator Classic", category: "Sunglasses", price: 8990 },
    { name: "Oakley Holbrook XL", category: "Sunglasses", price: 12990 },
    { name: "Maui Jim Peahi", category: "Sunglasses", price: 24990 },
    { name: "Carrera 1022S", category: "Sunglasses", price: 6990 },
    { name: "Fossil Grant Chronograph", category: "Watches", price: 9995 },
    { name: "Titan Octane", category: "Watches", price: 7995 },
    { name: "Casio G-Shock GA-2100", category: "Watches", price: 7995 },
    { name: "Seiko 5 Sports", category: "Watches", price: 21999 },
    { name: "Timex Weekender", category: "Watches", price: 3495 },
    { name: "Daniel Wellington Classic", category: "Watches", price: 12995 },
    { name: "Samsonite Spectrolite", category: "Luggage", price: 14999 },
    { name: "American Tourister Bon Air", category: "Luggage", price: 6999 },
    { name: "Skybags Marshall", category: "Luggage", price: 4999 },
    { name: "Wildcraft Nomad", category: "Backpacks", price: 3499 },
    { name: "Safari Thorium", category: "Backpacks", price: 2499 },
    { name: "Tommy Hilfiger Wallet", category: "Accessories", price: 2999 },
    { name: "Woodland Leather Belt", category: "Accessories", price: 1999 },
    {
      name: "Allen Solly Sunglasses Case",
      category: "Accessories",
      price: 999,
    },
    { name: "Van Heusen Tie Set", category: "Accessories", price: 1499 },
    { name: "Peter England Socks Pack", category: "Accessories", price: 699 },
    { name: "Nike Dri-FIT T-Shirt", category: "Clothing", price: 1995 },
    { name: "Adidas Originals Hoodie", category: "Clothing", price: 4499 },
    { name: "Puma Essentials Sweatpants", category: "Clothing", price: 2999 },
    { name: "Under Armour Compression", category: "Clothing", price: 2499 },
    { name: "Levi's 511 Slim Fit", category: "Clothing", price: 3999 },
    { name: "Wrangler Denim Jacket", category: "Clothing", price: 3499 },
    { name: "H&M Cotton Shirt", category: "Clothing", price: 1499 },
    { name: "Zara Basic Tee", category: "Clothing", price: 999 },
    { name: "Uniqlo Ultra Light Down", category: "Clothing", price: 4990 },
    { name: "FabIndia Kurta", category: "Clothing", price: 1999 },
    { name: "Bata Formal Shoes", category: "Footwear", price: 2999 },
    { name: "Bata Comfit Sandals", category: "Footwear", price: 1499 },
    { name: "Red Tape Sneakers", category: "Footwear", price: 2499 },
    { name: "Woodland Boots", category: "Footwear", price: 3999 },
    { name: "Crocs Classic Clog", category: "Footwear", price: 2499 },
    { name: "Skechers Go Walk", category: "Footwear", price: 4499 },
    { name: "Hush Puppies Formal", category: "Footwear", price: 5999 },
    { name: "US Polo T-Shirt", category: "Clothing", price: 1799 },
    { name: "UCB Polo Shirt", category: "Clothing", price: 1599 },
    { name: "Jack & Jones Jacket", category: "Clothing", price: 4999 },
  ];

  const fashionCategoryMap = {
    Sunglasses: ["Fashion", "Accessories", "Sunglasses"],
    Watches: ["Fashion", "Accessories", "Watches"],
    Luggage: ["Fashion", "Travel", "Luggage"],
    Backpacks: ["Fashion", "Travel", "Backpacks"],
    Accessories: ["Fashion", "Accessories", "Accessories"],
    Clothing: ["Fashion", "Men", "Clothing"],
    Footwear: ["Fashion", "Men", "Footwear"],
  };

  fashionProducts.forEach((item, idx) => {
    products.push({
      owner: "platform",
      category_path: fashionCategoryMap[item.category],
      name: item.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      display_name: item.name,
      description: `Stylish ${item.category.toLowerCase()} for everyday use.`,
      base_price: item.price,
      stock: Math.floor(Math.random() * 100) + 30,
      portions: [
        {
          value: "Standard",
          price: item.price,
          stock: Math.floor(Math.random() * 80) + 20,
        },
      ],
      modifiers:
        item.category === "Clothing" || item.category === "Footwear"
          ? [
              {
                name: "Size",
                values: ["S", "M", "L", "XL", "XXL"].slice(
                  0,
                  4 + Math.floor(Math.random() * 2),
                ),
                additional_price: 0,
              },
            ]
          : null,
    });
  });

  // Books & Stationery (20 products)
  const booksStationery = [
    { name: "Moleskine Classic Notebook", category: "Notebooks", price: 1899 },
    { name: "Leuchtturm1917 A5", category: "Notebooks", price: 2499 },
    { name: "Rhodia DotPad", category: "Notebooks", price: 1299 },
    { name: "Parker Jotter Ballpoint", category: "Pens", price: 999 },
    { name: "Lamy Safari Fountain", category: "Pens", price: 3499 },
    { name: "Pilot G2 Gel Pen Set", category: "Pens", price: 599 },
    { name: "Staedtler Mars Lumograph", category: "Pencils", price: 899 },
    { name: "Faber-Castell Polychromos", category: "Art", price: 2499 },
    { name: "Prismacolor Premier", category: "Art", price: 4499 },
    { name: "Winsor Newton Cotman", category: "Art", price: 1899 },
    { name: "Stabilo Boss Highlighters", category: "Stationery", price: 699 },
    { name: "Post-it Super Sticky", category: "Stationery", price: 499 },
    { name: "3M Scotch Tape Dispenser", category: "Stationery", price: 399 },
    { name: "Dymo Label Maker", category: "Office", price: 1999 },
    { name: "Casio Scientific Calculator", category: "Office", price: 1299 },
    { name: "Texas Instruments TI-84", category: "Office", price: 8999 },
    { name: "Kindle Paperwhite", category: "E-Readers", price: 12999 },
    { name: "Kobo Clara HD", category: "E-Readers", price: 10999 },
    { name: "Rocketbook Smart Notebook", category: "Smart", price: 2499 },
    { name: "Remarkable 2 Tablet", category: "Smart", price: 45999 },
  ];

  const stationeryCategoryMap = {
    Notebooks: ["Books & Stationery", "Stationery", "Notebooks"],
    Pens: ["Books & Stationery", "Stationery", "Pens"],
    Pencils: ["Books & Stationery", "Stationery", "Pencils"],
    Art: ["Books & Stationery", "Art Supplies", "Drawing"],
    Stationery: ["Books & Stationery", "Stationery", "General"],
    Office: ["Books & Stationery", "Office Supplies", "Equipment"],
    "E-Readers": ["Books & Stationery", "Digital", "E-Readers"],
    Smart: ["Books & Stationery", "Digital", "Smart Notes"],
  };

  booksStationery.forEach((item, idx) => {
    products.push({
      owner: "platform",
      category_path: stationeryCategoryMap[item.category],
      name: item.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      display_name: item.name,
      description: `Quality ${item.category.toLowerCase()} for work and creativity.`,
      base_price: item.price,
      stock: Math.floor(Math.random() * 80) + 25,
      portions: [
        {
          value: "Standard",
          price: item.price,
          stock: Math.floor(Math.random() * 60) + 15,
        },
      ],
      modifiers: null,
    });
  });

  return products;
}

// Helper functions
async function ensureCategory(conn, path, adminId) {
  let parentId = null;
  for (const name of path) {
    const [rows] = await conn.query(
      "SELECT category_id FROM category_master WHERE category_name = ? AND ((parent_id IS NULL AND ? IS NULL) OR parent_id = ?)",
      [name, parentId, parentId],
    );
    if (rows.length) {
      parentId = rows[0].category_id;
      continue;
    }
    const [result] = await conn.query(
      "INSERT INTO category_master (category_name, parent_id, tax_percent, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
      [
        name,
        parentId,
        path[0] === "Electronics"
          ? 18
          : path[0] === "Sports & Fitness"
            ? 12
            : 18,
        adminId,
        adminId,
      ],
    );
    parentId = result.insertId;
  }
  return parentId;
}

async function ensureUser(conn, userData, role, password) {
  const [existing] = await conn.query(
    "SELECT user_id FROM user_master WHERE email = ?",
    [userData.email],
  );
  if (existing.length) return existing[0].user_id;

  const hash = await bcrypt.hash(password, 10);
  // Note: user_master role only allows 'customer'/'admin', seller is tracked in seller_profiles
  const dbRole = role === "admin" ? "admin" : "customer";
  const [result] = await conn.query(
    `INSERT INTO user_master (name, email, password, role) VALUES (?, ?, ?, ?)`,
    [userData.name, userData.email, hash, dbRole],
  );
  return result.insertId;
}

async function ensureSeller(conn, userId, sellerData, adminId) {
  const [existing] = await conn.query(
    "SELECT seller_profile_id FROM seller_profiles WHERE seller_id = ?",
    [userId],
  );
  if (existing.length) return existing[0].seller_profile_id;

  const [result] = await conn.query(
    `INSERT INTO seller_profiles (seller_id, business_name, business_description, business_address, phone, gst_number,
     bank_account_number, bank_ifsc_code, bank_account_holder, verification_status, verified_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)`,
    [
      userId,
      sellerData.business_name,
      sellerData.business_description || "Quality products at great prices.",
      sellerData.business_address || "123 Business Street, Mumbai",
      sellerData.phone || null,
      sellerData.gst,
      sellerData.bank_account_number || "1234567890",
      sellerData.bank_ifsc_code || "HDFC0001234",
      sellerData.bank_account_holder || sellerData.business_name,
      adminId,
    ],
  );
  return result.insertId;
}

async function ensurePortion(conn, value, adminId) {
  const [result] = await conn.query(
    `INSERT INTO portion_master (portion_value, is_active, created_by, updated_by) VALUES (?, 1, ?, ?)
     ON DUPLICATE KEY UPDATE portion_id = LAST_INSERT_ID(portion_id)`,
    [value, adminId, adminId],
  );
  return result.insertId;
}

async function ensureModifier(conn, name, value, type, adminId) {
  const [result] = await conn.query(
    `INSERT INTO modifier_master (modifier_name, modifier_value, modifier_type, is_active, created_by, updated_by)
     VALUES (?, ?, ?, 1, ?, ?) ON DUPLICATE KEY UPDATE modifier_id = LAST_INSERT_ID(modifier_id)`,
    [name, value, type, adminId, adminId],
  );
  return result.insertId;
}

async function seed() {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // Create/update admin
    const adminId = await ensureUser(
      conn,
      {
        name: "ShopSphere Admin",
        email: "admin@shopsphere.test",
        phone: "+91 99999 99999",
      },
      "admin",
      ADMIN_PASSWORD,
    );
    console.log("Admin ID:", adminId);

    // Create sellers
    const sellerIds = [];
    for (const seller of sellers) {
      const userId = await ensureUser(conn, seller, "seller", SELLER_PASSWORD);
      const sellerProfileId = await ensureSeller(conn, userId, seller, adminId);
      sellerIds.push({
        userId,
        sellerId: userId,
        sellerProfileId,
        businessName: seller.business_name,
      });
    }
    console.log("Sellers created:", sellerIds.length);

    // Create customers with addresses
    const customerIds = [];
    for (const customer of customers) {
      const userId = await ensureUser(
        conn,
        customer,
        "customer",
        CUSTOMER_PASSWORD,
      );
      const [addrResult] = await conn.query(
        `INSERT INTO user_addresses (user_id, full_name, phone, address_line1, city, state, postal_code, is_default, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?) ON DUPLICATE KEY UPDATE address_id = LAST_INSERT_ID(address_id)`,
        [
          userId,
          customer.name,
          customer.phone,
          customer.address_line1 || "123 Main Street",
          customer.city,
          customer.state,
          customer.postal_code || "400001",
          userId,
          userId,
        ],
      );
      customerIds.push({ userId, addressId: addrResult.insertId });
    }
    console.log("Customers created:", customerIds.length);

    // Generate and insert products
    const catalog = generateProducts();
    const sellerMap = Object.fromEntries(
      sellerIds.map((s) => [s.businessName, s.sellerId]),
    );
    const productIds = [];

    for (const item of catalog) {
      const categoryId = await ensureCategory(
        conn,
        item.category_path,
        adminId,
      );
      const sellerId =
        item.owner === "platform" ? null : sellerMap[item.owner] || null;

      const [prodResult] = await conn.query(
        `INSERT INTO product_master (seller_id, category_id, name, display_name, description, short_description,
         price, stock, is_active, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          sellerId,
          categoryId,
          item.name,
          item.display_name,
          item.description,
          item.description.slice(0, 100),
          item.base_price,
          item.stock,
          adminId,
          adminId,
        ],
      );
      const productId = prodResult.insertId;
      productIds.push(productId);

      // Insert product images
      await conn.query(
        `INSERT INTO product_images (product_id, image_url, image_level, public_id, is_primary, created_by, updated_by)
         VALUES (?, ?, 'PRODUCT', ?, 1, ?, ?)`,
        [
          productId,
          `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(item.display_name)}`,
          `img_${productId}_${Date.now()}`,
          adminId,
          adminId,
        ],
      );

      // Insert portions
      if (item.portions) {
        for (const portion of item.portions) {
          const portionId = await ensurePortion(conn, portion.value, adminId);
          await conn.query(
            `INSERT INTO product_portion (product_id, portion_id, price, stock, is_active, created_by, updated_by)
             VALUES (?, ?, ?, ?, 1, ?, ?)`,
            [
              productId,
              portionId,
              portion.price,
              portion.stock,
              adminId,
              adminId,
            ],
          );
        }
      }

      // Insert modifiers
      if (item.modifiers) {
        for (const mod of item.modifiers) {
          for (const val of mod.values) {
            const modifierId = await ensureModifier(
              conn,
              mod.name,
              val,
              "single_select",
              adminId,
            );
            await conn.query(
              `INSERT INTO modifier_portion (product_id, modifier_id, additional_price, stock, is_active, created_by, updated_by)
               VALUES (?, ?, ?, ?, 1, ?, ?)`,
              [
                productId,
                modifierId,
                mod.additional_price || 0,
                50,
                adminId,
                adminId,
              ],
            );
          }
        }
      }
    }
    console.log("Products created:", productIds.length);

    // Generate 40+ orders across multiple months (Jan-Apr 2026)
    const orderStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "completed",
    ];
    const paymentStatuses = ["pending", "completed", "processing"];
    const paymentMethods = ["cash_on_delivery", "stripe"];

    let orderCount = 0;
    for (let month = 1; month <= 4; month++) {
      // Jan-Apr
      const daysInMonth = month === 2 ? 28 : month === 4 ? 30 : 31;
      const ordersThisMonth = 10 + Math.floor(Math.random() * 5); // 10-15 orders per month

      for (let i = 0; i < ordersThisMonth; i++) {
        const customer =
          customerIds[Math.floor(Math.random() * customerIds.length)];
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const orderDate = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:00`;

        const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items per order
        let totalAmount = 0;
        const orderItems = [];

        for (let j = 0; j < numItems; j++) {
          const productId =
            productIds[Math.floor(Math.random() * productIds.length)];
          const quantity = 1 + Math.floor(Math.random() * 2);
          const price = 1000 + Math.floor(Math.random() * 50000); // Random price
          totalAmount += price * quantity;
          orderItems.push({ productId, quantity, price });
        }

        const tax = Math.round(totalAmount * 0.18);
        const shipping = totalAmount > 500 ? 0 : 50;
        const finalAmount = totalAmount + tax + shipping;

        const orderStatus =
          orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const paymentStatus =
          paymentMethods[0] === "cash_on_delivery" &&
          orderStatus !== "completed"
            ? "pending"
            : paymentStatuses[
                Math.floor(Math.random() * paymentStatuses.length)
              ];
        const paymentMethod =
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const [orderResult] = await conn.query(
          `INSERT INTO order_master (order_number, user_id, address_id, subtotal, tax_amount, shipping_amount,
           discount_amount, total_amount, order_status, payment_status, is_deleted, created_by, updated_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
          [
            `ORD-2026-${String(month).padStart(2, "0")}-${String(++orderCount).padStart(4, "0")}`,
            customer.userId,
            customer.addressId,
            totalAmount,
            tax,
            shipping,
            0,
            finalAmount,
            orderStatus,
            paymentStatus,
            adminId,
            adminId,
            orderDate,
            orderDate,
          ],
        );
        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of orderItems) {
          // Get product name
          const [prodRows] = await conn.query(
            "SELECT display_name FROM product_master WHERE product_id = ?",
            [item.productId],
          );
          const productName = prodRows[0]?.display_name || "Product";

          await conn.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, discount, tax, total, created_by, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              item.productId,
              productName,
              item.quantity,
              item.price,
              0,
              Math.round(item.price * item.quantity * 0.18),
              item.price * item.quantity,
              adminId,
              adminId,
            ],
          );
        }
      }
    }
    console.log("Orders created:", orderCount);

    await conn.commit();
    console.log("\n✅ Seeding completed successfully!");
    console.log(`- ${sellerIds.length} sellers`);
    console.log(`- ${customerIds.length} customers`);
    console.log(`- ${productIds.length} products`);
    console.log(`- ${orderCount} orders (Jan-Apr 2026)`);
    console.log("\nLogin credentials:");
    console.log("  Admin: admin@shopsphere.test / Admin@123");
    console.log("  Sellers: (any seller email) / Seller@123");
    console.log("  Customers: (any customer email) / Customer@123");
  } catch (error) {
    await conn.rollback();
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
