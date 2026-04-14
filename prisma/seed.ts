import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ==================== ROLES & PERMISSIONS ====================
  const adminRole = await prisma.role.upsert({
    where: { slug: "super_admin" },
    update: {},
    create: {
      name: "Super Admin",
      slug: "super_admin",
      description: "Full access to everything",
      isSystem: true,
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { slug: "editor" },
    update: {},
    create: {
      name: "Editor",
      slug: "editor",
      description: "Content management access",
      isSystem: true,
    },
  });

  const companyAdminRole = await prisma.role.upsert({
    where: { slug: "company_admin" },
    update: {},
    create: {
      name: "Company Admin",
      slug: "company_admin",
      description: "Full company portal access",
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { slug: "user" },
    update: {},
    create: {
      name: "User",
      slug: "user",
      description: "Regular user",
      isSystem: true,
    },
  });

  // ==================== PERMISSIONS ====================
  const permissionGroups = {
    phones: ["create", "edit", "delete", "publish", "view"],
    articles: ["create", "edit", "delete", "publish", "view"],
    brands: ["create", "edit", "delete", "view"],
    campaigns: ["create", "edit", "delete", "manage", "view"],
    settings: ["view", "edit"],
    users: ["create", "edit", "delete", "view", "manage"],
    roles: ["create", "edit", "delete", "view", "manage"],
    media: ["upload", "delete", "view"],
    reviews: ["moderate", "delete", "view"],
    discussions: ["moderate", "delete", "view"],
  };

  for (const [group, actions] of Object.entries(permissionGroups)) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { slug: `${group}.${action}` },
        update: {},
        create: {
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${group}`,
          slug: `${group}.${action}`,
          group,
          description: `Can ${action} ${group}`,
        },
      });
    }
  }

  // Assign all permissions to admin
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // ==================== ADMIN USER ====================
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mobileplatform.com" },
    update: {},
    create: {
      email: "admin@mobileplatform.com",
      passwordHash,
      name: "Admin",
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // ==================== BRANDS ====================
  const brands = [
    { name: "Samsung", slug: "samsung", description: "South Korean multinational electronics corporation", website: "https://samsung.com" },
    { name: "Apple", slug: "apple", description: "American multinational technology company", website: "https://apple.com" },
    { name: "Xiaomi", slug: "xiaomi", description: "Chinese multinational electronics company", website: "https://xiaomi.com" },
    { name: "OnePlus", slug: "oneplus", description: "Chinese smartphone manufacturer", website: "https://oneplus.com" },
    { name: "Google", slug: "google", description: "American multinational technology corporation", website: "https://store.google.com" },
    { name: "Huawei", slug: "huawei", description: "Chinese multinational technology corporation", website: "https://huawei.com" },
    { name: "Sony", slug: "sony", description: "Japanese multinational conglomerate", website: "https://sony.com" },
    { name: "Nothing", slug: "nothing", description: "British consumer technology company", website: "https://nothing.tech" },
  ];

  const createdBrands: Record<string, string> = {};
  for (const brand of brands) {
    const b = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    createdBrands[brand.slug] = b.id;
  }

  // ==================== SPEC GROUPS ====================
  const specGroups = [
    { name: "Display", slug: "display", sortOrder: 1, icon: "lucide:monitor" },
    { name: "Camera", slug: "camera", sortOrder: 2, icon: "lucide:camera" },
    { name: "Performance", slug: "performance", sortOrder: 3, icon: "lucide:cpu" },
    { name: "Battery", slug: "battery", sortOrder: 4, icon: "lucide:battery-full" },
    { name: "Connectivity", slug: "connectivity", sortOrder: 5, icon: "lucide:wifi" },
    { name: "Design", slug: "design", sortOrder: 6, icon: "lucide:smartphone" },
    { name: "Security", slug: "security", sortOrder: 7, icon: "lucide:shield" },
  ];

  const createdGroups: Record<string, string> = {};
  for (const group of specGroups) {
    const g = await prisma.specGroup.upsert({
      where: { slug: group.slug },
      update: {},
      create: group,
    });
    createdGroups[group.slug] = g.id;
  }

  // ==================== SPEC DEFINITIONS ====================
  const specDefs = [
    // Display
    { groupSlug: "display", name: "Display Size", slug: "display-size", key: "display_size", icon: "lucide:monitor", unit: "inches", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, sortOrder: 1 },
    { groupSlug: "display", name: "Display Type", slug: "display-type", key: "display_type", icon: "lucide:monitor", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, sortOrder: 2 },
    { groupSlug: "display", name: "Resolution", slug: "resolution", key: "resolution", icon: "lucide:maximize", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 3 },
    { groupSlug: "display", name: "Refresh Rate", slug: "refresh-rate", key: "refresh_rate", icon: "lucide:activity", unit: "Hz", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, sortOrder: 4 },
    { groupSlug: "display", name: "Glass Protection", slug: "glass-protection", key: "glass_protection", icon: "lucide:shield", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 5 },
    // Camera
    { groupSlug: "camera", name: "Main Camera", slug: "main-camera", key: "main_camera", icon: "lucide:camera", unit: "MP", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, sortOrder: 1 },
    { groupSlug: "camera", name: "Front Camera", slug: "front-camera", key: "front_camera", icon: "lucide:user", unit: "MP", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: true, sortOrder: 2 },
    { groupSlug: "camera", name: "Camera Features", slug: "camera-features", key: "camera_features", icon: "lucide:aperture", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 3 },
    // Performance
    { groupSlug: "performance", name: "Processor", slug: "processor", key: "processor", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 1 },
    { groupSlug: "performance", name: "RAM", slug: "ram", key: "ram", icon: "lucide:cpu", unit: "GB", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, sortOrder: 2 },
    { groupSlug: "performance", name: "Storage", slug: "storage", key: "storage", icon: "lucide:hard-drive", unit: "GB", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, sortOrder: 3 },
    { groupSlug: "performance", name: "OS", slug: "os", key: "os", icon: "lucide:smartphone", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, sortOrder: 4 },
    // Battery
    { groupSlug: "battery", name: "Battery", slug: "battery-capacity", key: "battery", icon: "lucide:battery-full", unit: "mAh", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, sortOrder: 1 },
    { groupSlug: "battery", name: "Charger", slug: "charger", key: "charger", icon: "lucide:zap", unit: "W", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, sortOrder: 2 },
    { groupSlug: "battery", name: "Wireless Charging", slug: "wireless-charging", key: "wireless_charging", icon: "lucide:zap", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 3 },
    // Connectivity
    { groupSlug: "connectivity", name: "Wi-Fi", slug: "wifi", key: "wifi", icon: "lucide:wifi", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 1 },
    { groupSlug: "connectivity", name: "Bluetooth", slug: "bluetooth", key: "bluetooth", icon: "lucide:bluetooth", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 2 },
    { groupSlug: "connectivity", name: "5G", slug: "five-g", key: "five_g", icon: "lucide:signal", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, sortOrder: 3 },
    { groupSlug: "connectivity", name: "NFC", slug: "nfc", key: "nfc", icon: "lucide:nfc", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 4 },
    // Design
    { groupSlug: "design", name: "Dimensions", slug: "dimensions", key: "dimensions", icon: "lucide:ruler", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 1 },
    { groupSlug: "design", name: "Weight", slug: "weight", key: "weight", icon: "lucide:scale", unit: "g", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 2 },
    { groupSlug: "design", name: "Resistance Rating", slug: "resistance-rating", key: "resistance_rating", icon: "lucide:droplets", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, sortOrder: 3 },
    { groupSlug: "design", name: "Colors", slug: "colors", key: "colors", icon: "lucide:palette", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 4 },
    // Security
    { groupSlug: "security", name: "Fingerprint Sensor", slug: "fingerprint-sensor", key: "fingerprint_sensor", icon: "lucide:fingerprint", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 1 },
    { groupSlug: "security", name: "Face Unlock", slug: "face-unlock", key: "face_unlock", icon: "lucide:scan-face", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, sortOrder: 2 },
  ];

  const createdSpecs: Record<string, string> = {};
  for (const spec of specDefs) {
    const { groupSlug, ...specData } = spec;
    const s = await prisma.specDefinition.upsert({
      where: { slug: specData.slug },
      update: {},
      create: {
        ...specData,
        groupId: createdGroups[groupSlug],
      },
    });
    createdSpecs[specData.key] = s.id;
  }

  // ==================== SAMPLE PHONES ====================
  const phones = [
    {
      brandSlug: "samsung",
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      marketStatus: "available",
      releaseDate: "2024-01-17",
      priceUsd: 1299.99,
      priceDisplay: "$1,299",
      overview: "The Samsung Galaxy S24 Ultra is the ultimate premium smartphone featuring a titanium frame, advanced AI capabilities, and the most powerful camera system Samsung has ever created. It comes with a built-in S Pen and a stunning 6.8-inch Dynamic AMOLED display.",
      isFeatured: true,
      isPublished: true,
      specs: {
        display_size: { value: "6.8", numeric: 6.8 },
        display_type: { value: "Dynamic AMOLED 2X", numeric: null },
        resolution: { value: "3120 x 1440 (QHD+)", numeric: null },
        refresh_rate: { value: "120", numeric: 120 },
        glass_protection: { value: "Gorilla Armor", numeric: null },
        main_camera: { value: "200", numeric: 200 },
        front_camera: { value: "12", numeric: 12 },
        camera_features: { value: "OIS, 100x Space Zoom, Nightography", numeric: null },
        processor: { value: "Snapdragon 8 Gen 3", numeric: null },
        ram: { value: "12", numeric: 12 },
        storage: { value: "256", numeric: 256 },
        os: { value: "Android 14, One UI 6.1", numeric: null },
        battery: { value: "5000", numeric: 5000 },
        charger: { value: "45", numeric: 45 },
        wireless_charging: { value: "15W Wireless, 4.5W Reverse", numeric: null },
        wifi: { value: "Wi-Fi 7", numeric: null },
        bluetooth: { value: "5.3", numeric: 5.3 },
        five_g: { value: "Yes", numeric: null },
        nfc: { value: "Yes", numeric: null },
        dimensions: { value: "162.3 x 79.0 x 8.6 mm", numeric: null },
        weight: { value: "232", numeric: 232 },
        resistance_rating: { value: "IP68", numeric: null },
        colors: { value: "Titanium Black, Gray, Violet, Yellow", numeric: null },
        fingerprint_sensor: { value: "Ultrasonic (under display)", numeric: null },
        face_unlock: { value: "Yes", numeric: null },
      },
    },
    {
      brandSlug: "apple",
      name: "Apple iPhone 15 Pro Max",
      slug: "apple-iphone-15-pro-max",
      marketStatus: "available",
      releaseDate: "2023-09-22",
      priceUsd: 1199.99,
      priceDisplay: "$1,199",
      overview: "The iPhone 15 Pro Max features a titanium design, the powerful A17 Pro chip, a customizable Action Button, and the most advanced camera system ever in an iPhone with a 5x telephoto zoom.",
      isFeatured: true,
      isPublished: true,
      specs: {
        display_size: { value: "6.7", numeric: 6.7 },
        display_type: { value: "Super Retina XDR OLED", numeric: null },
        resolution: { value: "2796 x 1290", numeric: null },
        refresh_rate: { value: "120", numeric: 120 },
        glass_protection: { value: "Ceramic Shield", numeric: null },
        main_camera: { value: "48", numeric: 48 },
        front_camera: { value: "12", numeric: 12 },
        camera_features: { value: "5x Optical Zoom, ProRAW, ProRes", numeric: null },
        processor: { value: "A17 Pro", numeric: null },
        ram: { value: "8", numeric: 8 },
        storage: { value: "256", numeric: 256 },
        os: { value: "iOS 17", numeric: null },
        battery: { value: "4441", numeric: 4441 },
        charger: { value: "27", numeric: 27 },
        wireless_charging: { value: "15W MagSafe, 7.5W Qi", numeric: null },
        wifi: { value: "Wi-Fi 6E", numeric: null },
        bluetooth: { value: "5.3", numeric: 5.3 },
        five_g: { value: "Yes", numeric: null },
        nfc: { value: "Yes", numeric: null },
        dimensions: { value: "159.9 x 76.7 x 8.3 mm", numeric: null },
        weight: { value: "221", numeric: 221 },
        resistance_rating: { value: "IP68", numeric: null },
        colors: { value: "Natural Titanium, Blue, White, Black", numeric: null },
        fingerprint_sensor: { value: "No (Face ID)", numeric: null },
        face_unlock: { value: "Face ID", numeric: null },
      },
    },
    {
      brandSlug: "xiaomi",
      name: "Xiaomi 14 Ultra",
      slug: "xiaomi-14-ultra",
      marketStatus: "available",
      releaseDate: "2024-02-22",
      priceUsd: 999.99,
      priceDisplay: "$999",
      overview: "The Xiaomi 14 Ultra is a photography powerhouse co-engineered with Leica, featuring a 1-inch main sensor with variable aperture and flagship performance.",
      isFeatured: true,
      isPublished: true,
      specs: {
        display_size: { value: "6.73", numeric: 6.73 },
        display_type: { value: "LTPO AMOLED", numeric: null },
        resolution: { value: "3200 x 1440 (QHD+)", numeric: null },
        refresh_rate: { value: "120", numeric: 120 },
        glass_protection: { value: "Gorilla Glass Victus 2", numeric: null },
        main_camera: { value: "50", numeric: 50 },
        front_camera: { value: "32", numeric: 32 },
        camera_features: { value: "Leica Summilux, 1-inch sensor, Variable aperture", numeric: null },
        processor: { value: "Snapdragon 8 Gen 3", numeric: null },
        ram: { value: "16", numeric: 16 },
        storage: { value: "512", numeric: 512 },
        os: { value: "Android 14, HyperOS", numeric: null },
        battery: { value: "5300", numeric: 5300 },
        charger: { value: "90", numeric: 90 },
        wireless_charging: { value: "50W Wireless, 10W Reverse", numeric: null },
        wifi: { value: "Wi-Fi 7", numeric: null },
        bluetooth: { value: "5.4", numeric: 5.4 },
        five_g: { value: "Yes", numeric: null },
        nfc: { value: "Yes", numeric: null },
        dimensions: { value: "161.4 x 75.3 x 9.2 mm", numeric: null },
        weight: { value: "227", numeric: 227 },
        resistance_rating: { value: "IP68", numeric: null },
        colors: { value: "Black, White", numeric: null },
        fingerprint_sensor: { value: "Optical (under display)", numeric: null },
        face_unlock: { value: "Yes", numeric: null },
      },
    },
    {
      brandSlug: "google",
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      marketStatus: "available",
      releaseDate: "2023-10-12",
      priceUsd: 999.00,
      priceDisplay: "$999",
      overview: "The Pixel 8 Pro is Google's most advanced phone, featuring the Tensor G3 chip with powerful AI capabilities, a pro-level camera system, and 7 years of OS and security updates.",
      isFeatured: false,
      isPublished: true,
      specs: {
        display_size: { value: "6.7", numeric: 6.7 },
        display_type: { value: "LTPO OLED", numeric: null },
        resolution: { value: "2992 x 1344 (QHD+)", numeric: null },
        refresh_rate: { value: "120", numeric: 120 },
        glass_protection: { value: "Gorilla Glass Victus 2", numeric: null },
        main_camera: { value: "50", numeric: 50 },
        front_camera: { value: "10.5", numeric: 10.5 },
        camera_features: { value: "Magic Eraser, Photo Unblur, Night Sight", numeric: null },
        processor: { value: "Google Tensor G3", numeric: null },
        ram: { value: "12", numeric: 12 },
        storage: { value: "128", numeric: 128 },
        os: { value: "Android 14", numeric: null },
        battery: { value: "5050", numeric: 5050 },
        charger: { value: "30", numeric: 30 },
        wireless_charging: { value: "23W Wireless, 5W Reverse", numeric: null },
        wifi: { value: "Wi-Fi 7", numeric: null },
        bluetooth: { value: "5.3", numeric: 5.3 },
        five_g: { value: "Yes", numeric: null },
        nfc: { value: "Yes", numeric: null },
        dimensions: { value: "162.6 x 76.5 x 8.8 mm", numeric: null },
        weight: { value: "213", numeric: 213 },
        resistance_rating: { value: "IP68", numeric: null },
        colors: { value: "Obsidian, Porcelain, Bay", numeric: null },
        fingerprint_sensor: { value: "Optical (under display)", numeric: null },
        face_unlock: { value: "Yes", numeric: null },
      },
    },
    {
      brandSlug: "oneplus",
      name: "OnePlus 12",
      slug: "oneplus-12",
      marketStatus: "available",
      releaseDate: "2024-01-23",
      priceUsd: 799.99,
      priceDisplay: "$799",
      overview: "The OnePlus 12 delivers flagship performance with Snapdragon 8 Gen 3, Hasselblad camera tuning, and the fastest 100W wired charging in its class.",
      isFeatured: false,
      isPublished: true,
      specs: {
        display_size: { value: "6.82", numeric: 6.82 },
        display_type: { value: "LTPO AMOLED", numeric: null },
        resolution: { value: "3168 x 1440 (QHD+)", numeric: null },
        refresh_rate: { value: "120", numeric: 120 },
        glass_protection: { value: "Gorilla Glass Victus 2", numeric: null },
        main_camera: { value: "50", numeric: 50 },
        front_camera: { value: "32", numeric: 32 },
        camera_features: { value: "Hasselblad, OIS, 3x Optical Zoom", numeric: null },
        processor: { value: "Snapdragon 8 Gen 3", numeric: null },
        ram: { value: "12", numeric: 12 },
        storage: { value: "256", numeric: 256 },
        os: { value: "Android 14, OxygenOS 14", numeric: null },
        battery: { value: "5400", numeric: 5400 },
        charger: { value: "100", numeric: 100 },
        wireless_charging: { value: "50W Wireless", numeric: null },
        wifi: { value: "Wi-Fi 7", numeric: null },
        bluetooth: { value: "5.4", numeric: 5.4 },
        five_g: { value: "Yes", numeric: null },
        nfc: { value: "Yes", numeric: null },
        dimensions: { value: "164.3 x 75.8 x 9.2 mm", numeric: null },
        weight: { value: "220", numeric: 220 },
        resistance_rating: { value: "IP65", numeric: null },
        colors: { value: "Flowy Emerald, Silky Black", numeric: null },
        fingerprint_sensor: { value: "Optical (under display)", numeric: null },
        face_unlock: { value: "Yes", numeric: null },
      },
    },
    {
      brandSlug: "nothing",
      name: "Nothing Phone (2a)",
      slug: "nothing-phone-2a",
      marketStatus: "available",
      releaseDate: "2024-03-05",
      priceUsd: 349.00,
      priceDisplay: "$349",
      overview: "The Nothing Phone (2a) brings a unique transparent design with Glyph interface LED lighting at a mid-range price point, offering clean software and solid performance.",
      isFeatured: false,
      isPublished: true,
      specs: {
        display_size: { value: "6.7", numeric: 6.7 },
        display_type: { value: "AMOLED", numeric: null },
        resolution: { value: "2412 x 1084 (FHD+)", numeric: null },
        refresh_rate: { value: "120", numeric: 120 },
        glass_protection: { value: "Gorilla Glass 5", numeric: null },
        main_camera: { value: "50", numeric: 50 },
        front_camera: { value: "32", numeric: 32 },
        camera_features: { value: "OIS, Ultra XDR", numeric: null },
        processor: { value: "MediaTek Dimensity 7200 Pro", numeric: null },
        ram: { value: "8", numeric: 8 },
        storage: { value: "128", numeric: 128 },
        os: { value: "Android 14, Nothing OS 2.5", numeric: null },
        battery: { value: "5000", numeric: 5000 },
        charger: { value: "45", numeric: 45 },
        wireless_charging: { value: "No", numeric: null },
        wifi: { value: "Wi-Fi 6", numeric: null },
        bluetooth: { value: "5.3", numeric: 5.3 },
        five_g: { value: "Yes", numeric: null },
        nfc: { value: "Yes", numeric: null },
        dimensions: { value: "161.7 x 76.3 x 8.6 mm", numeric: null },
        weight: { value: "190", numeric: 190 },
        resistance_rating: { value: "IP54", numeric: null },
        colors: { value: "Black, White", numeric: null },
        fingerprint_sensor: { value: "Optical (under display)", numeric: null },
        face_unlock: { value: "Yes", numeric: null },
      },
    },
  ];

  for (const phoneData of phones) {
    const { brandSlug, specs, ...phoneFields } = phoneData;
    const phone = await prisma.phone.upsert({
      where: { slug: phoneFields.slug },
      update: {},
      create: {
        ...phoneFields,
        brandId: createdBrands[brandSlug],
        publishedAt: new Date(),
      },
    });

    // Add specs
    for (const [key, val] of Object.entries(specs)) {
      if (createdSpecs[key]) {
        await prisma.phoneSpec.upsert({
          where: {
            phoneId_specId: {
              phoneId: phone.id,
              specId: createdSpecs[key],
            },
          },
          update: {},
          create: {
            phoneId: phone.id,
            specId: createdSpecs[key],
            value: val.value,
            numericValue: val.numeric,
          },
        });
      }
    }
  }

  // Update brand phone counts
  for (const [slug, brandId] of Object.entries(createdBrands)) {
    const count = await prisma.phone.count({ where: { brandId } });
    await prisma.brand.update({
      where: { id: brandId },
      data: { phoneCount: count },
    });
  }

  // ==================== RATING CATEGORIES ====================
  const ratingCategories = [
    { name: "Design", slug: "design", icon: "lucide:palette", weight: 1.0, sortOrder: 1 },
    { name: "Display", slug: "display-rating", icon: "lucide:monitor", weight: 1.0, sortOrder: 2 },
    { name: "Camera", slug: "camera-rating", icon: "lucide:camera", weight: 1.2, sortOrder: 3 },
    { name: "Performance", slug: "performance-rating", icon: "lucide:zap", weight: 1.0, sortOrder: 4 },
    { name: "Battery Life", slug: "battery-rating", icon: "lucide:battery-full", weight: 1.0, sortOrder: 5 },
    { name: "Software", slug: "software-rating", icon: "lucide:code", weight: 0.8, sortOrder: 6 },
    { name: "Value", slug: "value-rating", icon: "lucide:tag", weight: 0.8, sortOrder: 7 },
  ];

  for (const cat of ratingCategories) {
    await prisma.ratingCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // ==================== CATEGORIES ====================
  const categories = [
    { name: "News", slug: "news", description: "Latest smartphone news" },
    { name: "Reviews", slug: "reviews", description: "Expert phone reviews" },
    { name: "Guides", slug: "guides", description: "Buying guides and tutorials" },
    { name: "Comparisons", slug: "comparisons", description: "Side-by-side phone comparisons" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // ==================== SETTINGS ====================
  const settings = [
    { key: "site_name", value: JSON.stringify("MobilePlatform"), group: "general", isPublic: true },
    { key: "site_tagline", value: JSON.stringify("Your Ultimate Smartphone Resource"), group: "general", isPublic: true },
    { key: "site_logo", value: JSON.stringify("/logo.svg"), group: "general", isPublic: true },
    { key: "site_favicon", value: JSON.stringify("/favicon.ico"), group: "general", isPublic: true },
    { key: "primary_color", value: JSON.stringify("#3b82f6"), group: "appearance", isPublic: true },
    { key: "contact_email", value: JSON.stringify("contact@mobileplatform.com"), group: "general", isPublic: true },
    { key: "social_links", value: JSON.stringify({ twitter: "", facebook: "", instagram: "", youtube: "" }), group: "general", isPublic: true },
    { key: "seo_default_title", value: JSON.stringify("{{page_title}} - MobilePlatform"), group: "seo", isPublic: false },
    { key: "seo_default_description", value: JSON.stringify("Discover smartphone specifications, reviews, and comparisons on MobilePlatform"), group: "seo", isPublic: false },
    { key: "homepage_featured_count", value: JSON.stringify(6), group: "homepage", isPublic: false },
    { key: "homepage_latest_count", value: JSON.stringify(8), group: "homepage", isPublic: false },
    { key: "search_results_per_page", value: JSON.stringify(12), group: "search", isPublic: false },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // ==================== SEO TEMPLATES ====================
  const seoTemplates = [
    { contentType: "phone", titleTemplate: "{{name}} Specifications, Price & Review - MobilePlatform", descriptionTemplate: "Full specifications, price, and review of {{name}} by {{brand}}. Compare features and find the best deals.", robots: "index,follow" },
    { contentType: "brand", titleTemplate: "{{name}} Phones - All Models & Specs - MobilePlatform", descriptionTemplate: "Browse all {{name}} smartphones with full specifications, prices, and reviews.", robots: "index,follow" },
    { contentType: "article", titleTemplate: "{{title}} - MobilePlatform", descriptionTemplate: "{{excerpt}}", robots: "index,follow" },
    { contentType: "comparison", titleTemplate: "{{title}} - Comparison - MobilePlatform", descriptionTemplate: "Compare specifications side by side. Find out which phone is better.", robots: "index,follow" },
    { contentType: "category", titleTemplate: "{{name}} - MobilePlatform", descriptionTemplate: "Browse {{name}} on MobilePlatform.", robots: "index,follow" },
  ];

  for (const template of seoTemplates) {
    await prisma.seoTemplate.upsert({
      where: { contentType: template.contentType },
      update: {},
      create: template,
    });
  }

  // ==================== MENUS ====================
  const headerMenu = await prisma.menu.upsert({
    where: { slug: "header" },
    update: {},
    create: { name: "Header Menu", slug: "header", location: "header" },
  });

  const headerItems = [
    { title: "Phones", url: "/phones", icon: "lucide:smartphone", sortOrder: 1 },
    { title: "News", url: "/news", icon: "lucide:newspaper", sortOrder: 2 },
    { title: "Reviews", url: "/reviews", icon: "lucide:star", sortOrder: 3 },
    { title: "Compare", url: "/compare", icon: "lucide:columns", sortOrder: 4 },
    { title: "Brands", url: "/brands", icon: "lucide:building-2", sortOrder: 5 },
  ];

  for (const item of headerItems) {
    await prisma.menuItem.create({
      data: { ...item, menuId: headerMenu.id },
    });
  }

  // ==================== AD SLOTS ====================
  const adSlots = [
    { name: "Homepage Hero Banner", slug: "home-hero", pageType: "home", position: "hero", dimensions: "728x90" },
    { name: "Homepage Sidebar", slug: "home-sidebar", pageType: "home", position: "sidebar", dimensions: "300x250" },
    { name: "Search Top", slug: "search-top", pageType: "search", position: "top", dimensions: "728x90" },
    { name: "Search Sponsored", slug: "search-sponsored", pageType: "search", position: "in_content", dimensions: "native" },
    { name: "Phone Detail Sidebar", slug: "phone-sidebar", pageType: "phone_detail", position: "sidebar", dimensions: "300x250" },
    { name: "Phone Detail After Specs", slug: "phone-after-specs", pageType: "phone_detail", position: "in_content", dimensions: "728x90" },
    { name: "Article Sidebar", slug: "article-sidebar", pageType: "article", position: "sidebar", dimensions: "300x250" },
    { name: "Article In-Content", slug: "article-in-content", pageType: "article", position: "in_content", dimensions: "728x90" },
  ];

  for (const slot of adSlots) {
    await prisma.adSlot.upsert({
      where: { slug: slot.slug },
      update: {},
      create: slot,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Admin Login:");
  console.log("   Email: admin@mobileplatform.com");
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
