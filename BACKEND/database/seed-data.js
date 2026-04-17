// Static data for seed-comprehensive.js
// Kept in a separate module to keep the orchestrator file compact.

export const SELLERS = [
  { key: "techkart", name: "Aarav Mehta", email: "seller.techkart@shopsphere.test", business_name: "TechKart India", business_description: "Consumer electronics boutique focused on premium phones, audio and creator gear.", business_address: "12 Linking Road, Bandra West, Mumbai, Maharashtra 400050", phone: "+91 98765 11001", gst_number: "27ABCDE1234F1Z5", bank_account_number: "50200011223344", bank_ifsc_code: "HDFC0001234", bank_account_holder: "TechKart India Pvt Ltd" },
  { key: "homeharvest", name: "Neha Bansal", email: "seller.homeharvest@shopsphere.test", business_name: "HomeHarvest Living", business_description: "Curated home, kitchen and lifestyle essentials with a premium modern catalogue.", business_address: "44 Residency Road, Bengaluru, Karnataka 560025", phone: "+91 98765 11002", gst_number: "29FGHIJ5678K1Z2", bank_account_number: "091234567890", bank_ifsc_code: "ICIC0004567", bank_account_holder: "HomeHarvest Living LLP" },
  { key: "fittrail", name: "Riya Kapoor", email: "seller.fittrail@shopsphere.test", business_name: "FitTrail Sports", business_description: "Performance gear and wellness products for runners, gym users and everyday athletes.", business_address: "27 Sector 18, Noida, Uttar Pradesh 201301", phone: "+91 98765 11003", gst_number: "09KLMNO9012P1Z7", bank_account_number: "334455667788", bank_ifsc_code: "SBIN0003344", bank_account_holder: "FitTrail Sports" },
  { key: "vastra", name: "Ishaan Khurana", email: "seller.vastra@shopsphere.test", business_name: "Vastra Couture", business_description: "Contemporary Indian fashion, western wear and accessories for modern wardrobes.", business_address: "208 MG Road, Jaipur, Rajasthan 302001", phone: "+91 98765 11004", gst_number: "08PQRST6789L1Z6", bank_account_number: "778899001122", bank_ifsc_code: "AXIS0007788", bank_account_holder: "Vastra Couture Pvt Ltd" },
  { key: "kitab", name: "Maya Iyer", email: "seller.kitab@shopsphere.test", business_name: "Kitab Kendra", business_description: "Handpicked bookstore with fiction, non-fiction, and academic titles across genres.", business_address: "5B Park Street, Kolkata, West Bengal 700016", phone: "+91 98765 11005", gst_number: "19UVWXY0123M1Z4", bank_account_number: "551122334455", bank_ifsc_code: "KKBK0005511", bank_account_holder: "Kitab Kendra" },
  { key: "glowup", name: "Sanya Kapoor", email: "seller.glowup@shopsphere.test", business_name: "GlowUp Beauty", business_description: "Clean beauty, skincare and haircare essentials for everyday routines.", business_address: "Shop 14, Khan Market, New Delhi, Delhi 110003", phone: "+91 98765 11006", gst_number: "07ZABCD3456N1Z1", bank_account_number: "998877665544", bank_ifsc_code: "YESB0009988", bank_account_holder: "GlowUp Beauty Pvt Ltd" },
];

export const CUSTOMERS = [
  { name: "Milan Bhimani", email: "milan.bhimani@shopsphere.test", phone: "+91 98111 22001", city: "Ahmedabad", state: "Gujarat", postal_code: "380015", address_line1: "B-204, Satyam Apartments, Vastrapur" },
  { name: "Karan Malhotra", email: "karan.malhotra@shopsphere.test", phone: "+91 98111 22002", city: "Gurugram", state: "Haryana", postal_code: "122002", address_line1: "14 Golf Course Road, DLF Phase 2" },
  { name: "Ananya Sen", email: "ananya.sen@shopsphere.test", phone: "+91 98111 22003", city: "Kolkata", state: "West Bengal", postal_code: "700019", address_line1: "6 Ballygunge Park, Flat 3A" },
  { name: "Rohan Verma", email: "rohan.verma@shopsphere.test", phone: "+91 98111 22004", city: "Mumbai", state: "Maharashtra", postal_code: "400053", address_line1: "1102 Lokhandwala Complex, Andheri West" },
  { name: "Sneha Gupta", email: "sneha.gupta@shopsphere.test", phone: "+91 98111 22005", city: "Pune", state: "Maharashtra", postal_code: "411045", address_line1: "Flat 7, Sunrise Residency, Baner" },
  { name: "Aditya Nair", email: "aditya.nair@shopsphere.test", phone: "+91 98111 22006", city: "Kochi", state: "Kerala", postal_code: "682020", address_line1: "22 Marine Drive, Ernakulam" },
  { name: "Pooja Reddy", email: "pooja.reddy@shopsphere.test", phone: "+91 98111 22007", city: "Hyderabad", state: "Telangana", postal_code: "500081", address_line1: "Plot 88, Jubilee Hills" },
  { name: "Vikram Singh", email: "vikram.singh@shopsphere.test", phone: "+91 98111 22008", city: "Chandigarh", state: "Chandigarh", postal_code: "160017", address_line1: "House 245, Sector 33" },
  { name: "Divya Krishnan", email: "divya.krishnan@shopsphere.test", phone: "+91 98111 22009", city: "Chennai", state: "Tamil Nadu", postal_code: "600040", address_line1: "12/4 Anna Nagar East" },
  { name: "Arjun Deshpande", email: "arjun.deshpande@shopsphere.test", phone: "+91 98111 22010", city: "Nagpur", state: "Maharashtra", postal_code: "440010", address_line1: "Flat 502, Orange County, Dharampeth" },
  { name: "Meera Joshi", email: "meera.joshi@shopsphere.test", phone: "+91 98111 22011", city: "Bengaluru", state: "Karnataka", postal_code: "560102", address_line1: "Tower C 1804, Prestige Lakeside, Whitefield" },
  { name: "Rahul Pillai", email: "rahul.pillai@shopsphere.test", phone: "+91 98111 22012", city: "Thiruvananthapuram", state: "Kerala", postal_code: "695001", address_line1: "8 Vellayambalam Lane" },
  { name: "Tanvi Shah", email: "tanvi.shah@shopsphere.test", phone: "+91 98111 22013", city: "Surat", state: "Gujarat", postal_code: "395007", address_line1: "C-12 Athwa Gate Apartments" },
  { name: "Nikhil Rao", email: "nikhil.rao@shopsphere.test", phone: "+91 98111 22014", city: "Bengaluru", state: "Karnataka", postal_code: "560095", address_line1: "Flat 9, Koramangala 6th Block" },
  { name: "Isha Chatterjee", email: "isha.chatterjee@shopsphere.test", phone: "+91 98111 22015", city: "New Delhi", state: "Delhi", postal_code: "110016", address_line1: "A-41 Hauz Khas Enclave" },
];

// 6 roots with tax_percent; each has children.
export const CATEGORY_TREE = [
  { key: "electronics", name: "Electronics", tax_percent: 18, children: [
    { key: "smartphones", name: "Smartphones" }, { key: "laptops", name: "Laptops" },
    { key: "audio", name: "Audio" }, { key: "wearables", name: "Wearables" } ] },
  { key: "home", name: "Home & Kitchen", tax_percent: 12, children: [
    { key: "kitchen-appliances", name: "Kitchen Appliances" }, { key: "furniture", name: "Furniture" },
    { key: "home-decor", name: "Home Decor" } ] },
  { key: "sports", name: "Sports & Fitness", tax_percent: 18, children: [
    { key: "fitness-equipment", name: "Fitness Equipment" }, { key: "recovery", name: "Recovery" },
    { key: "outdoor", name: "Outdoor" } ] },
  { key: "clothing", name: "Clothing & Fashion", tax_percent: 12, children: [
    { key: "mens-wear", name: "Men's Wear" }, { key: "womens-wear", name: "Women's Wear" },
    { key: "footwear", name: "Footwear" } ] },
  { key: "books", name: "Books", tax_percent: 5, children: [
    { key: "fiction", name: "Fiction" }, { key: "non-fiction", name: "Non-Fiction" },
    { key: "academic", name: "Academic" } ] },
  { key: "beauty", name: "Beauty & Personal Care", tax_percent: 18, children: [
    { key: "skincare", name: "Skincare" }, { key: "haircare", name: "Haircare" },
    { key: "fragrance", name: "Fragrance" } ] },
];

export const SELLER_BY_ROOT = {
  electronics: "techkart", home: "homeharvest", sports: "fittrail",
  clothing: "vastra", books: "kitab", beauty: "glowup",
};

// 35 products: 12 rich + 23 minimal.
// rich => has portions/modifiers/gallery and generates history orders.
export const PRODUCTS = [
  // ======== RICH (12) — 9 × 8mo + 3 × 4/5mo ========
  { rich: true, history_months: 8, leaf: "smartphones", display_name: "Apple iPhone 15 Pro Max",
    short: "Flagship iPhone with titanium body, A17 Pro chip and pro-grade camera.",
    description: "Apple's 2024 flagship with A17 Pro chip, titanium unibody, 48MP main camera and 5x telephoto. USB-C with ProRes video. 1-year Apple warranty.",
    price: 159900, discounted_price: 154900, stock: 48,
    portions: [{v:"256GB",delta:0},{v:"512GB",delta:20000},{v:"1TB",delta:40000}],
    modifiers: [{name:"Color",value:"Titanium Blue",type:"color"},{name:"Color",value:"Titanium Black",type:"color"},{name:"Color",value:"Natural Titanium",type:"color"}] },
  { rich: true, history_months: 8, leaf: "laptops", display_name: "Dell XPS 15 OLED",
    short: "15.6\" 3.5K OLED creator laptop with Intel Core i7 and RTX 4060.",
    description: "Dell XPS 15 with 3.5K OLED touch, i7-13700H, RTX 4060, 16GB DDR5, CNC aluminium chassis, 86Wh battery, Thunderbolt 4.",
    price: 179999, discounted_price: 174999, stock: 22,
    portions: [{v:"16GB / 512GB",delta:0},{v:"32GB / 1TB",delta:25000}],
    modifiers: [{name:"Color",value:"Platinum Silver",type:"color"}] },
  { rich: true, history_months: 8, leaf: "audio", display_name: "Sony WH-1000XM5 Wireless",
    short: "Industry-leading noise cancelling over-ear wireless headphones.",
    description: "Sony WH-1000XM5 with 8-mic ANC, 30h battery, LDAC hi-res, multi-point Bluetooth, speak-to-chat. Lightweight 250g.",
    price: 29990, discounted_price: 26990, stock: 55,
    portions: [{v:"Standard",delta:0}],
    modifiers: [{name:"Color",value:"Midnight Black",type:"color"},{name:"Color",value:"Silver",type:"color"}] },
  { rich: true, history_months: 8, leaf: "kitchen-appliances", display_name: "Breville Barista Express",
    short: "All-in-one espresso machine with built-in conical burr grinder.",
    description: "Integrated conical burr grinder, 15-bar Italian pump, PID temperature control, steam wand for micro-foam milk. Stainless steel, 2L tank.",
    price: 62999, discounted_price: 58999, stock: 14,
    portions: [{v:"Default",delta:0}],
    modifiers: [{name:"Color",value:"Brushed Stainless",type:"color"},{name:"Color",value:"Black Truffle",type:"color"}] },
  { rich: true, history_months: 8, leaf: "furniture", display_name: "Aeron Remastered Chair",
    short: "Herman Miller Aeron ergonomic office chair, remastered edition.",
    description: "8Z Pellicle suspension, PostureFit SL lumbar, fully adjustable arms, tilt limiter. 12-year warranty. Gold standard for long work sessions.",
    price: 89999, discounted_price: null, stock: 11,
    portions: [{v:"Size B (Medium)",delta:0},{v:"Size C (Large)",delta:7000}],
    modifiers: [{name:"Color",value:"Graphite",type:"color"},{name:"Color",value:"Mineral",type:"color"}] },
  { rich: true, history_months: 8, leaf: "wearables", display_name: "Garmin Forerunner 265",
    short: "GPS running watch with vivid AMOLED display and training readiness.",
    description: "Bright AMOLED touch, multi-band GPS, training readiness score, HRV status, suggested workouts. 13-day smartwatch battery.",
    price: 42990, discounted_price: 39990, stock: 19,
    portions: [{v:"46mm",delta:0},{v:"42mm (S)",delta:0}],
    modifiers: [{name:"Color",value:"Black",type:"color"},{name:"Color",value:"Whitestone",type:"color"}] },
  { rich: true, history_months: 8, leaf: "recovery", display_name: "Therabody Theragun Prime",
    short: "Percussive therapy device for muscle recovery and mobility.",
    description: "16mm amplitude percussive therapy, 5 speeds, QuietForce motor, Bluetooth with Therabody app. 120-min battery, 4 attachments.",
    price: 24999, discounted_price: 22999, stock: 24,
    portions: [{v:"Default",delta:0}],
    modifiers: [{name:"Color",value:"Black",type:"color"}] },
  { rich: true, history_months: 8, leaf: "mens-wear", display_name: "Levi's 511 Slim Jeans",
    short: "Classic 511 slim-fit jeans with comfortable stretch denim.",
    description: "99% cotton / 1% elastane stretch denim, mid-rise, slim through thigh and leg, zip fly, iconic Levi's leather patch.",
    price: 3499, discounted_price: 2799, stock: 90,
    portions: [{v:"W30 L32",delta:0},{v:"W32 L32",delta:0},{v:"W34 L32",delta:0},{v:"W36 L32",delta:0}],
    modifiers: [{name:"Color",value:"Dark Indigo",type:"color"},{name:"Color",value:"Stonewash",type:"color"}] },
  { rich: true, history_months: 8, leaf: "fiction", display_name: "The Midnight Library",
    short: "Matt Haig's #1 Sunday Times bestselling novel.",
    description: "Between life and death there is a library. Nora Seed faces infinite lives and must decide what is truly worth living for. Bestseller.",
    price: 499, discounted_price: 399, stock: 220,
    portions: [{v:"Paperback",delta:0},{v:"Hardcover",delta:300}],
    modifiers: [] },
  { rich: true, history_months: 4, leaf: "skincare", display_name: "The Ordinary Niacinamide 10% + Zinc 1%",
    short: "High-strength vitamin and mineral blemish formula.",
    description: "Concentrated serum with 10% niacinamide and 1% zinc PCA to reduce blemishes, congestion, and sebum activity. Vegan, cruelty-free.",
    price: 850, discounted_price: 680, stock: 160,
    portions: [{v:"30ml",delta:0},{v:"60ml",delta:450}],
    modifiers: [] },
  { rich: true, history_months: 5, leaf: "smartphones", display_name: "Nothing Phone (2)",
    short: "Glyph-equipped Android flagship with Snapdragon 8+ Gen 1.",
    description: "6.7\" 120Hz LTPO OLED, Snapdragon 8+ Gen 1, 4700mAh with 45W charging, 50MP dual cameras, signature Glyph Interface, Nothing OS 2.",
    price: 44999, discounted_price: 42999, stock: 38,
    portions: [{v:"8GB / 128GB",delta:0},{v:"12GB / 256GB",delta:5000},{v:"12GB / 512GB",delta:9000}],
    modifiers: [{name:"Color",value:"Dark Grey",type:"color"},{name:"Color",value:"White",type:"color"}] },
  { rich: true, history_months: 4, leaf: "womens-wear", display_name: "FabIndia Cotton Kurta Set",
    short: "Hand-block printed cotton kurta with matching pants and dupatta.",
    description: "Three-piece set in breathable pure cotton with Jaipuri hand-block prints. Straight-cut kurta with side slits, pants, and soft mulmul dupatta.",
    price: 2999, discounted_price: 2399, stock: 75,
    portions: [{v:"S",delta:0},{v:"M",delta:0},{v:"L",delta:0},{v:"XL",delta:0}],
    modifiers: [{name:"Color",value:"Indigo",type:"color"},{name:"Color",value:"Terracotta",type:"color"},{name:"Color",value:"Ivory",type:"color"}] },

  // ======== MINIMAL (23) ========
  { rich: false, history_months: 0, leaf: "kitchen-appliances", display_name: "Nespresso Vertuo Pop", short: "Compact pod coffee machine.", description: "Single-serve pod machine with one-touch brewing, 4 cup sizes, automatic capsule ejection.", price: 14999, discounted_price: 12999, stock: 28 },
  { rich: false, history_months: 0, leaf: "kitchen-appliances", display_name: "Philips Airfryer HD9200", short: "4.1L Rapid-air air fryer.", description: "Healthier frying with up to 90% less fat. 4.1L, dishwasher-safe parts, 7 presets.", price: 9999, discounted_price: 8499, stock: 42 },
  { rich: false, history_months: 0, leaf: "furniture", display_name: "IKEA Markus Office Chair", short: "Mesh-back ergonomic office chair.", description: "10-year warranty with mesh back, tilt tension, height adjustment.", price: 24999, discounted_price: null, stock: 30 },
  { rich: false, history_months: 0, leaf: "furniture", display_name: "Urban Ladder Oslo Bookshelf", short: "5-tier walnut bookshelf.", description: "Engineered-wood 5-tier open bookshelf in walnut finish. Holds up to 30kg per shelf.", price: 17500, discounted_price: 14999, stock: 18 },
  { rich: false, history_months: 0, leaf: "home-decor", display_name: "Philips Hue Color Starter Kit", short: "Smart lighting starter kit.", description: "Voice-enabled smart lighting, 16M colors, dimmable. 3 E27 bulbs + Hue Bridge.", price: 11499, discounted_price: 9999, stock: 36 },
  { rich: false, history_months: 0, leaf: "audio", display_name: "Bose SoundLink Flex", short: "Rugged portable Bluetooth speaker.", description: "IP67 waterproof, PositionIQ, 12-hour battery, silicone soft-touch exterior.", price: 18900, discounted_price: 16900, stock: 44 },
  { rich: false, history_months: 0, leaf: "audio", display_name: "JBL Tune 760NC", short: "Wireless ANC over-ear headphones.", description: "Active noise cancelling, JBL Pure Bass, 35h battery, multi-point connection.", price: 7999, discounted_price: 6499, stock: 62 },
  { rich: false, history_months: 0, leaf: "audio", display_name: "boAt Airdopes 141", short: "TWS earbuds with 42h playback.", description: "ENx mic noise cancellation, 42h total playback, IPX4, BEAST mode low latency.", price: 1499, discounted_price: 1199, stock: 180 },
  { rich: false, history_months: 0, leaf: "laptops", display_name: "HP Pavilion 14", short: "Intel Core i5 13th-gen laptop.", description: "i5-1340P, 16GB DDR4, 512GB NVMe, 14\" FHD IPS, backlit keyboard, Windows 11.", price: 65990, discounted_price: 59990, stock: 25 },
  { rich: false, history_months: 0, leaf: "wearables", display_name: "Apple Watch Series 9", short: "Apple Watch with S9 chip.", description: "S9 SiP, Double Tap, always-on Retina, fitness/health sensors, GPS, 50m water resistance.", price: 41900, discounted_price: 39900, stock: 33 },
  { rich: false, history_months: 0, leaf: "outdoor", display_name: "Decathlon Kalenji Running Shoes", short: "Lightweight road running shoes.", description: "Kalenji Run Active Grip. EVA midsole, breathable mesh upper, grippy rubber outsole.", price: 2299, discounted_price: null, stock: 85 },
  { rich: false, history_months: 0, leaf: "fitness-equipment", display_name: "Yonex Voltric 7 Badminton Racket", short: "Power graphite badminton racket.", description: "Graphite frame, tri-voltage system, 4U weight for head-heavy balance. Full cover included.", price: 4999, discounted_price: 4299, stock: 50 },
  { rich: false, history_months: 0, leaf: "fitness-equipment", display_name: "Cosco Yoga Mat 6mm", short: "Anti-skid 6mm TPE yoga mat.", description: "Eco-friendly 6mm TPE, anti-skid, moisture resistant, carry strap. 183 x 61cm.", price: 799, discounted_price: 599, stock: 220 },
  { rich: false, history_months: 0, leaf: "recovery", display_name: "Hyperice Hypervolt Go 2", short: "Portable percussive massage gun.", description: "Ultra-light 1.5lb, 3 speeds, 3h battery, whisper-quiet motor. Fits in a backpack.", price: 15999, discounted_price: 13999, stock: 27 },
  { rich: false, history_months: 0, leaf: "mens-wear", display_name: "Peter England Formal Shirt", short: "Regular-fit cotton-blend formal shirt.", description: "Cotton-blend with cutaway collar, button cuffs. Machine washable, easy-iron.", price: 1499, discounted_price: 999, stock: 140 },
  { rich: false, history_months: 0, leaf: "mens-wear", display_name: "Allen Solly Cotton Chinos", short: "Slim-fit stretch chinos.", description: "98% cotton / 2% elastane slim-fit chinos with flat-front styling.", price: 2199, discounted_price: 1799, stock: 110 },
  { rich: false, history_months: 0, leaf: "womens-wear", display_name: "Biba A-line Kurta", short: "Printed A-line rayon kurta.", description: "Rayon kurta, all-over print, three-quarter sleeves, side slits. Everyday ethnic wear.", price: 1899, discounted_price: 1299, stock: 95 },
  { rich: false, history_months: 0, leaf: "footwear", display_name: "Puma Carina Sneakers", short: "Everyday low-top sneakers.", description: "Soft foam insole, synthetic leather upper, rubber outsole. Classic everyday styling.", price: 3499, discounted_price: 2499, stock: 70 },
  { rich: false, history_months: 0, leaf: "non-fiction", display_name: "Atomic Habits — James Clear", short: "Proven framework for tiny changes.", description: "International bestseller on behaviour change — tiny changes, remarkable results.", price: 399, discounted_price: 299, stock: 300 },
  { rich: false, history_months: 0, leaf: "non-fiction", display_name: "Sapiens — Yuval Noah Harari", short: "A brief history of humankind.", description: "Sweeping narrative of how Homo sapiens rose to dominate the planet.", price: 499, discounted_price: 399, stock: 210 },
  { rich: false, history_months: 0, leaf: "academic", display_name: "NCERT Physics Class 12 (Part 1 & 2)", short: "Official NCERT Physics textbook set.", description: "NCERT Part 1 and Part 2 for CBSE Class 12 Physics. Essential for boards and JEE/NEET.", price: 350, discounted_price: null, stock: 400 },
  { rich: false, history_months: 0, leaf: "skincare", display_name: "Minimalist 10% Niacinamide Serum", short: "Niacinamide + zinc serum.", description: "10% niacinamide with 1% zinc PCA. Fragrance-free, vegan, dermatologically tested.", price: 599, discounted_price: 479, stock: 170 },
  { rich: false, history_months: 0, leaf: "haircare", display_name: "WOW Apple Cider Vinegar Shampoo", short: "Sulphate-free clarifying shampoo.", description: "Clarifying shampoo with apple cider vinegar, no parabens or sulphates. 300ml.", price: 499, discounted_price: 379, stock: 130 },
];

export const OFFERS = [
  { offer_name: "WELCOME100 — First Order", offer_type: "first_order", discount_type: "percentage", discount_value: 10, maximum_discount_amount: 500, min_purchase_amount: 1000, usage_limit_per_user: 1, daysOffsetStart: -240, daysOffsetEnd: 120, target: { kind: "global" }, description: "Welcome offer: 10% off your first order, up to ₹500." },
  { offer_name: "FLAT500 — Save Flat ₹500", offer_type: "flat_discount", discount_type: "fixed_amount", discount_value: 500, maximum_discount_amount: 500, min_purchase_amount: 4000, usage_limit_per_user: 3, daysOffsetStart: -180, daysOffsetEnd: 90, target: { kind: "global" }, description: "Flat ₹500 off on orders above ₹4000." },
  { offer_name: "ELECTRO15 — Electronics Fest", offer_type: "category_discount", discount_type: "percentage", discount_value: 15, maximum_discount_amount: 3000, min_purchase_amount: 10000, usage_limit_per_user: 2, daysOffsetStart: -210, daysOffsetEnd: 60, target: { kind: "category", categoryKey: "electronics" }, description: "15% off on all Electronics, max ₹3000." },
  { offer_name: "SUMMER — Seasonal Blast", offer_type: "time_based", discount_type: "percentage", discount_value: 20, maximum_discount_amount: 2000, min_purchase_amount: 2000, usage_limit_per_user: 1, daysOffsetStart: -150, daysOffsetEnd: 30, target: { kind: "global" }, description: "Summer season blast: 20% off up to ₹2000." },
  { offer_name: "SONYANC — Sony WH Deal", offer_type: "product_discount", discount_type: "fixed_amount", discount_value: 2500, maximum_discount_amount: 2500, min_purchase_amount: 25000, usage_limit_per_user: 1, daysOffsetStart: -120, daysOffsetEnd: 90, target: { kind: "product", productSlug: "sony-wh-1000xm5-wireless" }, description: "Flat ₹2500 off on Sony WH-1000XM5." },
  { offer_name: "BOOKSLOVE — Books Offer", offer_type: "category_discount", discount_type: "percentage", discount_value: 25, maximum_discount_amount: 200, min_purchase_amount: 500, usage_limit_per_user: 5, daysOffsetStart: -200, daysOffsetEnd: 120, target: { kind: "category", categoryKey: "books" }, description: "25% off on all Books, max ₹200." },
];

export const REVIEW_POS_TITLES = ["Absolutely love it", "Worth every rupee", "Exceeded expectations", "Great product, fast delivery", "Premium quality", "Highly recommend", "Genuine product", "Fantastic experience"];
export const REVIEW_MIXED_TITLES = ["Good but could be better", "Does the job", "Decent value", "Minor issues, overall okay"];
export const REVIEW_NEG_TITLES = ["Not as described", "Disappointed", "Had to return", "Quality issues"];
export const REVIEW_POS_BODIES = [
  "Build quality is top-notch and it arrived well-packaged. Using it daily for two weeks now with zero complaints.",
  "Exactly as shown. Works flawlessly. Would absolutely buy again.",
  "Fantastic value. Delivery was quick and the product came sealed.",
  "Been using this for a month — very happy with the performance. Five stars!",
  "Matches everything the description promised. Genuine piece, proper warranty.",
];
export const REVIEW_MIXED_BODIES = [
  "Good product overall, but the packaging was a bit dented on arrival. Item itself is fine.",
  "Does what it says. Not life-changing but solid for the price.",
  "Works well, though setup took longer than I expected.",
];
export const REVIEW_NEG_BODIES = [
  "Did not meet my expectations. The finish feels cheaper than shown.",
  "Had to return — there was a defect on arrival. Support was helpful though.",
];

export const ACTIVITY_ACTIONS = [
  { action: "login", entity_type: "user" },
  { action: "logout", entity_type: "user" },
  { action: "product_create", entity_type: "product" },
  { action: "product_update", entity_type: "product" },
  { action: "order_placed", entity_type: "order" },
  { action: "order_status_update", entity_type: "order" },
  { action: "review_submitted", entity_type: "review" },
  { action: "offer_created", entity_type: "offer" },
  { action: "seller_approved", entity_type: "user" },
];

export const PAYMENT_METHODS_ONLINE = ["credit_card", "debit_card", "stripe", "paypal", "bank_transfer"];
export const PAYMENT_METHODS_ALL = [...PAYMENT_METHODS_ONLINE, "cash_on_delivery"];
