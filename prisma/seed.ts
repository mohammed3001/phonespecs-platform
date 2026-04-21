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
  const passwordHash = await bcrypt.hash("Mp@dmin2024!Secure", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mobileplatform.com" },
    update: { passwordHash, name: "Admin", roleId: adminRole.id, isActive: true, emailVerified: true },
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
    { name: "General", slug: "general", sortOrder: 1, icon: "lucide:info" },
    { name: "Hardware & Software", slug: "hardware-software", sortOrder: 2, icon: "lucide:cpu" },
    { name: "Display", slug: "display", sortOrder: 3, icon: "lucide:monitor" },
    { name: "Cameras", slug: "cameras", sortOrder: 4, icon: "lucide:camera" },
    { name: "Design", slug: "design", sortOrder: 5, icon: "lucide:smartphone" },
    { name: "Battery", slug: "battery", sortOrder: 6, icon: "lucide:battery-full" },
    { name: "Memory", slug: "memory", sortOrder: 7, icon: "lucide:hard-drive" },
    { name: "Network & Connectivity", slug: "network-connectivity", sortOrder: 8, icon: "lucide:wifi" },
    { name: "Sensors & security", slug: "sensors-security", sortOrder: 9, icon: "lucide:shield" },
    { name: "Multimedia", slug: "multimedia", sortOrder: 10, icon: "lucide:volume-2" },
    { name: "More", slug: "more", sortOrder: 11, icon: "lucide:more-horizontal" },
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
    // === General (sortOrder 1-5) ===
    { groupSlug: "general", name: "Brand", slug: "gen-brand", key: "gen_brand", icon: "lucide:building-2", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "general", name: "Model", slug: "gen-model", key: "gen_model", icon: "lucide:tag", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "general", name: "Device Type", slug: "gen-device-type", key: "gen_device_type", icon: "lucide:smartphone", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "general", name: "Release Date", slug: "gen-release-date", key: "gen_release_date", icon: "lucide:calendar", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },
    { groupSlug: "general", name: "Status", slug: "gen-status", key: "gen_status", icon: "lucide:check-circle", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 5 },

    // === Hardware & Software (sortOrder 1-9) ===
    { groupSlug: "hardware-software", name: "Operating System", slug: "hw-os", key: "hw_os", icon: "lucide:code", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "hardware-software", name: "OS Version", slug: "hw-os-version", key: "hw_os_version", icon: "lucide:code", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "hardware-software", name: "User Interface", slug: "hw-ui", key: "hw_ui", icon: "lucide:layout", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "hardware-software", name: "Chipset", slug: "hw-chipset", key: "hw_chipset", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: true, subSection: null, sortOrder: 4 },
    { groupSlug: "hardware-software", name: "CPU", slug: "hw-cpu", key: "hw_cpu", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 5 },
    { groupSlug: "hardware-software", name: "CPU Cores", slug: "hw-cpu-cores", key: "hw_cpu_cores", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 6 },
    { groupSlug: "hardware-software", name: "Architecture", slug: "hw-architecture", key: "hw_architecture", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 7 },
    { groupSlug: "hardware-software", name: "Fabrication", slug: "hw-fabrication", key: "hw_fabrication", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 8 },
    { groupSlug: "hardware-software", name: "GPU", slug: "hw-gpu", key: "hw_gpu", icon: "lucide:monitor", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 9 },

    // === Display (sortOrder 1-11) ===
    { groupSlug: "display", name: "Display Type", slug: "display-type", key: "display_type", icon: "lucide:monitor", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "display", name: "Screen Size", slug: "display-size", key: "display_size", icon: "lucide:monitor", unit: "inches", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, subSection: null, sortOrder: 2 },
    { groupSlug: "display", name: "Resolution", slug: "display-resolution", key: "display_resolution", icon: "lucide:maximize", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "display", name: "Aspect Ratio", slug: "display-aspect-ratio", key: "display_aspect_ratio", icon: "lucide:maximize", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },
    { groupSlug: "display", name: "Pixel Density", slug: "display-ppi", key: "display_ppi", icon: "lucide:grid", unit: "PPI", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 5 },
    { groupSlug: "display", name: "Screen to Body Ratio", slug: "display-stb-ratio", key: "display_stb_ratio", icon: "lucide:maximize", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 6 },
    { groupSlug: "display", name: "Screen Protection", slug: "display-protection", key: "display_protection", icon: "lucide:shield", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 7 },
    { groupSlug: "display", name: "Bezel-less Display", slug: "display-bezelless", key: "display_bezelless", icon: "lucide:monitor", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 8 },
    { groupSlug: "display", name: "Touch Screen", slug: "display-touch", key: "display_touch", icon: "lucide:pointer", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 9 },
    { groupSlug: "display", name: "Refresh Rate", slug: "display-refresh-rate", key: "display_refresh_rate", icon: "lucide:activity", unit: "Hz", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 10 },
    { groupSlug: "display", name: "Notch", slug: "display-notch", key: "display_notch", icon: "lucide:monitor", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 11 },

    // === Cameras — Primary Camera (sortOrder 1-12, subSection: "Primary Camera") ===
    { groupSlug: "cameras", name: "Camera Setup", slug: "cam-pri-setup", key: "cam_pri_setup", icon: "lucide:camera", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 1 },
    { groupSlug: "cameras", name: "Resolution", slug: "cam-pri-resolution", key: "cam_pri_resolution", icon: "lucide:camera", unit: "MP", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, subSection: "Primary Camera", sortOrder: 2 },
    { groupSlug: "cameras", name: "Autofocus", slug: "cam-pri-autofocus", key: "cam_pri_autofocus", icon: "lucide:focus", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 3 },
    { groupSlug: "cameras", name: "Flash", slug: "cam-pri-flash", key: "cam_pri_flash", icon: "lucide:zap", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 4 },
    { groupSlug: "cameras", name: "Image Resolution", slug: "cam-pri-img-res", key: "cam_pri_img_res", icon: "lucide:image", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 5 },
    { groupSlug: "cameras", name: "Settings", slug: "cam-pri-settings", key: "cam_pri_settings", icon: "lucide:settings", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 6 },
    { groupSlug: "cameras", name: "Zoom", slug: "cam-pri-zoom", key: "cam_pri_zoom", icon: "lucide:zoom-in", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 7 },
    { groupSlug: "cameras", name: "Shooting Modes", slug: "cam-pri-modes", key: "cam_pri_modes", icon: "lucide:aperture", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 8 },
    { groupSlug: "cameras", name: "Aperture", slug: "cam-pri-aperture", key: "cam_pri_aperture", icon: "lucide:aperture", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 9 },
    { groupSlug: "cameras", name: "Camera Features", slug: "cam-pri-features", key: "cam_pri_features", icon: "lucide:star", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 10 },
    { groupSlug: "cameras", name: "Video Recording", slug: "cam-pri-video", key: "cam_pri_video", icon: "lucide:video", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 11 },
    { groupSlug: "cameras", name: "Video FPS", slug: "cam-pri-fps", key: "cam_pri_fps", icon: "lucide:video", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Primary Camera", sortOrder: 12 },

    // === Cameras — Selfie Camera (sortOrder 13-17, subSection: "Selfie Camera") ===
    { groupSlug: "cameras", name: "Camera Setup", slug: "cam-sel-setup", key: "cam_sel_setup", icon: "lucide:user", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Selfie Camera", sortOrder: 13 },
    { groupSlug: "cameras", name: "Resolution", slug: "cam-sel-resolution", key: "cam_sel_resolution", icon: "lucide:user", unit: "MP", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: true, subSection: "Selfie Camera", sortOrder: 14 },
    { groupSlug: "cameras", name: "Video Recording", slug: "cam-sel-video", key: "cam_sel_video", icon: "lucide:video", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Selfie Camera", sortOrder: 15 },
    { groupSlug: "cameras", name: "Video FPS", slug: "cam-sel-fps", key: "cam_sel_fps", icon: "lucide:video", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Selfie Camera", sortOrder: 16 },
    { groupSlug: "cameras", name: "Aperture", slug: "cam-sel-aperture", key: "cam_sel_aperture", icon: "lucide:aperture", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "Selfie Camera", sortOrder: 17 },

    // === Design (sortOrder 1-9) ===
    { groupSlug: "design", name: "Height", slug: "design-height", key: "design_height", icon: "lucide:ruler", unit: "mm", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "design", name: "Width", slug: "design-width", key: "design_width", icon: "lucide:ruler", unit: "mm", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "design", name: "Thickness", slug: "design-thickness", key: "design_thickness", icon: "lucide:ruler", unit: "mm", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "design", name: "Weight", slug: "design-weight", key: "design_weight", icon: "lucide:scale", unit: "g", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },
    { groupSlug: "design", name: "Build: Back", slug: "design-build-back", key: "design_build_back", icon: "lucide:smartphone", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 5 },
    { groupSlug: "design", name: "Colors", slug: "design-colors", key: "design_colors", icon: "lucide:palette", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 6 },
    { groupSlug: "design", name: "Waterproof", slug: "design-waterproof", key: "design_waterproof", icon: "lucide:droplets", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 7 },
    { groupSlug: "design", name: "IP Rating", slug: "design-ip-rating", key: "design_ip_rating", icon: "lucide:shield", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 8 },
    { groupSlug: "design", name: "Ruggedness", slug: "design-ruggedness", key: "design_ruggedness", icon: "lucide:shield", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 9 },

    // === Battery (sortOrder 1-5) ===
    { groupSlug: "battery", name: "Battery type", slug: "bat-type", key: "bat_type", icon: "lucide:battery-full", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "battery", name: "Capacity", slug: "bat-capacity", key: "bat_capacity", icon: "lucide:battery-full", unit: "mAh", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, subSection: null, sortOrder: 2 },
    { groupSlug: "battery", name: "Quick Charging", slug: "bat-quick-charging", key: "bat_quick_charging", icon: "lucide:zap", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "battery", name: "Placement", slug: "bat-placement", key: "bat_placement", icon: "lucide:battery-full", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },
    { groupSlug: "battery", name: "USB Type-C", slug: "bat-usb-typec", key: "bat_usb_typec", icon: "lucide:usb", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 5 },

    // === Memory (sortOrder 1-4) ===
    { groupSlug: "memory", name: "Internal Storage", slug: "mem-storage", key: "mem_storage", icon: "lucide:hard-drive", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, subSection: null, sortOrder: 1 },
    { groupSlug: "memory", name: "Storage Type", slug: "mem-storage-type", key: "mem_storage_type", icon: "lucide:hard-drive", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "memory", name: "USB OTG", slug: "mem-usb-otg", key: "mem_usb_otg", icon: "lucide:usb", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "memory", name: "RAM", slug: "mem-ram", key: "mem_ram", icon: "lucide:cpu", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: true, subSection: null, sortOrder: 4 },

    // === Network & Connectivity (sortOrder 1-14) ===
    { groupSlug: "network-connectivity", name: "Network", slug: "net-network", key: "net_network", icon: "lucide:signal", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: true, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "network-connectivity", name: "SIM Slot", slug: "net-sim-slot", key: "net_sim_slot", icon: "lucide:sim-card", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "network-connectivity", name: "SIM Size", slug: "net-sim-size", key: "net_sim_size", icon: "lucide:sim-card", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "network-connectivity", name: "EDGE", slug: "net-edge", key: "net_edge", icon: "lucide:signal", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },
    { groupSlug: "network-connectivity", name: "GPRS", slug: "net-gprs", key: "net_gprs", icon: "lucide:signal", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 5 },
    { groupSlug: "network-connectivity", name: "VoLTE", slug: "net-volte", key: "net_volte", icon: "lucide:phone", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 6 },
    { groupSlug: "network-connectivity", name: "Speed", slug: "net-speed", key: "net_speed", icon: "lucide:gauge", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 7 },
    { groupSlug: "network-connectivity", name: "WLAN", slug: "net-wlan", key: "net_wlan", icon: "lucide:wifi", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 8 },
    { groupSlug: "network-connectivity", name: "Bluetooth", slug: "net-bluetooth", key: "net_bluetooth", icon: "lucide:bluetooth", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 9 },
    { groupSlug: "network-connectivity", name: "GPS", slug: "net-gps", key: "net_gps", icon: "lucide:map-pin", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 10 },
    { groupSlug: "network-connectivity", name: "Infrared", slug: "net-infrared", key: "net_infrared", icon: "lucide:radio", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 11 },
    { groupSlug: "network-connectivity", name: "Wi-fi Hotspot", slug: "net-hotspot", key: "net_hotspot", icon: "lucide:wifi", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 12 },
    { groupSlug: "network-connectivity", name: "NFC", slug: "net-nfc", key: "net_nfc", icon: "lucide:nfc", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 13 },
    { groupSlug: "network-connectivity", name: "USB", slug: "net-usb", key: "net_usb", icon: "lucide:usb", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 14 },

    // === Sensors & security (sortOrder 1-4) ===
    { groupSlug: "sensors-security", name: "Light Sensor", slug: "sens-light", key: "sens_light", icon: "lucide:sun", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "sensors-security", name: "Fingerprint Sensor", slug: "sens-fingerprint", key: "sens_fingerprint", icon: "lucide:fingerprint", unit: "", dataType: "text", showInCard: true, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "sensors-security", name: "Finger Sensor Position", slug: "sens-fingerprint-pos", key: "sens_fingerprint_pos", icon: "lucide:fingerprint", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "sensors-security", name: "Face Unlock", slug: "sens-face-unlock", key: "sens_face_unlock", icon: "lucide:scan-face", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },

    // === Multimedia (sortOrder 1-5) ===
    { groupSlug: "multimedia", name: "FM Radio", slug: "media-fm", key: "media_fm", icon: "lucide:radio", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "multimedia", name: "Loudspeaker", slug: "media-speaker", key: "media_speaker", icon: "lucide:volume-2", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
    { groupSlug: "multimedia", name: "Audio Jack", slug: "media-audio-jack", key: "media_audio_jack", icon: "lucide:headphones", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 3 },
    { groupSlug: "multimedia", name: "Video", slug: "media-video", key: "media_video", icon: "lucide:video", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 4 },
    { groupSlug: "multimedia", name: "Document Reader", slug: "media-doc-reader", key: "media_doc_reader", icon: "lucide:file-text", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 5 },

    // === More (sortOrder 1-2) ===
    { groupSlug: "more", name: "Made By", slug: "more-made-by", key: "more_made_by", icon: "lucide:factory", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: false, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 1 },
    { groupSlug: "more", name: "Features", slug: "more-features", key: "more_features", icon: "lucide:list", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: false, isFilterable: false, isHighlighted: false, subSection: null, sortOrder: 2 },
  ];

  const createdSpecs: Record<string, string> = {};
  for (const spec of specDefs) {
    const { groupSlug, subSection, ...specData } = spec;
    const s = await prisma.specDefinition.upsert({
      where: { slug: specData.slug },
      update: {},
      create: {
        ...specData,
        subSection,
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
      mainImage: "/phones/samsung-galaxy-s24-ultra.svg",
      marketStatus: "available",
      releaseDate: "2024-01-17",
      priceUsd: 1299.99,
      priceDisplay: "$1,299",
      overview: "The Samsung Galaxy S24 Ultra is the ultimate premium smartphone featuring a titanium frame, advanced AI capabilities, and the most powerful camera system Samsung has ever created. It comes with a built-in S Pen and a stunning 6.8-inch Dynamic AMOLED display.",
      isFeatured: true,
      isPublished: true,
      dataSource: "official",
      lastVerifiedAt: new Date("2024-06-15"),
      pros: ["Best-in-class 200MP camera with 100x Space Zoom", "Built-in S Pen for productivity", "Titanium frame with exceptional durability", "7 years of OS updates", "Brightest display in any smartphone"],
      cons: ["Heavy at 232g", "Expensive starting price", "S Pen silo takes internal space", "No charger in box"],
      specs: {
        gen_brand: { value: "Samsung", numeric: null },
        gen_model: { value: "Galaxy S24 Ultra", numeric: null },
        gen_device_type: { value: "Smartphone", numeric: null },
        gen_release_date: { value: "January 17, 2024", numeric: null },
        gen_status: { value: "Available", numeric: null },
        hw_os: { value: "Android", numeric: null },
        hw_os_version: { value: "Android 14", numeric: null },
        hw_ui: { value: "One UI 6.1", numeric: null },
        hw_chipset: { value: "Snapdragon 8 Gen 3", numeric: null },
        hw_cpu: { value: "Octa-core (1x3.39 GHz Cortex-X4 & 3x3.1 GHz Cortex-A720 & 4x2.2 GHz Cortex-A520)", numeric: null },
        hw_cpu_cores: { value: "8", numeric: 8 },
        hw_architecture: { value: "64-bit", numeric: null },
        hw_fabrication: { value: "4 nm", numeric: null },
        hw_gpu: { value: "Adreno 750", numeric: null },
        display_type: { value: "Dynamic AMOLED 2X", numeric: null },
        display_size: { value: "6.8", numeric: 6.8 },
        display_resolution: { value: "3120 x 1440 (QHD+)", numeric: null },
        display_aspect_ratio: { value: "19.5:9", numeric: null },
        display_ppi: { value: "505", numeric: 505 },
        display_stb_ratio: { value: "91.1%", numeric: null },
        display_protection: { value: "Gorilla Armor", numeric: null },
        display_bezelless: { value: "Yes", numeric: null },
        display_touch: { value: "Capacitive, Multi-touch", numeric: null },
        display_refresh_rate: { value: "120", numeric: 120 },
        display_notch: { value: "Punch-hole", numeric: null },
        cam_pri_setup: { value: "Quad Camera", numeric: null },
        cam_pri_resolution: { value: "200", numeric: 200 },
        cam_pri_autofocus: { value: "Laser AF, Phase Detection AF, OIS", numeric: null },
        cam_pri_flash: { value: "LED Flash", numeric: null },
        cam_pri_img_res: { value: "16320 x 12240 Pixels", numeric: null },
        cam_pri_settings: { value: "Exposure, White Balance, ISO, Shutter Speed", numeric: null },
        cam_pri_zoom: { value: "100x Space Zoom, 10x Optical", numeric: null },
        cam_pri_modes: { value: "Night, Portrait, Pro, Panorama, Food, Macro", numeric: null },
        cam_pri_aperture: { value: "f/1.7 (wide) + f/2.4 (periscope) + f/3.4 (telephoto)", numeric: null },
        cam_pri_features: { value: "OIS, 100x Space Zoom, Nightography, AI Object Detection", numeric: null },
        cam_pri_video: { value: "8K@30fps, 4K@60fps, 1080p@240fps", numeric: null },
        cam_pri_fps: { value: "30/60/120/240 fps", numeric: null },
        cam_sel_setup: { value: "Single Camera", numeric: null },
        cam_sel_resolution: { value: "12", numeric: 12 },
        cam_sel_video: { value: "4K@30/60fps", numeric: null },
        cam_sel_fps: { value: "30/60 fps", numeric: null },
        cam_sel_aperture: { value: "f/2.2", numeric: null },
        design_height: { value: "162.3", numeric: 162.3 },
        design_width: { value: "79.0", numeric: 79.0 },
        design_thickness: { value: "8.6", numeric: 8.6 },
        design_weight: { value: "232", numeric: 232 },
        design_build_back: { value: "Gorilla Armor Glass", numeric: null },
        design_colors: { value: "Titanium Black, Gray, Violet, Yellow", numeric: null },
        design_waterproof: { value: "Yes", numeric: null },
        design_ip_rating: { value: "IP68", numeric: null },
        design_ruggedness: { value: "MIL-STD-810H", numeric: null },
        bat_type: { value: "Li-Ion", numeric: null },
        bat_capacity: { value: "5000", numeric: 5000 },
        bat_quick_charging: { value: "45W Wired, 15W Wireless, 4.5W Reverse", numeric: null },
        bat_placement: { value: "Non-removable", numeric: null },
        bat_usb_typec: { value: "Yes", numeric: null },
        mem_storage: { value: "256GB / 512GB / 1TB", numeric: 256 },
        mem_storage_type: { value: "UFS 4.0", numeric: null },
        mem_usb_otg: { value: "Yes", numeric: null },
        mem_ram: { value: "12 GB", numeric: 12 },
        net_network: { value: "2G / 3G / 4G / 5G", numeric: null },
        net_sim_slot: { value: "Dual SIM (Nano + eSIM)", numeric: null },
        net_sim_size: { value: "Nano-SIM", numeric: null },
        net_edge: { value: "Yes", numeric: null },
        net_gprs: { value: "Yes", numeric: null },
        net_volte: { value: "Yes", numeric: null },
        net_speed: { value: "HSPA 42.2/5.76 Mbps, LTE-A, 5G", numeric: null },
        net_wlan: { value: "Wi-Fi 7 (802.11be)", numeric: null },
        net_bluetooth: { value: "5.3", numeric: 5.3 },
        net_gps: { value: "GPS, GLONASS, Galileo, BeiDou", numeric: null },
        net_infrared: { value: "No", numeric: null },
        net_hotspot: { value: "Yes", numeric: null },
        net_nfc: { value: "Yes", numeric: null },
        net_usb: { value: "USB Type-C 3.2", numeric: null },
        sens_light: { value: "Yes", numeric: null },
        sens_fingerprint: { value: "Ultrasonic (under display)", numeric: null },
        sens_fingerprint_pos: { value: "Under Display", numeric: null },
        sens_face_unlock: { value: "Yes", numeric: null },
        media_fm: { value: "No", numeric: null },
        media_speaker: { value: "Stereo Speakers", numeric: null },
        media_audio_jack: { value: "No", numeric: null },
        media_video: { value: "MP4, M4V, 3GP, AVI, MKV", numeric: null },
        media_doc_reader: { value: "Yes (PDF, DOC, XLS, PPT)", numeric: null },
        more_made_by: { value: "Samsung Electronics", numeric: null },
        more_features: { value: "S Pen, Samsung DeX, Knox Security, AI Features", numeric: null },
      },
    },
    {
      brandSlug: "apple",
      name: "Apple iPhone 15 Pro Max",
      slug: "apple-iphone-15-pro-max",
      mainImage: "/phones/apple-iphone-15-pro-max.svg",
      marketStatus: "available",
      releaseDate: "2023-09-22",
      priceUsd: 1199.99,
      priceDisplay: "$1,199",
      dataSource: "official",
      lastVerifiedAt: new Date("2024-05-20"),
      overview: "The iPhone 15 Pro Max features a titanium design, the powerful A17 Pro chip, a customizable Action Button, and the most advanced camera system ever in an iPhone with a 5x telephoto zoom.",
      isFeatured: true,
      isPublished: true,
      pros: ["A17 Pro chip with exceptional GPU performance", "5x optical zoom telephoto camera", "Titanium design — lightest Pro Max ever", "USB-C with USB 3 speeds", "Industry-leading video recording"],
      cons: ["No charger in box", "Limited customization vs Android", "Expensive", "No always-on display AOD customization"],
      specs: {
        gen_brand: { value: "Apple", numeric: null },
        gen_model: { value: "iPhone 15 Pro Max", numeric: null },
        gen_device_type: { value: "Smartphone", numeric: null },
        gen_release_date: { value: "September 22, 2023", numeric: null },
        gen_status: { value: "Available", numeric: null },
        hw_os: { value: "iOS", numeric: null },
        hw_os_version: { value: "iOS 17", numeric: null },
        hw_ui: { value: "iOS", numeric: null },
        hw_chipset: { value: "Apple A17 Pro", numeric: null },
        hw_cpu: { value: "Hexa-core (2x3.78 GHz + 4x2.11 GHz)", numeric: null },
        hw_cpu_cores: { value: "6", numeric: 6 },
        hw_architecture: { value: "64-bit", numeric: null },
        hw_fabrication: { value: "3 nm", numeric: null },
        hw_gpu: { value: "Apple GPU (6-core)", numeric: null },
        display_type: { value: "Super Retina XDR OLED", numeric: null },
        display_size: { value: "6.7", numeric: 6.7 },
        display_resolution: { value: "2796 x 1290", numeric: null },
        display_aspect_ratio: { value: "19.5:9", numeric: null },
        display_ppi: { value: "460", numeric: 460 },
        display_stb_ratio: { value: "89.8%", numeric: null },
        display_protection: { value: "Ceramic Shield", numeric: null },
        display_bezelless: { value: "Yes", numeric: null },
        display_touch: { value: "Capacitive, Multi-touch", numeric: null },
        display_refresh_rate: { value: "120", numeric: 120 },
        display_notch: { value: "Dynamic Island", numeric: null },
        cam_pri_setup: { value: "Triple Camera", numeric: null },
        cam_pri_resolution: { value: "48", numeric: 48 },
        cam_pri_autofocus: { value: "Dual Pixel PDAF, OIS", numeric: null },
        cam_pri_flash: { value: "True Tone LED Flash", numeric: null },
        cam_pri_img_res: { value: "8064 x 6048 Pixels", numeric: null },
        cam_pri_zoom: { value: "5x Optical, 25x Digital", numeric: null },
        cam_pri_modes: { value: "Night, Portrait, Panorama, Cinematic, ProRAW", numeric: null },
        cam_pri_aperture: { value: "f/1.78 (wide) + f/2.2 (ultrawide) + f/2.8 (telephoto)", numeric: null },
        cam_pri_features: { value: "ProRAW, ProRes, Cinematic Mode, Photonic Engine", numeric: null },
        cam_pri_video: { value: "4K@24/30/60fps, 1080p@120/240fps, ProRes", numeric: null },
        cam_pri_fps: { value: "24/30/60/120/240 fps", numeric: null },
        cam_sel_setup: { value: "Single Camera", numeric: null },
        cam_sel_resolution: { value: "12", numeric: 12 },
        cam_sel_video: { value: "4K@30/60fps", numeric: null },
        cam_sel_fps: { value: "30/60 fps", numeric: null },
        cam_sel_aperture: { value: "f/1.9", numeric: null },
        design_height: { value: "159.9", numeric: 159.9 },
        design_width: { value: "76.7", numeric: 76.7 },
        design_thickness: { value: "8.3", numeric: 8.3 },
        design_weight: { value: "221", numeric: 221 },
        design_build_back: { value: "Matte Glass", numeric: null },
        design_colors: { value: "Natural Titanium, Blue, White, Black", numeric: null },
        design_waterproof: { value: "Yes", numeric: null },
        design_ip_rating: { value: "IP68", numeric: null },
        bat_type: { value: "Li-Ion", numeric: null },
        bat_capacity: { value: "4441", numeric: 4441 },
        bat_quick_charging: { value: "27W Wired, 15W MagSafe, 7.5W Qi", numeric: null },
        bat_placement: { value: "Non-removable", numeric: null },
        bat_usb_typec: { value: "Yes", numeric: null },
        mem_storage: { value: "256GB / 512GB / 1TB", numeric: 256 },
        mem_storage_type: { value: "NVMe", numeric: null },
        mem_usb_otg: { value: "No", numeric: null },
        mem_ram: { value: "8 GB", numeric: 8 },
        net_network: { value: "2G / 3G / 4G / 5G", numeric: null },
        net_sim_slot: { value: "Dual eSIM", numeric: null },
        net_sim_size: { value: "eSIM", numeric: null },
        net_volte: { value: "Yes", numeric: null },
        net_speed: { value: "LTE-A, 5G", numeric: null },
        net_wlan: { value: "Wi-Fi 6E (802.11ax)", numeric: null },
        net_bluetooth: { value: "5.3", numeric: 5.3 },
        net_gps: { value: "GPS, GLONASS, Galileo, BeiDou, QZSS", numeric: null },
        net_infrared: { value: "No", numeric: null },
        net_hotspot: { value: "Yes", numeric: null },
        net_nfc: { value: "Yes", numeric: null },
        net_usb: { value: "USB Type-C 3.0", numeric: null },
        sens_light: { value: "Yes", numeric: null },
        sens_fingerprint: { value: "No (Face ID)", numeric: null },
        sens_face_unlock: { value: "Face ID", numeric: null },
        media_fm: { value: "No", numeric: null },
        media_speaker: { value: "Stereo Speakers", numeric: null },
        media_audio_jack: { value: "No", numeric: null },
        more_made_by: { value: "Apple Inc.", numeric: null },
        more_features: { value: "Action Button, Always-On Display, Crash Detection", numeric: null },
      },
    },
    {
      brandSlug: "xiaomi",
      name: "Xiaomi 14 Ultra",
      slug: "xiaomi-14-ultra",
      mainImage: "/phones/xiaomi-14-ultra.svg",
      marketStatus: "available",
      releaseDate: "2024-02-22",
      priceUsd: 999.99,
      priceDisplay: "$999",
      dataSource: "official",
      lastVerifiedAt: new Date("2024-06-01"),
      overview: "The Xiaomi 14 Ultra is a photography powerhouse co-engineered with Leica, featuring a 1-inch main sensor with variable aperture and flagship performance.",
      isFeatured: true,
      isPublished: true,
      pros: ["Leica co-engineered 1-inch camera sensor", "Variable aperture f/1.63-f/4.0", "90W fast charging", "Exceptional display quality"],
      cons: ["Limited global availability", "No wireless charging in some regions", "Bulky camera module"],
      specs: {
        gen_brand: { value: "Xiaomi", numeric: null },
        gen_model: { value: "14 Ultra", numeric: null },
        gen_device_type: { value: "Smartphone", numeric: null },
        gen_release_date: { value: "February 22, 2024", numeric: null },
        gen_status: { value: "Available", numeric: null },
        hw_os: { value: "Android", numeric: null },
        hw_os_version: { value: "Android 14", numeric: null },
        hw_ui: { value: "HyperOS", numeric: null },
        hw_chipset: { value: "Snapdragon 8 Gen 3", numeric: null },
        hw_cpu: { value: "Octa-core (1x3.3 GHz Cortex-X4 & 3x3.2 GHz Cortex-A720 & 4x2.3 GHz Cortex-A520)", numeric: null },
        hw_cpu_cores: { value: "8", numeric: 8 },
        hw_architecture: { value: "64-bit", numeric: null },
        hw_fabrication: { value: "4 nm", numeric: null },
        hw_gpu: { value: "Adreno 750", numeric: null },
        display_type: { value: "LTPO AMOLED", numeric: null },
        display_size: { value: "6.73", numeric: 6.73 },
        display_resolution: { value: "3200 x 1440 (QHD+)", numeric: null },
        display_aspect_ratio: { value: "20:9", numeric: null },
        display_ppi: { value: "522", numeric: 522 },
        display_stb_ratio: { value: "92.1%", numeric: null },
        display_protection: { value: "Gorilla Glass Victus 2", numeric: null },
        display_bezelless: { value: "Yes", numeric: null },
        display_touch: { value: "Capacitive, Multi-touch", numeric: null },
        display_refresh_rate: { value: "120", numeric: 120 },
        display_notch: { value: "Punch-hole", numeric: null },
        cam_pri_setup: { value: "Quad Camera", numeric: null },
        cam_pri_resolution: { value: "50", numeric: 50 },
        cam_pri_autofocus: { value: "Laser AF, PDAF, OIS", numeric: null },
        cam_pri_flash: { value: "Dual LED Flash", numeric: null },
        cam_pri_aperture: { value: "f/1.63 - f/4.0 (Variable)", numeric: null },
        cam_pri_features: { value: "Leica Summilux, 1-inch sensor, Variable aperture", numeric: null },
        cam_pri_video: { value: "8K@24fps, 4K@60fps, 1080p@240fps", numeric: null },
        cam_pri_fps: { value: "24/30/60/120/240 fps", numeric: null },
        cam_sel_setup: { value: "Single Camera", numeric: null },
        cam_sel_resolution: { value: "32", numeric: 32 },
        cam_sel_video: { value: "4K@30fps, 1080p@60fps", numeric: null },
        cam_sel_fps: { value: "30/60 fps", numeric: null },
        cam_sel_aperture: { value: "f/2.0", numeric: null },
        design_height: { value: "161.4", numeric: 161.4 },
        design_width: { value: "75.3", numeric: 75.3 },
        design_thickness: { value: "9.2", numeric: 9.2 },
        design_weight: { value: "227", numeric: 227 },
        design_build_back: { value: "Eco Leather / Glass", numeric: null },
        design_colors: { value: "Black, White", numeric: null },
        design_waterproof: { value: "Yes", numeric: null },
        design_ip_rating: { value: "IP68", numeric: null },
        bat_type: { value: "Li-Po", numeric: null },
        bat_capacity: { value: "5300", numeric: 5300 },
        bat_quick_charging: { value: "90W Wired, 50W Wireless, 10W Reverse", numeric: null },
        bat_placement: { value: "Non-removable", numeric: null },
        bat_usb_typec: { value: "Yes", numeric: null },
        mem_storage: { value: "256GB / 512GB / 1TB", numeric: 512 },
        mem_storage_type: { value: "UFS 4.0", numeric: null },
        mem_usb_otg: { value: "Yes", numeric: null },
        mem_ram: { value: "16 GB", numeric: 16 },
        net_network: { value: "2G / 3G / 4G / 5G", numeric: null },
        net_sim_slot: { value: "Dual SIM (Nano + Nano)", numeric: null },
        net_sim_size: { value: "Nano-SIM", numeric: null },
        net_wlan: { value: "Wi-Fi 7 (802.11be)", numeric: null },
        net_bluetooth: { value: "5.4", numeric: 5.4 },
        net_gps: { value: "GPS, GLONASS, Galileo, BeiDou", numeric: null },
        net_infrared: { value: "Yes", numeric: null },
        net_nfc: { value: "Yes", numeric: null },
        net_usb: { value: "USB Type-C 3.2", numeric: null },
        sens_fingerprint: { value: "Optical (under display)", numeric: null },
        sens_fingerprint_pos: { value: "Under Display", numeric: null },
        sens_face_unlock: { value: "Yes", numeric: null },
        media_speaker: { value: "Stereo Speakers", numeric: null },
        media_audio_jack: { value: "No", numeric: null },
        more_made_by: { value: "Xiaomi Corporation", numeric: null },
        more_features: { value: "Leica Camera System, Dolby Vision, Dolby Atmos", numeric: null },
      },
    },
    {
      brandSlug: "google",
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      mainImage: "/phones/google-pixel-8-pro.svg",
      marketStatus: "available",
      releaseDate: "2023-10-12",
      priceUsd: 999.00,
      dataSource: "official",
      lastVerifiedAt: new Date("2024-04-10"),
      priceDisplay: "$999",
      overview: "The Pixel 8 Pro is Google's most advanced phone, featuring the Tensor G3 chip with powerful AI capabilities, a pro-level camera system, and 7 years of OS and security updates.",
      isFeatured: false,
      isPublished: true,
      pros: ["7 years of OS and security updates", "Best-in-class computational photography", "Tensor G3 AI features", "Clean Android experience"],
      cons: ["Tensor G3 not as fast as Snapdragon 8 Gen 3", "Average battery life", "No charger in box"],
      specs: {
        gen_brand: { value: "Google", numeric: null },
        gen_model: { value: "Pixel 8 Pro", numeric: null },
        gen_device_type: { value: "Smartphone", numeric: null },
        gen_release_date: { value: "October 12, 2023", numeric: null },
        gen_status: { value: "Available", numeric: null },
        hw_os: { value: "Android", numeric: null },
        hw_os_version: { value: "Android 14", numeric: null },
        hw_ui: { value: "Stock Android (Pixel UI)", numeric: null },
        hw_chipset: { value: "Google Tensor G3", numeric: null },
        hw_cpu: { value: "Octa-core (1x3.0 GHz Cortex-X3 & 4x2.45 GHz Cortex-A715 & 4x2.15 GHz Cortex-A510)", numeric: null },
        hw_cpu_cores: { value: "9", numeric: 9 },
        hw_architecture: { value: "64-bit", numeric: null },
        hw_fabrication: { value: "4 nm", numeric: null },
        hw_gpu: { value: "Immortalis-G715s MC10", numeric: null },
        display_type: { value: "LTPO OLED", numeric: null },
        display_size: { value: "6.7", numeric: 6.7 },
        display_resolution: { value: "2992 x 1344 (QHD+)", numeric: null },
        display_aspect_ratio: { value: "20:9", numeric: null },
        display_ppi: { value: "489", numeric: 489 },
        display_stb_ratio: { value: "87.8%", numeric: null },
        display_protection: { value: "Gorilla Glass Victus 2", numeric: null },
        display_bezelless: { value: "Yes", numeric: null },
        display_touch: { value: "Capacitive, Multi-touch", numeric: null },
        display_refresh_rate: { value: "120", numeric: 120 },
        display_notch: { value: "Punch-hole", numeric: null },
        cam_pri_setup: { value: "Triple Camera", numeric: null },
        cam_pri_resolution: { value: "50", numeric: 50 },
        cam_pri_autofocus: { value: "Laser AF, PDAF, OIS", numeric: null },
        cam_pri_flash: { value: "Dual LED Flash", numeric: null },
        cam_pri_features: { value: "Magic Eraser, Photo Unblur, Night Sight, Best Take", numeric: null },
        cam_pri_video: { value: "4K@30/60fps, 1080p@120/240fps", numeric: null },
        cam_pri_fps: { value: "30/60/120/240 fps", numeric: null },
        cam_sel_setup: { value: "Single Camera", numeric: null },
        cam_sel_resolution: { value: "10.5", numeric: 10.5 },
        cam_sel_video: { value: "4K@30fps", numeric: null },
        cam_sel_fps: { value: "30 fps", numeric: null },
        cam_sel_aperture: { value: "f/2.2", numeric: null },
        design_height: { value: "162.6", numeric: 162.6 },
        design_width: { value: "76.5", numeric: 76.5 },
        design_thickness: { value: "8.8", numeric: 8.8 },
        design_weight: { value: "213", numeric: 213 },
        design_build_back: { value: "Gorilla Glass Victus 2", numeric: null },
        design_colors: { value: "Obsidian, Porcelain, Bay", numeric: null },
        design_waterproof: { value: "Yes", numeric: null },
        design_ip_rating: { value: "IP68", numeric: null },
        bat_type: { value: "Li-Ion", numeric: null },
        bat_capacity: { value: "5050", numeric: 5050 },
        bat_quick_charging: { value: "30W Wired, 23W Wireless, 5W Reverse", numeric: null },
        bat_placement: { value: "Non-removable", numeric: null },
        bat_usb_typec: { value: "Yes", numeric: null },
        mem_storage: { value: "128GB / 256GB / 512GB / 1TB", numeric: 128 },
        mem_storage_type: { value: "UFS 3.1", numeric: null },
        mem_usb_otg: { value: "Yes", numeric: null },
        mem_ram: { value: "12 GB", numeric: 12 },
        net_network: { value: "2G / 3G / 4G / 5G", numeric: null },
        net_sim_slot: { value: "Single SIM (Nano + eSIM)", numeric: null },
        net_sim_size: { value: "Nano-SIM", numeric: null },
        net_wlan: { value: "Wi-Fi 7 (802.11be)", numeric: null },
        net_bluetooth: { value: "5.3", numeric: 5.3 },
        net_gps: { value: "GPS, GLONASS, Galileo, BeiDou", numeric: null },
        net_nfc: { value: "Yes", numeric: null },
        net_usb: { value: "USB Type-C 3.2", numeric: null },
        sens_fingerprint: { value: "Optical (under display)", numeric: null },
        sens_fingerprint_pos: { value: "Under Display", numeric: null },
        sens_face_unlock: { value: "Yes", numeric: null },
        media_speaker: { value: "Stereo Speakers", numeric: null },
        media_audio_jack: { value: "No", numeric: null },
        more_made_by: { value: "Google LLC", numeric: null },
        more_features: { value: "Temperature Sensor, AI Features, 7 Years Updates", numeric: null },
      },
    },
    {
      brandSlug: "oneplus",
      name: "OnePlus 12",
      slug: "oneplus-12",
      mainImage: "/phones/oneplus-12.svg",
      marketStatus: "available",
      releaseDate: "2024-01-23",
      priceUsd: 799.99,
      dataSource: "official",
      lastVerifiedAt: new Date("2024-05-15"),
      priceDisplay: "$799",
      overview: "The OnePlus 12 delivers flagship performance with Snapdragon 8 Gen 3, Hasselblad camera tuning, and the fastest 100W wired charging in its class.",
      isFeatured: false,
      isPublished: true,
      pros: ["100W fastest wired charging", "Hasselblad camera tuning", "Snapdragon 8 Gen 3 performance", "Beautiful QHD+ LTPO display"],
      cons: ["IP65 only (not IP68)", "No wireless charging on base model in some regions", "OxygenOS diverging from stock Android"],
      specs: {
        gen_brand: { value: "OnePlus", numeric: null },
        gen_model: { value: "12", numeric: null },
        gen_device_type: { value: "Smartphone", numeric: null },
        gen_release_date: { value: "January 23, 2024", numeric: null },
        gen_status: { value: "Available", numeric: null },
        hw_os: { value: "Android", numeric: null },
        hw_os_version: { value: "Android 14", numeric: null },
        hw_ui: { value: "OxygenOS 14", numeric: null },
        hw_chipset: { value: "Snapdragon 8 Gen 3", numeric: null },
        hw_cpu: { value: "Octa-core (1x3.3 GHz Cortex-X4 & 3x3.2 GHz Cortex-A720 & 4x2.3 GHz Cortex-A520)", numeric: null },
        hw_cpu_cores: { value: "8", numeric: 8 },
        hw_architecture: { value: "64-bit", numeric: null },
        hw_fabrication: { value: "4 nm", numeric: null },
        hw_gpu: { value: "Adreno 750", numeric: null },
        display_type: { value: "LTPO AMOLED", numeric: null },
        display_size: { value: "6.82", numeric: 6.82 },
        display_resolution: { value: "3168 x 1440 (QHD+)", numeric: null },
        display_aspect_ratio: { value: "19.8:9", numeric: null },
        display_ppi: { value: "510", numeric: 510 },
        display_protection: { value: "Gorilla Glass Victus 2", numeric: null },
        display_bezelless: { value: "Yes", numeric: null },
        display_touch: { value: "Capacitive, Multi-touch", numeric: null },
        display_refresh_rate: { value: "120", numeric: 120 },
        display_notch: { value: "Punch-hole", numeric: null },
        cam_pri_setup: { value: "Triple Camera", numeric: null },
        cam_pri_resolution: { value: "50", numeric: 50 },
        cam_pri_autofocus: { value: "PDAF, OIS", numeric: null },
        cam_pri_flash: { value: "Dual LED Flash", numeric: null },
        cam_pri_aperture: { value: "f/1.6", numeric: null },
        cam_pri_features: { value: "Hasselblad, OIS, 3x Optical Zoom", numeric: null },
        cam_pri_video: { value: "4K@30/60fps, 1080p@240fps, 8K@24fps", numeric: null },
        cam_pri_fps: { value: "24/30/60/120/240 fps", numeric: null },
        cam_sel_setup: { value: "Single Camera", numeric: null },
        cam_sel_resolution: { value: "32", numeric: 32 },
        cam_sel_video: { value: "4K@30fps, 1080p@30fps", numeric: null },
        cam_sel_fps: { value: "30 fps", numeric: null },
        cam_sel_aperture: { value: "f/2.4", numeric: null },
        design_height: { value: "164.3", numeric: 164.3 },
        design_width: { value: "75.8", numeric: 75.8 },
        design_thickness: { value: "9.2", numeric: 9.2 },
        design_weight: { value: "220", numeric: 220 },
        design_build_back: { value: "Glass (Silky)", numeric: null },
        design_colors: { value: "Flowy Emerald, Silky Black", numeric: null },
        design_waterproof: { value: "Yes (limited)", numeric: null },
        design_ip_rating: { value: "IP65", numeric: null },
        bat_type: { value: "Li-Po", numeric: null },
        bat_capacity: { value: "5400", numeric: 5400 },
        bat_quick_charging: { value: "100W Wired, 50W Wireless", numeric: null },
        bat_placement: { value: "Non-removable", numeric: null },
        bat_usb_typec: { value: "Yes", numeric: null },
        mem_storage: { value: "256GB / 512GB", numeric: 256 },
        mem_storage_type: { value: "UFS 4.0", numeric: null },
        mem_usb_otg: { value: "Yes", numeric: null },
        mem_ram: { value: "12 GB / 16 GB", numeric: 12 },
        net_network: { value: "2G / 3G / 4G / 5G", numeric: null },
        net_sim_slot: { value: "Dual SIM (Nano + Nano)", numeric: null },
        net_sim_size: { value: "Nano-SIM", numeric: null },
        net_wlan: { value: "Wi-Fi 7 (802.11be)", numeric: null },
        net_bluetooth: { value: "5.4", numeric: 5.4 },
        net_gps: { value: "GPS, GLONASS, Galileo, BeiDou", numeric: null },
        net_infrared: { value: "Yes", numeric: null },
        net_nfc: { value: "Yes", numeric: null },
        net_usb: { value: "USB Type-C 2.0", numeric: null },
        sens_fingerprint: { value: "Optical (under display)", numeric: null },
        sens_fingerprint_pos: { value: "Under Display", numeric: null },
        sens_face_unlock: { value: "Yes", numeric: null },
        media_speaker: { value: "Stereo Speakers (Dolby Atmos)", numeric: null },
        media_audio_jack: { value: "No", numeric: null },
        more_made_by: { value: "OnePlus Technology", numeric: null },
        more_features: { value: "Alert Slider, Dolby Vision, Hasselblad Tuning", numeric: null },
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
      pros: ["Unique transparent design with Glyph interface", "Clean Nothing OS close to stock Android", "Solid mid-range performance", "Affordable price point"],
      cons: ["No wireless charging", "IP54 only", "No telephoto camera", "Limited availability in some markets"],
      specs: {
        gen_brand: { value: "Nothing", numeric: null },
        gen_model: { value: "Phone (2a)", numeric: null },
        gen_device_type: { value: "Smartphone", numeric: null },
        gen_release_date: { value: "March 5, 2024", numeric: null },
        gen_status: { value: "Available", numeric: null },
        hw_os: { value: "Android", numeric: null },
        hw_os_version: { value: "Android 14", numeric: null },
        hw_ui: { value: "Nothing OS 2.5", numeric: null },
        hw_chipset: { value: "MediaTek Dimensity 7200 Pro", numeric: null },
        hw_cpu: { value: "Octa-core (2x2.8 GHz Cortex-A715 & 6x2.0 GHz Cortex-A510)", numeric: null },
        hw_cpu_cores: { value: "8", numeric: 8 },
        hw_architecture: { value: "64-bit", numeric: null },
        hw_fabrication: { value: "4 nm", numeric: null },
        hw_gpu: { value: "Mali-G610 MC4", numeric: null },
        display_type: { value: "AMOLED", numeric: null },
        display_size: { value: "6.7", numeric: 6.7 },
        display_resolution: { value: "2412 x 1084 (FHD+)", numeric: null },
        display_aspect_ratio: { value: "20:9", numeric: null },
        display_ppi: { value: "394", numeric: 394 },
        display_protection: { value: "Gorilla Glass 5", numeric: null },
        display_bezelless: { value: "Yes", numeric: null },
        display_touch: { value: "Capacitive, Multi-touch", numeric: null },
        display_refresh_rate: { value: "120", numeric: 120 },
        display_notch: { value: "Punch-hole", numeric: null },
        cam_pri_setup: { value: "Dual Camera", numeric: null },
        cam_pri_resolution: { value: "50", numeric: 50 },
        cam_pri_autofocus: { value: "PDAF, OIS", numeric: null },
        cam_pri_flash: { value: "LED Flash", numeric: null },
        cam_pri_features: { value: "OIS, Ultra XDR, HDR", numeric: null },
        cam_pri_video: { value: "4K@30fps, 1080p@60fps", numeric: null },
        cam_pri_fps: { value: "30/60 fps", numeric: null },
        cam_sel_setup: { value: "Single Camera", numeric: null },
        cam_sel_resolution: { value: "32", numeric: 32 },
        cam_sel_video: { value: "1080p@30fps", numeric: null },
        cam_sel_fps: { value: "30 fps", numeric: null },
        cam_sel_aperture: { value: "f/2.2", numeric: null },
        design_height: { value: "161.7", numeric: 161.7 },
        design_width: { value: "76.3", numeric: 76.3 },
        design_thickness: { value: "8.6", numeric: 8.6 },
        design_weight: { value: "190", numeric: 190 },
        design_build_back: { value: "Plastic (Transparent)", numeric: null },
        design_colors: { value: "Black, White", numeric: null },
        design_waterproof: { value: "Splash Resistant", numeric: null },
        design_ip_rating: { value: "IP54", numeric: null },
        bat_type: { value: "Li-Po", numeric: null },
        bat_capacity: { value: "5000", numeric: 5000 },
        bat_quick_charging: { value: "45W Wired", numeric: null },
        bat_placement: { value: "Non-removable", numeric: null },
        bat_usb_typec: { value: "Yes", numeric: null },
        mem_storage: { value: "128GB / 256GB", numeric: 128 },
        mem_storage_type: { value: "UFS 2.2", numeric: null },
        mem_usb_otg: { value: "Yes", numeric: null },
        mem_ram: { value: "8 GB / 12 GB", numeric: 8 },
        net_network: { value: "2G / 3G / 4G / 5G", numeric: null },
        net_sim_slot: { value: "Dual SIM (Nano + Nano)", numeric: null },
        net_sim_size: { value: "Nano-SIM", numeric: null },
        net_wlan: { value: "Wi-Fi 6 (802.11ax)", numeric: null },
        net_bluetooth: { value: "5.3", numeric: 5.3 },
        net_gps: { value: "GPS, GLONASS, Galileo, BeiDou", numeric: null },
        net_nfc: { value: "Yes", numeric: null },
        net_usb: { value: "USB Type-C 2.0", numeric: null },
        sens_fingerprint: { value: "Optical (under display)", numeric: null },
        sens_fingerprint_pos: { value: "Under Display", numeric: null },
        sens_face_unlock: { value: "Yes", numeric: null },
        media_speaker: { value: "Stereo Speakers", numeric: null },
        media_audio_jack: { value: "No", numeric: null },
        more_made_by: { value: "Nothing Technology", numeric: null },
        more_features: { value: "Glyph Interface, Nothing OS, Transparent Design", numeric: null },
      },
    },
  ];

  for (const phoneData of phones) {
    const { brandSlug, specs, pros, cons, ...phoneFields } = phoneData;
    const phone = await prisma.phone.upsert({
      where: { slug: phoneFields.slug },
      update: {
        mainImage: phoneFields.mainImage,
        dataSource: phoneFields.dataSource,
        lastVerifiedAt: phoneFields.lastVerifiedAt,
        updatedById: adminUser.id,
      },
      create: {
        ...phoneFields,
        brandId: createdBrands[brandSlug],
        publishedAt: new Date(),
        pros: pros || null,
        cons: cons || null,
        updatedById: adminUser.id,
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

  // ==================== SEED REVIEWS ====================
  console.log("🌱 Seeding reviews...");

  // Create reviewer users
  const reviewerHash = await bcrypt.hash("reviewer123", 12);
  const reviewerNames = ["Alex Chen", "Sarah Miller", "Omar Hassan", "Priya Sharma", "James Wilson"];
  const reviewerUsers: string[] = [];
  for (let i = 0; i < reviewerNames.length; i++) {
    const email = `reviewer${i + 1}@mobileplatform.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: reviewerHash,
        name: reviewerNames[i],
        roleId: userRole.id,
        isActive: true,
        emailVerified: true,
      },
    });
    reviewerUsers.push(user.id);
  }

  // Get all phone IDs
  const allPhones = await prisma.phone.findMany({ select: { id: true, slug: true, name: true } });
  const phoneMap: Record<string, string> = {};
  for (const p of allPhones) {
    phoneMap[p.slug] = p.id;
  }

  // Get rating categories
  const ratingCats = await prisma.ratingCategory.findMany();
  const ratingCatMap: Record<string, string> = {};
  for (const rc of ratingCats) {
    ratingCatMap[rc.slug] = rc.id;
  }

  const reviewsData = [
    // Samsung Galaxy S24 Ultra reviews
    { phoneSlug: "samsung-galaxy-s24-ultra", userId: 0, title: "The Ultimate Android Phone", content: "After using the S24 Ultra for three months, I can confidently say this is the best Android phone available. The 200MP camera captures incredible detail, and the AI features are genuinely useful — Circle to Search has become part of my daily workflow. The titanium frame feels premium without adding unnecessary weight. Battery life easily gets me through a full day of heavy use.", overallScore: 9.2, pros: "Outstanding camera system, AI features, S Pen, premium build", cons: "Expensive, heavy for some users", ratings: { "design": 9, "display-rating": 9.5, "camera-rating": 9.5, "performance-rating": 9, "battery-rating": 8.5, "software-rating": 9, "value-rating": 8 } },
    { phoneSlug: "samsung-galaxy-s24-ultra", userId: 1, title: "Great Camera, But Pricey", content: "The camera system is phenomenal — the 100x Space Zoom actually produces usable photos, and nightography is a game-changer. The display is the best I've ever seen on a phone. However, at $1,299, it's hard to justify over the regular S24+. The S Pen is nice but I rarely use it. Software updates have been solid with monthly security patches.", overallScore: 8.5, pros: "Best camera in any smartphone, gorgeous display, good software support", cons: "Very expensive, S Pen novelty wears off, heavy", ratings: { "design": 8.5, "display-rating": 10, "camera-rating": 9.5, "performance-rating": 9, "battery-rating": 8, "software-rating": 8.5, "value-rating": 7 } },
    { phoneSlug: "samsung-galaxy-s24-ultra", userId: 2, title: "Reliable Daily Driver", content: "I switched from the iPhone 14 Pro Max and have no regrets. The customization options on One UI 6.1 are fantastic, the multitasking with DeX is useful for productivity, and the 120Hz display makes everything feel fluid. Camera quality is top-notch. My only complaint is that it can get warm during extended gaming sessions.", overallScore: 8.8, pros: "Excellent multitasking, great camera, beautiful display", cons: "Gets warm during heavy use, no charger included", ratings: { "design": 9, "display-rating": 9, "camera-rating": 9, "performance-rating": 8.5, "battery-rating": 8.5, "software-rating": 9, "value-rating": 8.5 } },
    { phoneSlug: "samsung-galaxy-s24-ultra", userId: 3, title: "Professional Photography Tool", content: "As a semi-professional photographer, the S24 Ultra has genuinely replaced my compact camera for travel. The 200MP sensor captures stunning detail, and the RAW processing gives me plenty of editing headroom. ProVideo mode is excellent for content creation. The large display is perfect for editing on the go.", overallScore: 9.0, pros: "Incredible camera detail, ProVideo mode, large display for editing", cons: "Large and heavy, expensive", ratings: { "design": 8, "display-rating": 9.5, "camera-rating": 10, "performance-rating": 9, "battery-rating": 8, "software-rating": 8.5, "value-rating": 8 } },

    // Apple iPhone 15 Pro Max reviews
    { phoneSlug: "apple-iphone-15-pro-max", userId: 1, title: "The Best iPhone Yet", content: "The titanium design makes a real difference — it's noticeably lighter than the 14 Pro Max. The 5x telephoto zoom produces incredible results, and the Action Button is genuinely useful once you set it up. USB-C finally brings universal charging. ProRes video recording at 4K is unmatched. Battery life is excellent — consistently getting 10+ hours of screen time.", overallScore: 9.0, pros: "Lightweight titanium, excellent telephoto, great battery life, USB-C", cons: "Expensive, limited customization, slow charging", ratings: { "design": 9.5, "display-rating": 9, "camera-rating": 9, "performance-rating": 9.5, "battery-rating": 9, "software-rating": 8.5, "value-rating": 7.5 } },
    { phoneSlug: "apple-iphone-15-pro-max", userId: 2, title: "Solid But Iterative Update", content: "Coming from the 13 Pro Max, the improvements are nice but not revolutionary. The titanium frame looks great, and the camera improvements are noticeable in low light. However, iOS still feels restrictive compared to Android. The Action Button is a great addition. Performance is expectedly excellent with the A17 Pro chip.", overallScore: 8.3, pros: "Premium build quality, reliable performance, great ecosystem", cons: "Not a huge upgrade from 13/14 Pro Max, iOS limitations, expensive", ratings: { "design": 9, "display-rating": 8.5, "camera-rating": 8.5, "performance-rating": 9, "battery-rating": 8.5, "software-rating": 8, "value-rating": 7 } },
    { phoneSlug: "apple-iphone-15-pro-max", userId: 4, title: "Perfect for Content Creators", content: "As a YouTuber, the iPhone 15 Pro Max is my primary camera. ProRes video, Cinematic Mode, and the new Log profile give me professional-grade footage. The USB 3 transfer speeds via USB-C are a game-changer for my workflow. Battery lasts through a full day of shooting. The only downside is the 48MP main sensor feels a bit behind Samsung's 200MP.", overallScore: 8.7, pros: "ProRes video, USB-C with fast transfer, excellent battery", cons: "48MP main sensor, no USB-C accessories in box", ratings: { "design": 9, "display-rating": 9, "camera-rating": 9, "performance-rating": 9.5, "battery-rating": 9, "software-rating": 8, "value-rating": 7.5 } },

    // Google Pixel 8 Pro reviews
    { phoneSlug: "google-pixel-8-pro", userId: 0, title: "AI Photography King", content: "The Pixel 8 Pro takes computational photography to another level. Magic Eraser, Best Take, and Audio Magic Eraser are incredibly useful. The main camera produces the most natural-looking photos of any smartphone. 7 years of updates is a massive selling point. The temperature sensor is a neat addition, though I rarely use it.", overallScore: 8.5, pros: "Best computational photography, 7 years of updates, clean software", cons: "Temperature sensor gimmicky, average battery, occasional bugs", ratings: { "design": 8, "display-rating": 8.5, "camera-rating": 9.5, "performance-rating": 8, "battery-rating": 7.5, "software-rating": 9.5, "value-rating": 8.5 } },
    { phoneSlug: "google-pixel-8-pro", userId: 3, title: "Pure Android at Its Best", content: "If you want the cleanest, most intuitive Android experience, the Pixel 8 Pro delivers. Software is buttery smooth, updates come first, and the AI features are genuinely useful. Camera is outstanding for everyday shooting — the colors are natural and the night mode is the best in the industry. Battery life could be better though.", overallScore: 8.2, pros: "Clean Android experience, excellent camera, great AI features", cons: "Average battery life, Tensor G3 heats up, premium price for a Pixel", ratings: { "design": 8, "display-rating": 8.5, "camera-rating": 9, "performance-rating": 7.5, "battery-rating": 7, "software-rating": 10, "value-rating": 8 } },
    { phoneSlug: "google-pixel-8-pro", userId: 4, title: "Great Value Flagship", content: "At $999, the Pixel 8 Pro offers flagship specs with the best software experience. The camera consistently outperforms more expensive phones in everyday scenarios. The 120Hz display is smooth and bright. My only real complaint is that the Tensor G3 can't match the raw performance of Snapdragon 8 Gen 3 in intensive tasks.", overallScore: 8.4, pros: "Excellent camera, great software, good value, 7 years updates", cons: "Tensor G3 not as powerful as Snapdragon, average battery", ratings: { "design": 8, "display-rating": 8, "camera-rating": 9, "performance-rating": 7.5, "battery-rating": 7.5, "software-rating": 9.5, "value-rating": 9 } },

    // Xiaomi 14 Ultra reviews
    { phoneSlug: "xiaomi-14-ultra", userId: 0, title: "A True Camera Phone", content: "The Leica partnership has produced something special. The 1-inch sensor captures photos with depth and character that no other phone can match. The variable aperture gives genuine creative control. Build quality is flagship-grade. HyperOS is much better than MIUI — cleaner and more intuitive. 90W charging means you never worry about battery.", overallScore: 8.8, pros: "Incredible Leica camera system, 1-inch sensor, fast charging, premium build", cons: "Limited global availability, expensive, large camera bump", ratings: { "design": 8.5, "display-rating": 9, "camera-rating": 10, "performance-rating": 9, "battery-rating": 9, "software-rating": 7.5, "value-rating": 8 } },
    { phoneSlug: "xiaomi-14-ultra", userId: 2, title: "Photography Enthusiast's Dream", content: "The variable aperture (f/1.63-f/4.0) on the main sensor is a genuine innovation — it changes how you shoot on a phone. Low-light performance is exceptional. The dedicated camera grip accessory makes it feel like a real camera. However, the software still has some rough edges compared to Samsung or Apple.", overallScore: 8.5, pros: "Variable aperture, exceptional low-light, Leica color science, camera grip", cons: "Software not as polished, camera bump is huge, global availability", ratings: { "design": 8, "display-rating": 9, "camera-rating": 9.5, "performance-rating": 8.5, "battery-rating": 8.5, "software-rating": 7, "value-rating": 8 } },
    { phoneSlug: "xiaomi-14-ultra", userId: 3, title: "Leica Magic in Your Pocket", content: "Coming from a Leica Q3 user, the color rendition and bokeh character from this phone are remarkably close to the real thing. The photos have a look that no other phone brand achieves. Snapdragon 8 Gen 3 handles everything with ease. Battery life is excellent with 90W charging. Worth every penny if photography is your passion.", overallScore: 9.0, pros: "Authentic Leica look, fantastic sensor, fast charging, great performance", cons: "Heavy and thick, not widely available, pricey", ratings: { "design": 8, "display-rating": 8.5, "camera-rating": 10, "performance-rating": 9, "battery-rating": 9, "software-rating": 7.5, "value-rating": 8.5 } },

    // OnePlus 12 reviews
    { phoneSlug: "oneplus-12", userId: 1, title: "Flagship Killer Returns", content: "OnePlus is back to form. The OnePlus 12 offers Snapdragon 8 Gen 3 performance, a stunning 2K display, and 100W charging — all for $200 less than Samsung or Apple flagships. The Hasselblad camera tuning produces great colors, though it can't quite match the S24 Ultra or iPhone 15 Pro Max in detail. OxygenOS 14 is clean and fast.", overallScore: 8.5, pros: "Excellent value, blazing fast charging, great display, smooth software", cons: "Camera not quite flagship-tier, no wireless charging in some models", ratings: { "design": 8.5, "display-rating": 9, "camera-rating": 8, "performance-rating": 9.5, "battery-rating": 9, "software-rating": 8.5, "value-rating": 9.5 } },
    { phoneSlug: "oneplus-12", userId: 3, title: "Speed Champion", content: "100W wired charging means 0-100% in about 25 minutes. That alone makes this phone worth considering. Add in the Snapdragon 8 Gen 3 with 16GB RAM and you have arguably the fastest Android phone available. The Alert Slider is a unique and useful feature. Camera is good but not industry-leading.", overallScore: 8.3, pros: "Fastest charging, excellent performance, Alert Slider, great value", cons: "Camera inconsistent in low light, OxygenOS losing identity", ratings: { "design": 8, "display-rating": 8.5, "camera-rating": 7.5, "performance-rating": 9.5, "battery-rating": 9.5, "software-rating": 8, "value-rating": 9 } },
    { phoneSlug: "oneplus-12", userId: 4, title: "Best Bang for Buck Flagship", content: "If you want the best specs per dollar, the OnePlus 12 is the answer. Every benchmark test tops Samsung and Apple, the display is gorgeous with 4500 nits peak brightness, and the haptics are surprisingly refined. Battery life is phenomenal. Only the camera holds it back from being the overall best.", overallScore: 8.6, pros: "Unbeatable performance per dollar, excellent battery, great display", cons: "Camera processing inconsistent, no IP68 in all markets", ratings: { "design": 8.5, "display-rating": 9, "camera-rating": 7.5, "performance-rating": 10, "battery-rating": 9, "software-rating": 8, "value-rating": 10 } },

    // Nothing Phone (2a) reviews
    { phoneSlug: "nothing-phone-2a", userId: 0, title: "Best Budget Phone of 2024", content: "The Nothing Phone (2a) proves you don't need to spend $1,000+ for a good smartphone experience. The Glyph interface is fun and genuinely useful for silent notifications. Nothing OS is incredibly clean — feels like what stock Android should be. Camera is decent for the price. The transparent design turns heads everywhere.", overallScore: 8.0, pros: "Unique design, clean software, great price, useful Glyph interface", cons: "Average camera, no wireless charging, plastic frame", ratings: { "design": 9, "display-rating": 7.5, "camera-rating": 7, "performance-rating": 7.5, "battery-rating": 8, "software-rating": 9, "value-rating": 9.5 } },
    { phoneSlug: "nothing-phone-2a", userId: 2, title: "Style Meets Substance", content: "Nothing continues to be the most interesting brand in smartphones. The Phone (2a) at $349 offers a 120Hz AMOLED display, capable MediaTek Dimensity 7200 Pro, and that iconic transparent design. Nothing OS 2.5 is smooth and bloat-free. The camera won't compete with flagships, but it's perfectly fine for social media.", overallScore: 7.8, pros: "Head-turning design, excellent software, AMOLED display at this price", cons: "Mediocre camera, no wireless charging, limited US availability", ratings: { "design": 9.5, "display-rating": 7.5, "camera-rating": 6.5, "performance-rating": 7, "battery-rating": 7.5, "software-rating": 9, "value-rating": 9 } },
    { phoneSlug: "nothing-phone-2a", userId: 4, title: "Refreshingly Different", content: "In a world of identical black rectangles, the Nothing Phone (2a) stands out. The Glyph lights are more than a gimmick — I use them for notification filtering daily. Performance is snappy for everyday tasks, and the display looks great. At this price point, it easily beats anything Samsung or Motorola offers.", overallScore: 8.2, pros: "Unique transparent design, Glyph interface, clean OS, great value", cons: "Camera average, no water resistance, limited accessories", ratings: { "design": 10, "display-rating": 7.5, "camera-rating": 7, "performance-rating": 7.5, "battery-rating": 8, "software-rating": 8.5, "value-rating": 9.5 } },
  ];

  for (const reviewData of reviewsData) {
    const phoneId = phoneMap[reviewData.phoneSlug];
    if (!phoneId) continue;
    
    const existingReview = await prisma.review.findFirst({
      where: { phoneId, userId: reviewerUsers[reviewData.userId], title: reviewData.title },
    });
    if (existingReview) continue;

    const review = await prisma.review.create({
      data: {
        phoneId,
        userId: reviewerUsers[reviewData.userId],
        type: "user",
        title: reviewData.title,
        content: reviewData.content,
        overallScore: reviewData.overallScore,
        pros: reviewData.pros,
        cons: reviewData.cons,
        isVerified: true,
        status: "approved",
      },
    });

    // Add category ratings
    for (const [catSlug, score] of Object.entries(reviewData.ratings)) {
      const catId = ratingCatMap[catSlug];
      if (catId) {
        await prisma.reviewRating.create({
          data: {
            reviewId: review.id,
            categoryId: catId,
            score: score as number,
          },
        });
      }
    }
  }

  // Update phone review scores
  for (const phone of allPhones) {
    const reviews = await prisma.review.findMany({
      where: { phoneId: phone.id, status: "approved" },
      select: { overallScore: true },
    });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length;
      await prisma.phone.update({
        where: { id: phone.id },
        data: { reviewScore: Math.round(avg * 10) / 10, reviewCount: reviews.length },
      });
    }
  }

  // ==================== SEED ARTICLES ====================
  console.log("🌱 Seeding articles...");

  const newsCategory = await prisma.category.findUnique({ where: { slug: "news" } });
  const reviewsCategory = await prisma.category.findUnique({ where: { slug: "reviews" } });

  const articlesData = [
    {
      title: "Best Camera Phones of 2024: Samsung, Apple, and Xiaomi Compared",
      slug: "best-camera-phones-2024-compared",
      excerpt: "We compare the top camera phones of 2024 — Samsung Galaxy S24 Ultra, Apple iPhone 15 Pro Max, and Xiaomi 14 Ultra — to find which one truly captures the best photos.",
      content: `## Best Camera Phones of 2024

The smartphone camera war has never been more competitive. In 2024, three phones stand above the rest: the **Samsung Galaxy S24 Ultra** with its 200MP sensor and 100x Space Zoom, the **Apple iPhone 15 Pro Max** with its 5x telephoto and ProRes video, and the **Xiaomi 14 Ultra** with its Leica-tuned 1-inch sensor.

### Samsung Galaxy S24 Ultra
Samsung's flagship leads in sheer resolution and zoom range. The 200MP main sensor captures extraordinary detail, and the 100x Space Zoom — while not always practical — produces surprisingly usable results at 30x-50x. AI-powered features like Nightography and Object Detection set it apart.

### Apple iPhone 15 Pro Max
Apple's approach prioritizes consistency and video. The 48MP main sensor with a 5x telephoto produces the most reliable results across all lighting conditions. ProRes video recording and the new Log profile make it the undisputed king of mobile videography.

### Xiaomi 14 Ultra
The wildcard of the group, Xiaomi's partnership with Leica has produced something special. The 1-inch sensor with variable aperture (f/1.63-f/4.0) captures photos with a character and depth that neither Samsung nor Apple can replicate. It's the closest any phone has come to feeling like a real camera.

### Verdict
- **Best for detail and zoom**: Samsung Galaxy S24 Ultra
- **Best for video**: Apple iPhone 15 Pro Max  
- **Best for photography enthusiasts**: Xiaomi 14 Ultra

All three are exceptional cameras that happen to be phones. Your choice depends on what matters most to you.`,
      type: "review",
      status: "published",
      isFeatured: true,
      categorySlug: "reviews",
      phoneSlugs: ["samsung-galaxy-s24-ultra", "apple-iphone-15-pro-max", "xiaomi-14-ultra"],
    },
    {
      title: "OnePlus 12 vs Nothing Phone (2a): Flagship vs Budget — Which Is the Better Value?",
      slug: "oneplus-12-vs-nothing-phone-2a-value-comparison",
      excerpt: "Is the OnePlus 12 worth three times the price of the Nothing Phone (2a)? We break down the real-world differences to help you decide.",
      content: `## OnePlus 12 vs Nothing Phone (2a): The Value Debate

In the Android world, value is king. The **OnePlus 12** at $799 delivers Snapdragon 8 Gen 3 performance with 100W charging, while the **Nothing Phone (2a)** at $349 offers a unique design with clean software. But which gives you more for your money?

### Performance
The OnePlus 12 is in a different league with its Snapdragon 8 Gen 3 and up to 16GB RAM. However, for everyday tasks — social media, messaging, web browsing — the Nothing Phone (2a)'s Dimensity 7200 Pro handles everything without breaking a sweat. You'll only notice the difference in gaming and heavy multitasking.

### Camera
The OnePlus 12's Hasselblad-tuned triple camera produces significantly better photos, especially in low light and with the telephoto lens. The Nothing Phone (2a)'s camera is adequate for social media but lacks the versatility and consistency of a true flagship.

### Software & Design
This is where Nothing shines. Nothing OS is arguably the cleanest Android skin available, and the transparent design with Glyph interface is genuinely innovative. OxygenOS 14 is good, but it's become increasingly similar to ColorOS.

### Battery & Charging
OnePlus wins with 100W wired charging (0-100% in 25 minutes) and a larger 5400mAh battery. The Nothing Phone (2a) has 45W charging and a 5000mAh battery — perfectly acceptable, but not exceptional.

### Verdict
The OnePlus 12 is the better phone objectively, but the Nothing Phone (2a) offers 80% of the experience at 44% of the price. For most users, the Nothing Phone (2a) is the smarter purchase.`,
      type: "news",
      status: "published",
      isFeatured: false,
      categorySlug: "comparisons",
      phoneSlugs: ["oneplus-12", "nothing-phone-2a"],
    },
  ];

  for (const articleData of articlesData) {
    const { phoneSlugs, categorySlug, ...articleFields } = articleData;
    const catId = categorySlug === "reviews" ? reviewsCategory?.id : newsCategory?.id;
    const comparisonCat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    
    const existingArticle = await prisma.article.findUnique({ where: { slug: articleFields.slug } });
    if (existingArticle) continue;

    const article = await prisma.article.create({
      data: {
        ...articleFields,
        authorId: adminUser.id,
        categoryId: comparisonCat?.id || catId || null,
        publishedAt: new Date(),
      },
    });

    // Link phones to article
    for (const phoneSlug of phoneSlugs) {
      const pId = phoneMap[phoneSlug];
      if (pId) {
        await prisma.articlePhone.create({
          data: { articleId: article.id, phoneId: pId },
        });
      }
    }
  }

  // ==================== SEED COMPANY ====================
  console.log("🌱 Seeding company...");

  const company = await prisma.company.upsert({
    where: { slug: "samsung-electronics" },
    update: {},
    create: {
      name: "Samsung Electronics",
      slug: "samsung-electronics",
      description: "Samsung Electronics is a South Korean multinational electronics corporation and one of the world's largest smartphone manufacturers, known for the Galaxy series of smartphones and tablets.",
      website: "https://samsung.com",
      type: "brand",
      isVerified: true,
      isActive: true,
    },
  });

  // ==================== SEED ADVERTISER + CAMPAIGN ====================
  console.log("🌱 Seeding advertiser and campaign...");

  const advertiser = await prisma.advertiser.upsert({
    where: { id: "seed-advertiser-samsung" },
    update: { companyId: company.id, name: "Samsung Mobile Marketing", email: "marketing@samsung.com", contactPerson: "David Kim", balance: 5000, isActive: true },
    create: {
      id: "seed-advertiser-samsung",
      companyId: company.id,
      name: "Samsung Mobile Marketing",
      email: "marketing@samsung.com",
      contactPerson: "David Kim",
      balance: 5000,
      isActive: true,
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "seed-campaign-s24ultra" },
    update: { status: "active", endDate: "2027-12-31", targeting: JSON.stringify({ brands: ["samsung"], categories: ["flagship"], countries: ["US", "UK", "DE"] }) },
    create: {
      id: "seed-campaign-s24ultra",
      advertiserId: advertiser.id,
      name: "Galaxy S24 Ultra Launch Campaign",
      type: "banner",
      pricingModel: "cpm",
      status: "active",
      budgetTotal: 2000,
      budgetDaily: 100,
      spentTotal: 347.50,
      bidAmount: 2.50,
      startDate: "2024-01-15",
      endDate: "2027-12-31",
      priority: 10,
      frequencyCap: 3,
      targeting: JSON.stringify({ brands: ["samsung"], categories: ["flagship"], countries: ["US", "UK", "DE"] }),
    },
  });

  // Create ad creative
  const samsungPhoneId = phoneMap["samsung-galaxy-s24-ultra"];
  await prisma.adCreative.upsert({
    where: { id: "seed-creative-s24ultra" },
    update: { title: "Galaxy S24 Ultra — Redefine Possible", isActive: true, phoneId: samsungPhoneId || null },
    create: {
      id: "seed-creative-s24ultra",
      campaignId: campaign.id,
      title: "Galaxy S24 Ultra — Redefine Possible",
      description: "Experience the ultimate smartphone with 200MP camera, AI features, and titanium design. Starting at $1,299.",
      image: "/phones/samsung-galaxy-s24-ultra.svg",
      clickUrl: "https://samsung.com/galaxy-s24-ultra",
      phoneId: samsungPhoneId || null,
      isActive: true,
    },
  });

  // Seed some ad impressions and clicks for realistic metrics
  const homeHeroSlot = await prisma.adSlot.findUnique({ where: { slug: "home-hero" } });
  const phoneSidebarSlot = await prisma.adSlot.findUnique({ where: { slug: "phone-sidebar" } });

  if (homeHeroSlot) {
    // Create sample impressions
    for (let i = 0; i < 139; i++) {
      await prisma.adImpression.create({
        data: {
          campaignId: campaign.id,
          creativeId: "seed-creative-s24ultra",
          slotId: homeHeroSlot.id,
          userFingerprint: `user_${Math.floor(Math.random() * 50)}`,
          country: ["US", "UK", "DE"][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
    // Create sample clicks
    for (let i = 0; i < 12; i++) {
      await prisma.adClick.create({
        data: {
          campaignId: campaign.id,
          creativeId: "seed-creative-s24ultra",
          slotId: homeHeroSlot.id,
          userFingerprint: `user_${Math.floor(Math.random() * 50)}`,
          country: ["US", "UK", "DE"][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Admin Login:");
  console.log("   Email: admin@mobileplatform.com");
  console.log("   Password: Mp@dmin2024!Secure");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
