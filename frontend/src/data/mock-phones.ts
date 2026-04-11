// src/data/mock-phones.ts
import type { Phone, PhoneBrand, SponsoredAd, SearchFilters, SearchResult } from '@/types/phone';

export const brands: PhoneBrand[] = [
  { id: 'b1', slug: 'honor', name: 'Honor', logoUrl: '/brands/honor.png', description: 'Honor is a smartphone brand originally a sub-brand of Huawei.', phoneCount: 4 },
  { id: 'b2', slug: 'samsung', name: 'Samsung', logoUrl: '/brands/samsung.png', description: 'Samsung Electronics is a South Korean multinational electronics company.', phoneCount: 5 },
  { id: 'b3', slug: 'apple', name: 'Apple', logoUrl: '/brands/apple.png', description: 'Apple Inc. is an American multinational technology company.', phoneCount: 3 },
  { id: 'b4', slug: 'xiaomi', name: 'Xiaomi', logoUrl: '/brands/xiaomi.png', description: 'Xiaomi Corporation is a Chinese electronics company.', phoneCount: 4 },
  { id: 'b5', slug: 'realme', name: 'Realme', logoUrl: '/brands/realme.png', description: 'Realme is a Chinese smartphone manufacturer.', phoneCount: 3 },
  { id: 'b6', slug: 'oppo', name: 'OPPO', logoUrl: '/brands/oppo.png', description: 'OPPO is a Chinese consumer electronics manufacturer.', phoneCount: 2 },
  { id: 'b7', slug: 'oneplus', name: 'OnePlus', logoUrl: '/brands/oneplus.png', description: 'OnePlus Technology is a Chinese smartphone manufacturer.', phoneCount: 2 },
  { id: 'b8', slug: 'google', name: 'Google', logoUrl: '/brands/google.png', description: 'Google Pixel phones are designed by Google.', phoneCount: 2 },
];

export const phones: Phone[] = [
  {
    id: 'p1',
    slug: 'honor-x8d',
    name: 'Honor X8d',
    brandId: 'b1',
    brand: brands[0],
    status: 'AVAILABLE',
    releaseDate: '2026-04-07',
    price: { amount: 37999, currency: 'BDT', label: 'Official' },
    priceUsd: 149,
    images: [
      { id: 'img1', url: 'https://placehold.co/400x500/1a1a2e/e0e0e0?text=Honor+X8d', thumbUrl: 'https://placehold.co/200x250/1a1a2e/e0e0e0?text=Honor+X8d', alt: 'Honor X8d', isPrimary: true, sortOrder: 0 },
      { id: 'img1b', url: 'https://placehold.co/400x500/2d2d44/e0e0e0?text=Honor+X8d+Back', alt: 'Honor X8d Back', isPrimary: false, sortOrder: 1 },
    ],
    keySpecs: {
      os: 'Android 15',
      storage: '256GB',
      ram: '8GB',
      mainCamera: '108+5MP',
      frontCamera: '16MP',
      display: '6.77" 1080x2392',
      battery: 'Li-Ion 7000mAh',
      fingerprint: 'On-screen',
      charger: '45W Fast Charging',
      resistanceRating: 'Splashproof, IP65',
      wifi: 'Wi-Fi 5 (4G)',
      glassProtection: 'Aluminosilicate Glass',
      bluetooth: '5.0',
    },
    specGroups: [
      {
        category: 'General',
        categorySlug: 'general',
        icon: 'mdi:information-outline',
        specs: [
          { id: 's1', name: 'Brand', slug: 'brand', value: 'Honor', isHighlight: false, isComparable: true },
          { id: 's2', name: 'Model', slug: 'model', value: 'X8d', isHighlight: false, isComparable: true },
          { id: 's3', name: 'Release Date', slug: 'release_date', value: '2026-04-07', displayValue: 'April 7, 2026', isHighlight: false, isComparable: false },
          { id: 's4', name: 'Status', slug: 'status', value: 'Available', isHighlight: false, isComparable: false },
        ],
      },
      {
        category: 'Display',
        categorySlug: 'display',
        icon: 'mdi:cellphone',
        specs: [
          { id: 's5', name: 'Size', slug: 'display_size', value: '6.77 inches', isHighlight: true, isComparable: true },
          { id: 's6', name: 'Resolution', slug: 'display_resolution', value: '1080 x 2392 pixels', isHighlight: false, isComparable: true },
          { id: 's7', name: 'Type', slug: 'display_type', value: 'IPS LCD', isHighlight: false, isComparable: true },
          { id: 's8', name: 'Refresh Rate', slug: 'refresh_rate', value: '90Hz', isHighlight: false, isComparable: true },
          { id: 's9', name: 'Protection', slug: 'glass_protection', value: 'Aluminosilicate Glass', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Hardware & Software',
        categorySlug: 'hardware',
        icon: 'mdi:chip',
        specs: [
          { id: 's10', name: 'Operating System', slug: 'os', value: 'Android 15', isHighlight: true, isComparable: true },
          { id: 's11', name: 'UI', slug: 'ui', value: 'MagicOS 10', isHighlight: false, isComparable: true },
          { id: 's12', name: 'Chipset', slug: 'chipset', value: 'Qualcomm Snapdragon 6s 4G Gen 2', isHighlight: false, isComparable: true },
          { id: 's13', name: 'CPU', slug: 'cpu', value: 'Octa-core', isHighlight: false, isComparable: true },
          { id: 's14', name: 'GPU', slug: 'gpu', value: 'Adreno 610', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Memory',
        categorySlug: 'memory',
        icon: 'mdi:memory',
        specs: [
          { id: 's15', name: 'RAM', slug: 'ram', value: '8GB', isHighlight: true, isComparable: true },
          { id: 's16', name: 'Storage', slug: 'storage', value: '256GB', isHighlight: true, isComparable: true },
          { id: 's17', name: 'Card Slot', slug: 'card_slot', value: 'microSDXC', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Camera',
        categorySlug: 'camera',
        icon: 'mdi:camera-outline',
        specs: [
          { id: 's18', name: 'Main Camera', slug: 'main_camera', value: '108+5MP', displayValue: '108 MP + 5 MP', isHighlight: true, isComparable: true },
          { id: 's19', name: 'Front Camera', slug: 'front_camera', value: '16MP', displayValue: '16 MP', isHighlight: true, isComparable: true },
          { id: 's20', name: 'Video Recording', slug: 'video', value: '1080p@30fps', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Battery',
        categorySlug: 'battery',
        icon: 'mdi:battery-high',
        specs: [
          { id: 's21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 7000mAh', isHighlight: true, isComparable: true },
          { id: 's22', name: 'Charging', slug: 'charger', value: '45W Fast Charging', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Connectivity',
        categorySlug: 'connectivity',
        icon: 'mdi:wifi',
        specs: [
          { id: 's23', name: 'Wi-Fi', slug: 'wifi', value: 'Wi-Fi 5', isHighlight: true, isComparable: true },
          { id: 's24', name: 'Bluetooth', slug: 'bluetooth', value: '5.0', isHighlight: true, isComparable: true },
          { id: 's25', name: 'USB', slug: 'usb', value: 'USB Type-C 2.0', isHighlight: false, isComparable: true },
          { id: 's26', name: 'NFC', slug: 'nfc', value: 'Yes', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Body',
        categorySlug: 'body',
        icon: 'mdi:ruler-square',
        specs: [
          { id: 's27', name: 'Dimensions', slug: 'dimensions', value: '166.8 x 76.5 x 7.9 mm', isHighlight: false, isComparable: true },
          { id: 's28', name: 'Weight', slug: 'weight', value: '199g', isHighlight: false, isComparable: true },
          { id: 's29', name: 'IP Rating', slug: 'resistance_rating', value: 'IP65', displayValue: 'Splashproof, IP65', isHighlight: true, isComparable: true },
          { id: 's30', name: 'Fingerprint', slug: 'fingerprint', value: 'On-screen', isHighlight: true, isComparable: true },
        ],
      },
    ],
    reviews: [
      {
        id: 'r1',
        title: 'Great Budget Phone',
        content: 'The Honor X8d offers excellent value with its massive battery and capable camera system.',
        rating: 8.2,
        pros: ['Massive 7000mAh battery', '108MP camera', 'Large display', 'Good storage'],
        cons: ['4G only', 'IPS LCD display', 'Average GPU performance'],
        verdict: 'Best budget phone of 2026 for battery life enthusiasts.',
        authorName: 'PhoneSpec Review',
        publishedAt: '2026-04-10',
      },
    ],
    popularity: 95,
    viewCount: 15420,
  },
  {
    id: 'p2',
    slug: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    brandId: 'b2',
    brand: brands[1],
    status: 'AVAILABLE',
    releaseDate: '2025-01-22',
    price: { amount: 1299, currency: 'USD', label: 'Official' },
    priceUsd: 1299,
    images: [
      { id: 'img2', url: 'https://placehold.co/400x500/0d1117/e0e0e0?text=Galaxy+S25+Ultra', thumbUrl: 'https://placehold.co/200x250/0d1117/e0e0e0?text=S25+Ultra', alt: 'Samsung Galaxy S25 Ultra', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 15',
      storage: '256GB / 512GB / 1TB',
      ram: '12GB',
      mainCamera: '200+50+10+50MP',
      frontCamera: '12MP',
      display: '6.9" 1440x3120',
      battery: 'Li-Ion 5000mAh',
      fingerprint: 'Under display, ultrasonic',
      charger: '45W Fast Charging',
      resistanceRating: 'IP68',
      wifi: 'Wi-Fi 7',
      glassProtection: 'Corning Gorilla Armor 2',
      bluetooth: '5.4',
    },
    specGroups: [
      {
        category: 'General',
        categorySlug: 'general',
        icon: 'mdi:information-outline',
        specs: [
          { id: 'ss1', name: 'Brand', slug: 'brand', value: 'Samsung', isHighlight: false, isComparable: true },
          { id: 'ss2', name: 'Model', slug: 'model', value: 'Galaxy S25 Ultra', isHighlight: false, isComparable: true },
          { id: 'ss3', name: 'Release Date', slug: 'release_date', value: '2025-01-22', displayValue: 'January 22, 2025', isHighlight: false, isComparable: false },
        ],
      },
      {
        category: 'Display',
        categorySlug: 'display',
        icon: 'mdi:cellphone',
        specs: [
          { id: 'ss5', name: 'Size', slug: 'display_size', value: '6.9 inches', isHighlight: true, isComparable: true },
          { id: 'ss6', name: 'Resolution', slug: 'display_resolution', value: '1440 x 3120 pixels', isHighlight: false, isComparable: true },
          { id: 'ss7', name: 'Type', slug: 'display_type', value: 'Dynamic AMOLED 2X', isHighlight: false, isComparable: true },
          { id: 'ss8', name: 'Refresh Rate', slug: 'refresh_rate', value: '120Hz', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Hardware & Software',
        categorySlug: 'hardware',
        icon: 'mdi:chip',
        specs: [
          { id: 'ss10', name: 'Operating System', slug: 'os', value: 'Android 15', isHighlight: true, isComparable: true },
          { id: 'ss11', name: 'UI', slug: 'ui', value: 'One UI 7', isHighlight: false, isComparable: true },
          { id: 'ss12', name: 'Chipset', slug: 'chipset', value: 'Snapdragon 8 Elite', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Memory',
        categorySlug: 'memory',
        icon: 'mdi:memory',
        specs: [
          { id: 'ss15', name: 'RAM', slug: 'ram', value: '12GB', isHighlight: true, isComparable: true },
          { id: 'ss16', name: 'Storage', slug: 'storage', value: '256GB / 512GB / 1TB', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Camera',
        categorySlug: 'camera',
        icon: 'mdi:camera-outline',
        specs: [
          { id: 'ss18', name: 'Main Camera', slug: 'main_camera', value: '200+50+10+50MP', isHighlight: true, isComparable: true },
          { id: 'ss19', name: 'Front Camera', slug: 'front_camera', value: '12MP', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Battery',
        categorySlug: 'battery',
        icon: 'mdi:battery-high',
        specs: [
          { id: 'ss21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 5000mAh', isHighlight: true, isComparable: true },
          { id: 'ss22', name: 'Charging', slug: 'charger', value: '45W Fast Charging', isHighlight: true, isComparable: true },
        ],
      },
    ],
    reviews: [],
    popularity: 98,
    viewCount: 89200,
    isFeatured: true,
  },
  {
    id: 'p3',
    slug: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    brandId: 'b3',
    brand: brands[2],
    status: 'AVAILABLE',
    releaseDate: '2024-09-20',
    price: { amount: 1199, currency: 'USD', label: 'Official' },
    priceUsd: 1199,
    images: [
      { id: 'img3', url: 'https://placehold.co/400x500/1c1c1e/e0e0e0?text=iPhone+16+Pro+Max', thumbUrl: 'https://placehold.co/200x250/1c1c1e/e0e0e0?text=iPhone+16', alt: 'iPhone 16 Pro Max', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'iOS 18',
      storage: '256GB / 512GB / 1TB',
      ram: '8GB',
      mainCamera: '48+12+48MP',
      frontCamera: '12MP',
      display: '6.9" 1320x2868',
      battery: 'Li-Ion 4685mAh',
      fingerprint: 'Face ID',
      charger: '27W Fast Charging',
      resistanceRating: 'IP68',
      wifi: 'Wi-Fi 7',
      glassProtection: 'Ceramic Shield',
      bluetooth: '5.3',
    },
    specGroups: [
      {
        category: 'General', categorySlug: 'general', icon: 'mdi:information-outline',
        specs: [
          { id: 'a1', name: 'Brand', slug: 'brand', value: 'Apple', isHighlight: false, isComparable: true },
          { id: 'a2', name: 'Model', slug: 'model', value: 'iPhone 16 Pro Max', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone',
        specs: [
          { id: 'a5', name: 'Size', slug: 'display_size', value: '6.9 inches', isHighlight: true, isComparable: true },
          { id: 'a6', name: 'Type', slug: 'display_type', value: 'Super Retina XDR OLED', isHighlight: false, isComparable: true },
          { id: 'a7', name: 'Refresh Rate', slug: 'refresh_rate', value: '120Hz ProMotion', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Hardware & Software', categorySlug: 'hardware', icon: 'mdi:chip',
        specs: [
          { id: 'a10', name: 'Operating System', slug: 'os', value: 'iOS 18', isHighlight: true, isComparable: true },
          { id: 'a12', name: 'Chipset', slug: 'chipset', value: 'Apple A18 Pro', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory',
        specs: [
          { id: 'a15', name: 'RAM', slug: 'ram', value: '8GB', isHighlight: true, isComparable: true },
          { id: 'a16', name: 'Storage', slug: 'storage', value: '256GB / 512GB / 1TB', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline',
        specs: [
          { id: 'a18', name: 'Main Camera', slug: 'main_camera', value: '48+12+48MP', isHighlight: true, isComparable: true },
          { id: 'a19', name: 'Front Camera', slug: 'front_camera', value: '12MP TrueDepth', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high',
        specs: [
          { id: 'a21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 4685mAh', isHighlight: true, isComparable: true },
          { id: 'a22', name: 'Charging', slug: 'charger', value: '27W Fast + MagSafe 25W', isHighlight: true, isComparable: true },
        ],
      },
    ],
    reviews: [],
    popularity: 99,
    viewCount: 125000,
    isFeatured: true,
  },
  {
    id: 'p4',
    slug: 'xiaomi-14-ultra',
    name: 'Xiaomi 14 Ultra',
    brandId: 'b4',
    brand: brands[3],
    status: 'AVAILABLE',
    releaseDate: '2024-02-22',
    price: { amount: 999, currency: 'USD', label: 'Official' },
    priceUsd: 999,
    images: [
      { id: 'img4', url: 'https://placehold.co/400x500/2d1b69/e0e0e0?text=Xiaomi+14+Ultra', thumbUrl: 'https://placehold.co/200x250/2d1b69/e0e0e0?text=Xiaomi+14U', alt: 'Xiaomi 14 Ultra', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 14',
      storage: '256GB / 512GB / 1TB',
      ram: '16GB',
      mainCamera: '50+50+50+50MP Leica',
      frontCamera: '32MP',
      display: '6.73" 1440x3200',
      battery: 'Li-Ion 5300mAh',
      fingerprint: 'Under display, ultrasonic',
      charger: '90W Fast Charging',
      resistanceRating: 'IP68',
      wifi: 'Wi-Fi 7',
      glassProtection: 'Xiaomi Shield Glass',
      bluetooth: '5.4',
    },
    specGroups: [
      {
        category: 'General', categorySlug: 'general', icon: 'mdi:information-outline',
        specs: [
          { id: 'x1', name: 'Brand', slug: 'brand', value: 'Xiaomi', isHighlight: false, isComparable: true },
          { id: 'x2', name: 'Model', slug: 'model', value: '14 Ultra', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone',
        specs: [
          { id: 'x5', name: 'Size', slug: 'display_size', value: '6.73 inches', isHighlight: true, isComparable: true },
          { id: 'x7', name: 'Type', slug: 'display_type', value: 'LTPO AMOLED', isHighlight: false, isComparable: true },
          { id: 'x8', name: 'Refresh Rate', slug: 'refresh_rate', value: '120Hz', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Hardware & Software', categorySlug: 'hardware', icon: 'mdi:chip',
        specs: [
          { id: 'x10', name: 'Operating System', slug: 'os', value: 'Android 14', isHighlight: true, isComparable: true },
          { id: 'x12', name: 'Chipset', slug: 'chipset', value: 'Snapdragon 8 Gen 3', isHighlight: false, isComparable: true },
        ],
      },
      {
        category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory',
        specs: [
          { id: 'x15', name: 'RAM', slug: 'ram', value: '16GB', isHighlight: true, isComparable: true },
          { id: 'x16', name: 'Storage', slug: 'storage', value: '256GB / 512GB / 1TB', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline',
        specs: [
          { id: 'x18', name: 'Main Camera', slug: 'main_camera', value: '50+50+50+50MP Leica', isHighlight: true, isComparable: true },
          { id: 'x19', name: 'Front Camera', slug: 'front_camera', value: '32MP', isHighlight: true, isComparable: true },
        ],
      },
      {
        category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high',
        specs: [
          { id: 'x21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 5300mAh', isHighlight: true, isComparable: true },
          { id: 'x22', name: 'Charging', slug: 'charger', value: '90W + 50W Wireless', isHighlight: true, isComparable: true },
        ],
      },
    ],
    reviews: [],
    popularity: 88,
    viewCount: 45600,
    isFeatured: true,
  },
  {
    id: 'p5',
    slug: 'realme-12-pro-plus',
    name: 'Realme 12 Pro+',
    brandId: 'b5',
    brand: brands[4],
    status: 'AVAILABLE',
    releaseDate: '2024-01-29',
    price: { amount: 349, currency: 'USD', label: 'Official' },
    priceUsd: 349,
    images: [
      { id: 'img5', url: 'https://placehold.co/400x500/6b4226/e0e0e0?text=Realme+12+Pro%2B', thumbUrl: 'https://placehold.co/200x250/6b4226/e0e0e0?text=Realme+12', alt: 'Realme 12 Pro+', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 14',
      storage: '256GB',
      ram: '8GB / 12GB',
      mainCamera: '50+64+8MP',
      frontCamera: '32MP',
      display: '6.7" 1080x2412',
      battery: 'Li-Ion 5000mAh',
      fingerprint: 'Under display, optical',
      charger: '67W SUPERVOOC',
      resistanceRating: 'IP65',
      wifi: 'Wi-Fi 6',
      glassProtection: 'Gorilla Glass 5',
      bluetooth: '5.2',
    },
    specGroups: [
      { category: 'General', categorySlug: 'general', icon: 'mdi:information-outline', specs: [{ id: 'r1', name: 'Brand', slug: 'brand', value: 'Realme', isHighlight: false, isComparable: true }] },
      { category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone', specs: [{ id: 'r5', name: 'Size', slug: 'display_size', value: '6.7 inches', isHighlight: true, isComparable: true }] },
      { category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory', specs: [{ id: 'r15', name: 'RAM', slug: 'ram', value: '8GB / 12GB', isHighlight: true, isComparable: true }, { id: 'r16', name: 'Storage', slug: 'storage', value: '256GB', isHighlight: true, isComparable: true }] },
      { category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline', specs: [{ id: 'r18', name: 'Main Camera', slug: 'main_camera', value: '50+64+8MP', isHighlight: true, isComparable: true }] },
      { category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high', specs: [{ id: 'r21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 5000mAh', isHighlight: true, isComparable: true }] },
    ],
    reviews: [],
    popularity: 75,
    viewCount: 23000,
  },
  {
    id: 'p6',
    slug: 'samsung-galaxy-a56',
    name: 'Samsung Galaxy A56',
    brandId: 'b2',
    brand: brands[1],
    status: 'AVAILABLE',
    releaseDate: '2025-03-13',
    price: { amount: 449, currency: 'USD', label: 'Official' },
    priceUsd: 449,
    images: [
      { id: 'img6', url: 'https://placehold.co/400x500/1a3a5c/e0e0e0?text=Galaxy+A56', thumbUrl: 'https://placehold.co/200x250/1a3a5c/e0e0e0?text=A56', alt: 'Samsung Galaxy A56', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 15',
      storage: '128GB / 256GB',
      ram: '8GB / 12GB',
      mainCamera: '50+12+5MP',
      frontCamera: '12MP',
      display: '6.7" 1080x2340',
      battery: 'Li-Ion 5000mAh',
      fingerprint: 'Under display, optical',
      charger: '45W Fast Charging',
      resistanceRating: 'IP67',
      wifi: 'Wi-Fi 6',
      glassProtection: 'Gorilla Glass Victus+',
      bluetooth: '5.3',
    },
    specGroups: [
      { category: 'General', categorySlug: 'general', icon: 'mdi:information-outline', specs: [{ id: 'ga1', name: 'Brand', slug: 'brand', value: 'Samsung', isHighlight: false, isComparable: true }] },
      { category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone', specs: [{ id: 'ga5', name: 'Size', slug: 'display_size', value: '6.7 inches', isHighlight: true, isComparable: true }, { id: 'ga7', name: 'Type', slug: 'display_type', value: 'Super AMOLED', isHighlight: false, isComparable: true }] },
      { category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory', specs: [{ id: 'ga15', name: 'RAM', slug: 'ram', value: '8GB / 12GB', isHighlight: true, isComparable: true }, { id: 'ga16', name: 'Storage', slug: 'storage', value: '128GB / 256GB', isHighlight: true, isComparable: true }] },
      { category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline', specs: [{ id: 'ga18', name: 'Main Camera', slug: 'main_camera', value: '50+12+5MP', isHighlight: true, isComparable: true }] },
      { category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high', specs: [{ id: 'ga21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 5000mAh', isHighlight: true, isComparable: true }] },
    ],
    reviews: [],
    popularity: 82,
    viewCount: 34500,
    isFeatured: true,
  },
  {
    id: 'p7',
    slug: 'google-pixel-9-pro',
    name: 'Google Pixel 9 Pro',
    brandId: 'b8',
    brand: brands[7],
    status: 'AVAILABLE',
    releaseDate: '2024-08-22',
    price: { amount: 999, currency: 'USD', label: 'Official' },
    priceUsd: 999,
    images: [
      { id: 'img7', url: 'https://placehold.co/400x500/2d4a22/e0e0e0?text=Pixel+9+Pro', thumbUrl: 'https://placehold.co/200x250/2d4a22/e0e0e0?text=Pixel+9', alt: 'Google Pixel 9 Pro', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 14',
      storage: '128GB / 256GB / 512GB / 1TB',
      ram: '16GB',
      mainCamera: '50+48+48MP',
      frontCamera: '42MP',
      display: '6.3" 1280x2856',
      battery: 'Li-Ion 4700mAh',
      fingerprint: 'Under display, optical',
      charger: '27W Fast Charging',
      resistanceRating: 'IP68',
      wifi: 'Wi-Fi 7',
      glassProtection: 'Gorilla Glass Victus 2',
      bluetooth: '5.3',
    },
    specGroups: [
      { category: 'General', categorySlug: 'general', icon: 'mdi:information-outline', specs: [{ id: 'gp1', name: 'Brand', slug: 'brand', value: 'Google', isHighlight: false, isComparable: true }] },
      { category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone', specs: [{ id: 'gp5', name: 'Size', slug: 'display_size', value: '6.3 inches', isHighlight: true, isComparable: true }] },
      { category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory', specs: [{ id: 'gp15', name: 'RAM', slug: 'ram', value: '16GB', isHighlight: true, isComparable: true }, { id: 'gp16', name: 'Storage', slug: 'storage', value: '128-1TB', isHighlight: true, isComparable: true }] },
      { category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline', specs: [{ id: 'gp18', name: 'Main Camera', slug: 'main_camera', value: '50+48+48MP', isHighlight: true, isComparable: true }] },
      { category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high', specs: [{ id: 'gp21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 4700mAh', isHighlight: true, isComparable: true }] },
    ],
    reviews: [],
    popularity: 90,
    viewCount: 56000,
  },
  {
    id: 'p8',
    slug: 'oneplus-13',
    name: 'OnePlus 13',
    brandId: 'b7',
    brand: brands[6],
    status: 'AVAILABLE',
    releaseDate: '2025-01-07',
    price: { amount: 899, currency: 'USD', label: 'Official' },
    priceUsd: 899,
    images: [
      { id: 'img8', url: 'https://placehold.co/400x500/8B0000/e0e0e0?text=OnePlus+13', thumbUrl: 'https://placehold.co/200x250/8B0000/e0e0e0?text=OP+13', alt: 'OnePlus 13', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 15',
      storage: '256GB / 512GB',
      ram: '12GB / 16GB / 24GB',
      mainCamera: '50+50+50MP Hasselblad',
      frontCamera: '32MP',
      display: '6.82" 1440x3168',
      battery: 'Li-Ion 6000mAh',
      fingerprint: 'Under display, ultrasonic',
      charger: '100W SUPERVOOC + 50W Wireless',
      resistanceRating: 'IP69',
      wifi: 'Wi-Fi 7',
      glassProtection: 'Crystal Shield Glass',
      bluetooth: '5.4',
    },
    specGroups: [
      { category: 'General', categorySlug: 'general', icon: 'mdi:information-outline', specs: [{ id: 'op1', name: 'Brand', slug: 'brand', value: 'OnePlus', isHighlight: false, isComparable: true }] },
      { category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone', specs: [{ id: 'op5', name: 'Size', slug: 'display_size', value: '6.82 inches', isHighlight: true, isComparable: true }, { id: 'op7', name: 'Type', slug: 'display_type', value: 'LTPO AMOLED', isHighlight: false, isComparable: true }] },
      { category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory', specs: [{ id: 'op15', name: 'RAM', slug: 'ram', value: '12-24GB', isHighlight: true, isComparable: true }, { id: 'op16', name: 'Storage', slug: 'storage', value: '256-512GB', isHighlight: true, isComparable: true }] },
      { category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline', specs: [{ id: 'op18', name: 'Main Camera', slug: 'main_camera', value: '50+50+50MP Hasselblad', isHighlight: true, isComparable: true }] },
      { category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high', specs: [{ id: 'op21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 6000mAh', isHighlight: true, isComparable: true }] },
    ],
    reviews: [],
    popularity: 91,
    viewCount: 62000,
    isFeatured: true,
  },
  {
    id: 'p9',
    slug: 'honor-magic-7-pro',
    name: 'Honor Magic 7 Pro',
    brandId: 'b1',
    brand: brands[0],
    status: 'AVAILABLE',
    releaseDate: '2025-01-13',
    price: { amount: 799, currency: 'USD', label: 'Official' },
    priceUsd: 799,
    images: [
      { id: 'img9', url: 'https://placehold.co/400x500/003366/e0e0e0?text=Honor+Magic7+Pro', thumbUrl: 'https://placehold.co/200x250/003366/e0e0e0?text=Magic7', alt: 'Honor Magic 7 Pro', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 15',
      storage: '256GB / 512GB',
      ram: '12GB',
      mainCamera: '50+50+50MP',
      frontCamera: '16MP',
      display: '6.78" 1264x2800',
      battery: 'Si-C 5850mAh',
      fingerprint: 'Under display, ultrasonic 3D',
      charger: '100W Wired + 80W Wireless',
      resistanceRating: 'IP68/IP69',
      wifi: 'Wi-Fi 7',
      glassProtection: 'NanoCrystal Glass',
      bluetooth: '5.4',
    },
    specGroups: [
      { category: 'General', categorySlug: 'general', icon: 'mdi:information-outline', specs: [{ id: 'hm1', name: 'Brand', slug: 'brand', value: 'Honor', isHighlight: false, isComparable: true }] },
      { category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone', specs: [{ id: 'hm5', name: 'Size', slug: 'display_size', value: '6.78 inches', isHighlight: true, isComparable: true }] },
      { category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory', specs: [{ id: 'hm15', name: 'RAM', slug: 'ram', value: '12GB', isHighlight: true, isComparable: true }] },
      { category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline', specs: [{ id: 'hm18', name: 'Main Camera', slug: 'main_camera', value: '50+50+50MP', isHighlight: true, isComparable: true }] },
      { category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high', specs: [{ id: 'hm21', name: 'Capacity', slug: 'battery', value: 'Si-C 5850mAh', isHighlight: true, isComparable: true }] },
    ],
    reviews: [],
    popularity: 87,
    viewCount: 41000,
    isSponsored: true,
  },
  {
    id: 'p10',
    slug: 'xiaomi-redmi-note-14-pro',
    name: 'Xiaomi Redmi Note 14 Pro',
    brandId: 'b4',
    brand: brands[3],
    status: 'AVAILABLE',
    releaseDate: '2025-01-10',
    price: { amount: 279, currency: 'USD', label: 'Official' },
    priceUsd: 279,
    images: [
      { id: 'img10', url: 'https://placehold.co/400x500/FF6600/e0e0e0?text=Redmi+Note14+Pro', thumbUrl: 'https://placehold.co/200x250/FF6600/e0e0e0?text=RN14Pro', alt: 'Redmi Note 14 Pro', isPrimary: true, sortOrder: 0 },
    ],
    keySpecs: {
      os: 'Android 14',
      storage: '128GB / 256GB',
      ram: '8GB',
      mainCamera: '200+8+2MP',
      frontCamera: '16MP',
      display: '6.67" 1220x2712',
      battery: 'Li-Ion 5500mAh',
      fingerprint: 'Under display, optical',
      charger: '45W HyperCharge',
      resistanceRating: 'IP64',
      wifi: 'Wi-Fi 5',
      glassProtection: 'Gorilla Glass 5',
      bluetooth: '5.3',
    },
    specGroups: [
      { category: 'General', categorySlug: 'general', icon: 'mdi:information-outline', specs: [{ id: 'rn1', name: 'Brand', slug: 'brand', value: 'Xiaomi', isHighlight: false, isComparable: true }] },
      { category: 'Display', categorySlug: 'display', icon: 'mdi:cellphone', specs: [{ id: 'rn5', name: 'Size', slug: 'display_size', value: '6.67 inches', isHighlight: true, isComparable: true }] },
      { category: 'Memory', categorySlug: 'memory', icon: 'mdi:memory', specs: [{ id: 'rn15', name: 'RAM', slug: 'ram', value: '8GB', isHighlight: true, isComparable: true }] },
      { category: 'Camera', categorySlug: 'camera', icon: 'mdi:camera-outline', specs: [{ id: 'rn18', name: 'Main Camera', slug: 'main_camera', value: '200+8+2MP', isHighlight: true, isComparable: true }] },
      { category: 'Battery', categorySlug: 'battery', icon: 'mdi:battery-high', specs: [{ id: 'rn21', name: 'Capacity', slug: 'battery', value: 'Li-Ion 5500mAh', isHighlight: true, isComparable: true }] },
    ],
    reviews: [],
    popularity: 85,
    viewCount: 38000,
  },
];

export const sponsoredAds: SponsoredAd[] = [
  {
    id: 'ad1',
    type: 'sidebar',
    title: 'Honor Magic 7 Pro',
    description: 'Experience the future with Honor Magic 7 Pro. 100W charging, Flagship camera.',
    imageUrl: 'https://placehold.co/300x250/003366/e0e0e0?text=Honor+Magic7+Pro+Ad',
    targetUrl: '/en/phones/honor/honor-magic-7-pro',
    impressions: 15000,
    clicks: 450,
  },
  {
    id: 'ad2',
    type: 'banner',
    title: 'Samsung Galaxy S25 Ultra',
    description: 'The ultimate flagship. Now with Galaxy AI built in.',
    imageUrl: 'https://placehold.co/728x90/0d1117/e0e0e0?text=Samsung+Galaxy+S25+Ultra+-+Galaxy+AI',
    targetUrl: '/en/phones/samsung/samsung-galaxy-s25-ultra',
    impressions: 25000,
    clicks: 820,
  },
  {
    id: 'ad3',
    type: 'sidebar',
    title: 'OnePlus 13',
    description: 'Power beyond your imagination. 100W SUPERVOOC. Hasselblad Camera.',
    imageUrl: 'https://placehold.co/300x250/8B0000/e0e0e0?text=OnePlus+13+Ad',
    targetUrl: '/en/phones/oneplus/oneplus-13',
    impressions: 12000,
    clicks: 350,
  },
];

export function searchPhones(query: string, filters: SearchFilters = {}): SearchResult {
  let results = [...phones];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q) ||
        p.slug.includes(q) ||
        Object.values(p.keySpecs).some((v) => v?.toLowerCase().includes(q))
    );
  }

  if (filters.brand) {
    results = results.filter((p) => p.brand.slug === filters.brand);
  }
  if (filters.priceMin !== undefined) {
    results = results.filter((p) => (p.priceUsd || 0) >= (filters.priceMin || 0));
  }
  if (filters.priceMax !== undefined) {
    results = results.filter((p) => (p.priceUsd || 0) <= (filters.priceMax || Infinity));
  }
  if (filters.status) {
    results = results.filter((p) => p.status === filters.status);
  }
  if (filters.ram) {
    results = results.filter((p) => p.keySpecs.ram?.includes(filters.ram!));
  }
  if (filters.storage) {
    results = results.filter((p) => p.keySpecs.storage?.includes(filters.storage!));
  }

  // Sort
  switch (filters.sortBy) {
    case 'newest':
      results.sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
      break;
    case 'price_asc':
      results.sort((a, b) => (a.priceUsd || 0) - (b.priceUsd || 0));
      break;
    case 'price_desc':
      results.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0));
      break;
    case 'popularity':
      results.sort((a, b) => b.popularity - a.popularity);
      break;
    default:
      // Relevance: sponsored first, then popularity
      results.sort((a, b) => {
        if (a.isSponsored && !b.isSponsored) return -1;
        if (!a.isSponsored && b.isSponsored) return 1;
        return b.popularity - a.popularity;
      });
  }

  const sponsored = results.filter((p) => p.isSponsored);

  return {
    phones: results,
    total: results.length,
    page: 1,
    pageSize: 20,
    sponsored,
  };
}

export function getPhoneBySlug(brandSlug: string, phoneSlug: string): Phone | undefined {
  return phones.find((p) => p.brand.slug === brandSlug && p.slug === phoneSlug);
}

export function getPhonesByBrand(brandSlug: string): Phone[] {
  return phones.filter((p) => p.brand.slug === brandSlug);
}

export function getFeaturedPhones(): Phone[] {
  return phones.filter((p) => p.isFeatured).sort((a, b) => b.popularity - a.popularity);
}

export function getLatestPhones(limit = 6): Phone[] {
  return [...phones].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '')).slice(0, limit);
}

export function getBrandBySlug(slug: string): PhoneBrand | undefined {
  return brands.find((b) => b.slug === slug);
}
