// Basic shop configuration.
// You can edit these values anytime to change logo, phone, timing, etc.

const SHOP_CONFIG = {
  shopName: "Chrome Sports W.M",
  tagline: "All sports items in one place",
  phoneDisplay: "+91-9380240600",
  timing: "Mon–Sun, 10:30 AM – 10:00 PM",

  // WhatsApp number: digits only, no +, no spaces.
  whatsappNumber: "919841933585",

  // Logo file path relative to index.html
  logoPath: "logo.png",

  // RBAC: Admin password. Only users who enter this can see the Admin tab and CRUD.
  // Change this and keep it private. Session-based (cleared when browser closes).
  adminPassword: "chromeadmin",

  featuredIds: [],
  reviews: {
    "bat-1": [
      { author: "Rahul K.", rating: 5, text: "Excellent balance and pickup. Perfect for league matches." },
      { author: "Vikram S.", rating: 5, text: "Best bat in this range. Delivery was quick." }
    ],
    "ball-1": [
      { author: "Coach M.", rating: 4, text: "Good quality leather, holds shape well." }
    ],
    "shoe-1": [
      { author: "Priya N.", rating: 5, text: "Very comfortable and grip is great on wet ground." }
    ]
  },

  // Category → Sub-category → Professional caption (shown in filter bar)
  categories: {
    Cricket: {
      "English Willow": "Elite Performance",
      "Kashmir Willow": "Classic Run",
      "Leather Ball": "Match Ready",
      "Batting Gloves": "Grip & Protection"
    },
    Football: {
      "Studs": "Conquer the Field",
      "Training": "Train Like a Pro",
      "Accessories": "Gear Up"
    },
    Badminton: {
      "Yonex": "Master the Court",
      "Li-Ning": "Speed & Precision",
      "Apacs": "Power Play",
      "Transform": "Budget Friendly",
      "lei mei": "smash hitter"
    }
  },

  initialProducts: [
    {
      id: "bat-1",
      name: "Cricket Bat English Willow",
      description: "Grade 2 willow, leather ball ready, lightweight pickup.",
      price: 5500,
      discountPercent: 15,
      stock: 8,
      colors: ["natural", "blue grip"],
      image: "https://images.pexels.com/photos/2699484/pexels-photo-2699484.jpeg",
      category: "Cricket",
      sub_category: "English Willow"
    },
    {
      id: "ball-1",
      name: "Leather Cricket Ball",
      description: "4 piece, club match quality, waterproofed.",
      price: 450,
      discountPercent: 10,
      stock: 32,
      colors: ["red"],
      image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg",
      category: "Cricket",
      sub_category: "Leather Ball"
    },
    {
      id: "shoe-1",
      name: "Football Studs",
      description: "Firm ground studs, breathable mesh upper.",
      price: 2499,
      discountPercent: 20,
      stock: 14,
      colors: ["black", "blue", "neon"],
      image: "https://images.pexels.com/photos/3991870/pexels-photo-3991870.jpeg",
      category: "Football",
      sub_category: "Studs"
    }
  ]
};


