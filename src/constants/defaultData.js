export const DEFAULT_SHOP_SETTINGS = {
  shopName: "Mr. DODO",
  shopSubtitle: "PREMIUM DETAILING & CAR WASH",
  address: "Manarcad - Thiruvanchoor Bypass Road, Manarcad, Kottayam",
  phones: "Phno: 8138037450, 9947885856",
  email: "mrdododetailers@gmail.com",
  invoiceTitle: "INVOICE",
  defaultWarrantyNote: "Borophine Wash Every 3months to avail warranty. 1 free recoating",
  footerThankYou: "Thank You",
  footerTeam: "Team MR DODO",
  currencySymbol: "₹",
  invoicePrefix: "DODO-",
  nextInvoiceNum: 1042,
  googleDriveEmail: "mrdododetailers@gmail.com"
};

// Real Initial Team Member (Clean - no dummy staff)
export const DEFAULT_TEAM_MEMBERS = [
  {
    id: "team-1",
    name: "Mr. DODO Owner",
    role: "Owner / Director",
    category: "Owner",
    phone: "8138037450",
    location: "Manarcad, Kottayam",
    avatar: "",
    avatarColor: "bg-blue-600",
    joinedDate: "2026-01-01",
    notes: "Executive Director"
  }
];

// Real Customer (From your official bill - no dummy data)
export const DEFAULT_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Rev Fr. A V Varghese",
    titlePrefix: "Mr:",
    phone: "9061367927",
    location: "Manarcad, Kottayam",
    vehicleNumber: "KL 05 BE 6091",
    vehicleMake: "Toyota Hyrider",
    lastService: "Borophine Coating (3 year), Sun Film, Silencer Coating",
    lastServiceDate: "2026-03-07",
    totalSpent: 26000,
    visitsCount: 1,
    warrantyActive: true,
    warrantyExpiry: "2029-03-07",
    notes: "Borophine Wash Every 3months to avail warranty. 1 free recoating"
  }
];

// Clean Expenses (Empty by default - no dummy expenses)
export const DEFAULT_EXPENSES = [];

// Official Reference Bill (From your uploaded PDF)
export const SAMPLE_BILL = {
  id: "bill-sample-official",
  invoiceNumber: "DODO-1041",
  date: "2026-03-07",
  displayDate: "7 March 2026",
  titlePrefix: "Mr:",
  customerName: "Rev Fr. A V Varghese",
  customerPhone: "9061367927",
  vehicleNumber: "KL 05 BE 6091",
  vehicleMake: "Toyota Hyrider",
  items: [
    { id: "item-1", description: "Borophine Coating (3 year)", amount: 33000 },
    { id: "item-2", description: "Sun Film - Full Car", amount: 4000 },
    { id: "item-3", description: "Silencer Coating", amount: 2000 }
  ],
  discount: 13000,
  warrantyNote: "Borophine Wash Every 3months to avail warranty. 1 free recoating",
  paymentStatus: "paid",
  paymentMode: "UPI / GPay",
  managerName: "Mr. DODO Owner",
  createdAt: new Date("2026-03-07T10:30:00").toISOString(),
  updatedAt: new Date("2026-03-07T10:30:00").toISOString()
};

export const TITLE_PREFIXES = [
  "Mr:",
  "Mrs:",
  "Ms:",
  "Dr:",
  "Rev Fr:",
  "Pastor:",
  "Adv:",
  "Capt:",
  "M/s:"
];

// Comprehensive Car Makers with their top models
export const CAR_MAKERS = [
  {
    maker: "Toyota",
    badge: "🇯🇵 Toyota",
    models: [
      "Toyota Hyrider",
      "Toyota Innova Hycross",
      "Toyota Innova Crysta",
      "Toyota Fortuner",
      "Toyota Fortuner Legender",
      "Toyota Glanza",
      "Toyota Hilux",
      "Toyota Urban Cruiser Taisor",
      "Toyota Camry Hybrid",
      "Toyota Land Cruiser 300",
      "Toyota Vellfire"
    ]
  },
  {
    maker: "Mahindra",
    badge: "🇮🇳 Mahindra",
    models: [
      "Mahindra Thar",
      "Mahindra Thar Roxx",
      "Mahindra XUV700",
      "Mahindra Scorpio-N",
      "Mahindra Scorpio Classic",
      "Mahindra Bolero",
      "Mahindra Bolero Neo",
      "Mahindra XUV 3XO",
      "Mahindra XUV400 EV"
    ]
  },
  {
    maker: "Hyundai",
    badge: "🇰🇷 Hyundai",
    models: [
      "Hyundai Creta",
      "Hyundai Creta N Line",
      "Hyundai Alcazar",
      "Hyundai Verna",
      "Hyundai Venue",
      "Hyundai Venue N Line",
      "Hyundai i20",
      "Hyundai i20 N Line",
      "Hyundai Tucson",
      "Hyundai Ioniq 5 EV",
      "Hyundai Exter",
      "Hyundai Aura"
    ]
  },
  {
    maker: "Tata",
    badge: "🇮🇳 Tata",
    models: [
      "Tata Safari",
      "Tata Harrier",
      "Tata Nexon",
      "Tata Nexon EV",
      "Tata Curvv",
      "Tata Curvv EV",
      "Tata Punch",
      "Tata Punch EV",
      "Tata Altroz",
      "Tata Tiago",
      "Tata Tiago EV"
    ]
  },
  {
    maker: "Kia",
    badge: "🇰🇷 Kia",
    models: [
      "Kia Seltos",
      "Kia Sonet",
      "Kia Carens",
      "Kia Carnival",
      "Kia EV6"
    ]
  },
  {
    maker: "Maruti Suzuki",
    badge: "🇯🇵 Maruti",
    models: [
      "Maruti Suzuki Grand Vitara",
      "Maruti Suzuki Brezza",
      "Maruti Suzuki Fronx",
      "Maruti Suzuki Jimny",
      "Maruti Suzuki Swift",
      "Maruti Suzuki Baleno",
      "Maruti Suzuki Ertiga",
      "Maruti Suzuki XL6",
      "Maruti Suzuki Dzire",
      "Maruti Suzuki Invicto",
      "Maruti Suzuki Ciaz"
    ]
  },
  {
    maker: "Volkswagen & Skoda",
    badge: "🇩🇪 VW / Skoda",
    models: [
      "Volkswagen Virtus",
      "Volkswagen Taigun",
      "Volkswagen Tiguan",
      "Skoda Slavia",
      "Skoda Kushaq",
      "Skoda Kodiaq",
      "Skoda Kylaq",
      "Skoda Superb"
    ]
  },
  {
    maker: "Honda",
    badge: "🇯🇵 Honda",
    models: [
      "Honda City",
      "Honda City e:HEV Hybrid",
      "Honda Elevate",
      "Honda Amaze"
    ]
  },
  {
    maker: "Luxury & German",
    badge: "🇩🇪 Luxury",
    models: [
      "BMW 3 Series Gran Limousine",
      "BMW 5 Series",
      "BMW X1",
      "BMW X3",
      "BMW X5",
      "BMW M340i",
      "Mercedes-Benz C-Class",
      "Mercedes-Benz E-Class",
      "Mercedes-Benz GLC",
      "Mercedes-Benz GLE",
      "Mercedes-Benz S-Class",
      "Audi A4",
      "Audi A6",
      "Audi Q3",
      "Audi Q5",
      "Audi Q7",
      "Land Rover Defender",
      "Range Rover Evoque",
      "Range Rover Velar",
      "Jeep Compass",
      "Jeep Wrangler"
    ]
  }
];

export const SERVICE_CATEGORIES = [
  {
    category: "Coating & PPF",
    services: [
      { name: "Borophine Coating (3 year)", amount: 33000, note: "Borophine Wash Every 3months to avail warranty. 1 free recoating" },
      { name: "Borophine Coating (5 year)", amount: 45000, note: "Borophine Wash Every 3months to avail warranty. 2 free recoatings" },
      { name: "Ceramic Coating (9H - 3 year)", amount: 24000, note: "Quarterly inspection and maintenance wash recommended" },
      { name: "Ceramic Coating (10H - 5 year)", amount: 34000, note: "5-year warranty with annual maintenance schedule" },
      { name: "Graphene Coating (5 year)", amount: 38000, note: "Enhanced heat and water-spot resistance with 5-year warranty" },
      { name: "Paint Protection Film (PPF) - Full Body", amount: 85000, note: "Self-healing TPU film with 5-year anti-yellowing warranty" },
      { name: "Paint Protection Film (PPF) - High Impact Areas", amount: 28000, note: "Bumper, bonnet, mirrors, and door cups protected" }
    ]
  },
  {
    category: "Sun Film & Glass",
    services: [
      { name: "Sun Film - Full Car", amount: 4000, note: "Heat rejection ceramic sun control film" },
      { name: "Sun Film - Sides & Rear", amount: 3000, note: "High heat rejection tint for side and rear glasses" },
      { name: "Sun Film - Front Windshield Clear CR70", amount: 3500, note: "70% VLT legal ceramic film with 90% IR heat rejection" },
      { name: "Windshield Polishing & Rain Repellent Treatment", amount: 1800, note: "Hydrophobic water beading coating for crystal clarity" }
    ]
  },
  {
    category: "Protection & Underbody",
    services: [
      { name: "Silencer Coating", amount: 2000, note: "High-temperature zinc/aluminium anti-rust thermal coating" },
      { name: "Underbody Anti-Rust Coating", amount: 2500, note: "Heavy rubberized bitumen coating with 3-year warranty" },
      { name: "Engine Bay Dressing & Protective Coating", amount: 1200, note: "Degreasing, clean, and rodent-repellent lacquer finish" },
      { name: "Alloy Wheel Ceramic Coating (4 Wheels)", amount: 3000, note: "Brake dust repellent high-gloss finish" }
    ]
  },
  {
    category: "Washing & Detailing",
    services: [
      { name: "Premium Snow Foam Wash & Spray Wax", amount: 1200, note: "pH-neutral wash, tyre shine, and interior vacuuming" },
      { name: "Interior Deep Cleaning & Steam Sanitization", amount: 3500, note: "Roof, seats, carpet shampoo, dashboard restoration" },
      { name: "Leather Seat Deep Clean & Conditioning", amount: 2200, note: "UV protective balm and nourishment for leather" },
      { name: "Full Exterior Paint Decontamination & Polish", amount: 4500, note: "Clay bar, 2-stage compound cut, and mirror glaze" },
      { name: "Headlight Restoration & UV Clear Coat", amount: 1500, note: "Yellowing and haze removal with protective sealant" },
      { name: "AC Evaporator & Cabin Disinfection", amount: 1200, note: "Anti-bacterial fogging and cabin filter cleanup" }
    ]
  }
];
