// src/data/mock-articles.ts

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: 'news' | 'review' | 'comparison' | 'guide';
  author: { name: string; avatar: string };
  publishedAt: string;
  readTime: number;
  tags: string[];
  relatedPhoneSlugs?: string[];
}

export const articles: Article[] = [
  {
    id: 'a1',
    slug: 'samsung-galaxy-s25-ultra-review',
    title: 'Samsung Galaxy S25 Ultra Review: The Ultimate Flagship',
    excerpt: 'Samsung\'s latest flagship brings a new Snapdragon 8 Elite chip, improved cameras, and AI features that redefine what a smartphone can do.',
    content: `The Samsung Galaxy S25 Ultra represents the pinnacle of Samsung's smartphone engineering. With the Snapdragon 8 Elite processor, 12GB of RAM, and up to 1TB of storage, this device is a powerhouse.

**Design & Build**
The S25 Ultra features a titanium frame and Corning Gorilla Armor 2 protection. At 218g, it's surprisingly manageable for a 6.9-inch device. The flat display edges make it more comfortable to hold.

**Display**
The 6.9-inch Dynamic AMOLED 2X display with 120Hz refresh rate and 3120x1440 resolution delivers stunning visuals. Peak brightness reaches 2600 nits, making it easily readable in direct sunlight.

**Camera System**
The quad-camera setup includes a 200MP main sensor, 50MP ultrawide, 10MP 3x telephoto, and 50MP 5x periscope telephoto. Night mode performance is exceptional, and the new AI-enhanced processing delivers natural-looking photos.

**Battery & Charging**
The 5000mAh battery comfortably lasts a full day. 45W wired charging and 15W wireless charging keep you powered up. Samsung has also improved standby battery life significantly.

**Software**
One UI 7 based on Android 15 introduces Galaxy AI features including Circle to Search, Live Translate, and AI-powered photo editing tools.

**Verdict**
The Galaxy S25 Ultra is the best Android phone you can buy in 2025. It excels in every category and the AI features add genuine utility.`,
    coverImage: 'https://placehold.co/800x400/0d1117/e0e0e0?text=Galaxy+S25+Ultra+Review',
    category: 'review',
    author: { name: 'Ahmed Hassan', avatar: '' },
    publishedAt: '2025-02-15',
    readTime: 8,
    tags: ['Samsung', 'Flagship', 'Review', 'Galaxy S25'],
    relatedPhoneSlugs: ['samsung-galaxy-s25-ultra'],
  },
  {
    id: 'a2',
    slug: 'best-budget-phones-2026',
    title: 'Top 5 Best Budget Phones Under $200 in 2026',
    excerpt: 'Looking for great value? These budget smartphones offer impressive specs without breaking the bank.',
    content: `Finding a great phone doesn't mean spending a fortune. Here are the top 5 budget phones that offer excellent value in 2026.

**1. Honor X8d - $149**
The Honor X8d leads our list with its incredible 7000mAh battery, 108MP camera, and 256GB storage. The 6.77-inch IPS LCD display is sharp and bright.

**2. Realme 12 Pro - $179**
Realme continues to impress with the 12 Pro. The 108MP main camera captures stunning photos, and the AMOLED display delivers vibrant colors.

**3. Xiaomi Redmi Note 14 - $169**
Xiaomi's Redmi Note 14 offers a balanced package with a 120Hz AMOLED display, Snapdragon 4 Gen 2, and versatile triple camera system.

**4. Samsung Galaxy A16 - $199**
Samsung's Galaxy A16 brings the One UI experience to a lower price point with guaranteed 6 years of updates, water resistance, and a solid camera.

**5. OPPO A3 - $159**
The OPPO A3 stands out with its fast 45W charging, colorful design, and reliable performance for daily tasks.

**Conclusion**
Budget phones have never been better. Any of these five devices will serve you well for everyday use, with standout features that rival mid-range phones from just a year or two ago.`,
    coverImage: 'https://placehold.co/800x400/1a1a2e/e0e0e0?text=Best+Budget+Phones+2026',
    category: 'guide',
    author: { name: 'Sarah Chen', avatar: '' },
    publishedAt: '2026-03-20',
    readTime: 6,
    tags: ['Budget', 'Guide', 'Honor', 'Realme', 'Xiaomi'],
    relatedPhoneSlugs: ['honor-x8d', 'realme-12-pro'],
  },
  {
    id: 'a3',
    slug: 'iphone-16-vs-galaxy-s25-comparison',
    title: 'iPhone 16 Pro Max vs Galaxy S25 Ultra: Which Flagship Wins?',
    excerpt: 'We pit Apple\'s finest against Samsung\'s best in the ultimate flagship showdown of 2025.',
    content: `Two titans of the smartphone world go head to head. Let's break down how the iPhone 16 Pro Max and Galaxy S25 Ultra compare.

**Design**
Both phones feature premium materials — titanium frames and flat displays. The S25 Ultra is slightly larger at 6.9" vs 6.9" but the iPhone has a more compact form factor due to smaller bezels.

**Performance**
The A18 Pro and Snapdragon 8 Elite are both incredibly powerful. In benchmarks, they trade blows — Apple leads in single-core, Samsung in multi-core and GPU.

**Camera**
Samsung wins on paper with a 200MP main sensor vs Apple's 48MP. However, Apple's computational photography often produces more natural-looking images. Samsung excels in zoom with the 5x periscope lens.

**Battery**
The S25 Ultra's 5000mAh battery vs iPhone's 4685mAh gives Samsung the edge. Both phones easily last a full day, but the S25 Ultra can stretch to a day and a half.

**Software**
iOS 18 vs One UI 7 — this is largely personal preference. Both now feature AI capabilities. Apple's integration is typically smoother, while Samsung offers more customization.

**Price**
iPhone 16 Pro Max starts at $1,199 while the Galaxy S25 Ultra starts at $1,299. Both are premium investments.

**Verdict**
If you value camera versatility and battery life, go Samsung. If you prefer ecosystem integration and consistent software updates, Apple is your pick.`,
    coverImage: 'https://placehold.co/800x400/2d2d44/e0e0e0?text=iPhone+vs+Galaxy',
    category: 'comparison',
    author: { name: 'Mike Johnson', avatar: '' },
    publishedAt: '2025-03-10',
    readTime: 10,
    tags: ['Comparison', 'iPhone', 'Samsung', 'Flagship'],
    relatedPhoneSlugs: ['iphone-16-pro-max', 'samsung-galaxy-s25-ultra'],
  },
  {
    id: 'a4',
    slug: 'xiaomi-15-ultra-launch',
    title: 'Xiaomi 15 Ultra Launches with Leica Cameras and 6000mAh Battery',
    excerpt: 'Xiaomi\'s most powerful phone ever packs a 1-inch camera sensor, Snapdragon 8 Elite, and breakthrough battery tech.',
    content: `Xiaomi has officially launched the Xiaomi 15 Ultra, its most ambitious smartphone to date.

**Key Highlights:**
- 50MP 1-inch main sensor co-engineered with Leica
- Snapdragon 8 Elite processor with 16GB RAM
- 6000mAh silicon-carbon battery with 90W wired charging
- 6.73-inch 2K LTPO AMOLED display with 120Hz
- IP68 water and dust resistance

**Camera Excellence**
The Leica partnership continues to bear fruit. The 1-inch main sensor captures 50MP photos with exceptional detail and dynamic range. The 50MP ultrawide and 50MP 5x periscope telephoto complete a versatile camera system.

**Performance**
With 16GB of RAM and the Snapdragon 8 Elite, the Xiaomi 15 Ultra handles anything you throw at it. The new vapor chamber cooling system keeps temperatures in check during extended gaming.

**Battery Innovation**
The 6000mAh silicon-carbon battery is a major upgrade. Combined with 90W wired and 50W wireless charging, you'll rarely find yourself without power.

**Price & Availability**
Starting at $999, the Xiaomi 15 Ultra undercuts its competitors while offering comparable or superior specs. Available globally from March 2026.`,
    coverImage: 'https://placehold.co/800x400/ff6600/ffffff?text=Xiaomi+15+Ultra',
    category: 'news',
    author: { name: 'Li Wei', avatar: '' },
    publishedAt: '2026-03-01',
    readTime: 5,
    tags: ['Xiaomi', 'Launch', 'News', 'Flagship'],
    relatedPhoneSlugs: ['xiaomi-14-ultra'],
  },
  {
    id: 'a5',
    slug: 'how-to-choose-right-phone',
    title: 'How to Choose the Right Phone: A Complete Buyer\'s Guide',
    excerpt: 'Confused about which phone to buy? Our comprehensive guide helps you understand what specs matter most for your needs.',
    content: `Choosing a new smartphone can be overwhelming. Here's everything you need to know to make the right decision.

**1. Set Your Budget**
Phones range from $100 to $1,500+. Determine what you can spend before you start looking. Great phones exist at every price point.

**2. Display Size & Type**
- 6.1-6.4": Compact and easy to use one-handed
- 6.5-6.7": The sweet spot for most users
- 6.7"+: Best for media consumption and productivity
- AMOLED: Better colors and contrast, always-on display
- LCD: More affordable, good brightness

**3. Camera Priority**
If photography matters to you, look for:
- High megapixel main camera (48MP+)
- Optical Image Stabilization (OIS)
- Ultrawide lens for landscape shots
- Telephoto lens for zoom photography

**4. Battery Life**
- 4000-4500mAh: Standard, lasts a day with moderate use
- 5000mAh+: Heavy users and travelers
- 6000mAh+: Multi-day battery kings
- Fast charging (45W+) is a must-have in 2026

**5. Performance**
For most users, a mid-range Snapdragon 7-series or Dimensity 8-series chip is more than enough. Gamers and power users should aim for flagship chips.

**6. Software Updates**
Samsung and Google offer the longest update commitments (7 years). Apple supports iPhones for 6+ years. Check update policies before buying.

**7. Storage**
128GB is the minimum in 2026. If you take lots of photos/videos, consider 256GB. Check if the phone has a microSD card slot for expansion.

**Our Recommendation**
Don't chase the highest specs. Focus on what matters most to you — camera quality, battery life, display quality, or software experience — and optimize for that.`,
    coverImage: 'https://placehold.co/800x400/4a90d9/ffffff?text=Buyer+Guide',
    category: 'guide',
    author: { name: 'Ahmed Hassan', avatar: '' },
    publishedAt: '2026-04-01',
    readTime: 12,
    tags: ['Guide', 'Buying Guide', 'Tips'],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getLatestArticles(count: number): Article[] {
  return [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

export function getArticlesByCategory(category: Article['category']): Article[] {
  return articles.filter((a) => a.category === category);
}
