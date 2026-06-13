// Deterministic catalog generator (CommonJS) for seeding a large inventory.
// Mirrors client/src/lib/catalog.js so demo and seeded data stay consistent.

const CATEGORY_IMAGE = {
  Produce: 'photo-1542838132-92c53300491e',
  Dairy: 'photo-1628088062854-d1870b4553da',
  Bakery: 'photo-1509440159596-0249088772ff',
  Beverages: 'photo-1437418747212-8d9709afab22',
  Snacks: 'photo-1599490659213-e2b9527bd087',
  Household: 'photo-1583947215259-38e31be8751f',
  Frozen: 'photo-1561758033-d89a9ad46330',
  'Personal Care': 'photo-1556228578-8c89e6adf883',
};

const ITEMS = {
  Produce: [
    ['Red Apples', 0.79], ['Navel Oranges', 0.89], ['Roma Tomatoes', 1.19], ['Romaine Lettuce', 1.49],
    ['Carrots 1lb', 0.99], ['Baby Spinach', 2.49], ['Broccoli Crown', 1.79], ['Strawberries', 3.49],
    ['Seedless Grapes', 2.99], ['Cucumber', 0.69], ['Bell Peppers', 1.29], ['White Mushrooms', 2.19],
    ['Russet Potatoes 5lb', 3.99], ['Yellow Onions', 0.99], ['Lemons', 0.59], ['Limes', 0.49],
    ['Sweet Corn', 0.69], ['Zucchini', 1.09], ['Celery', 1.59], ['Blueberries', 4.29],
  ],
  Dairy: [
    ['Cheddar Cheese', 4.99], ['Salted Butter', 3.79], ['Large Eggs (dozen)', 2.99], ['Cream Cheese', 2.49],
    ['Mozzarella', 3.99], ['Sour Cream', 1.99], ['Cottage Cheese', 2.79], ['Almond Milk', 2.99],
    ['Oat Milk', 3.49], ['Parmesan Wedge', 5.49], ['String Cheese', 3.29], ['Heavy Cream', 2.69],
    ['Vanilla Yogurt', 1.29], ['Provolone Slices', 3.59],
  ],
  Bakery: [
    ['Plain Bagels (6)', 2.99], ['Butter Croissant', 1.49], ['French Baguette', 1.99], ['Blueberry Muffins', 3.49],
    ['Glazed Donuts (6)', 4.49], ['Whole Wheat Bread', 2.79], ['Ciabatta Roll', 0.99], ['Dinner Rolls (8)', 2.49],
    ['Cinnamon Buns', 3.99], ['Chocolate Chip Cookies', 3.29], ['Banana Bread', 4.19], ['Pita Bread', 1.89],
  ],
  Beverages: [
    ['Orange Juice 1L', 3.29], ['Apple Juice 1L', 2.79], ['Green Tea (20ct)', 3.49], ['Energy Drink', 2.49],
    ['Lemonade 1L', 1.99], ['Tonic Water', 1.29], ['Ginger Ale', 1.39], ['Coconut Water', 2.19],
    ['Iced Tea 1L', 1.79], ['Espresso Beans 1lb', 8.99], ['Cola 2L', 1.99], ['Root Beer 2L', 1.99],
    ['Kombucha', 3.49], ['Mineral Water 6pk', 4.49],
  ],
  Snacks: [
    ['Salted Pretzels', 2.49], ['Microwave Popcorn', 3.19], ['Trail Mix', 4.49], ['Granola Bars (8)', 3.79],
    ['Wheat Crackers', 2.99], ['Sandwich Cookies', 2.79], ['Tortilla Chips', 2.49], ['Mixed Nuts', 5.99],
    ['Rice Cakes', 1.99], ['Beef Jerky', 6.49], ['Fruit Snacks', 2.99], ['Cheese Crackers', 3.19],
    ['Potato Crisps', 2.29], ['Dried Mango', 4.99],
  ],
  Household: [
    ['Paper Towels (6)', 7.99], ['Trash Bags (40)', 6.49], ['Laundry Detergent', 9.99], ['Bleach 1gal', 3.49],
    ['Sponges (6)', 2.99], ['Aluminum Foil', 3.29], ['Dishwasher Pods', 8.49], ['Air Freshener', 3.99],
    ['Glass Cleaner', 3.19], ['Fabric Softener', 5.49], ['Toilet Paper (12)', 9.49], ['Paper Plates (50)', 4.29],
  ],
  Frozen: [
    ['Frozen Pizza', 5.49], ['Vanilla Ice Cream', 4.99], ['Frozen Mixed Veg', 2.49], ['Fish Fillets', 7.49],
    ['French Fries', 3.29], ['Frozen Waffles', 2.99], ['Chicken Dumplings', 5.99], ['Frozen Peas', 1.99],
    ['Frozen Lasagna', 6.49], ['Ice Cream Sandwiches', 4.49], ['Frozen Shrimp', 9.99], ['Veggie Burgers', 4.99],
  ],
  'Personal Care': [
    ['Toothpaste', 2.99], ['Body Wash', 4.49], ['Hand Soap', 2.49], ['Deodorant', 3.99],
    ['Conditioner 500ml', 5.49], ['Body Lotion', 4.79], ['Disposable Razors', 6.99], ['Sunscreen SPF50', 8.49],
    ['Lip Balm', 1.99], ['Cotton Swabs', 1.79], ['Mouthwash', 4.29], ['Hand Sanitizer', 2.99],
  ],
};

const SIZE_VARIANTS = ['Family Pack', 'Value Size', 'Mini'];

function pseudo(n) {
  const x = Math.sin(n * 99.13) * 10000;
  return x - Math.floor(x);
}

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60`;

function buildExtraProducts(count = 100) {
  const base = [];
  for (const [category, items] of Object.entries(ITEMS)) {
    for (const [name, price] of items) base.push({ category, name, price });
  }
  const pool = [...base];
  let v = 0;
  while (pool.length < count) {
    const src = base[pool.length % base.length];
    const variant = SIZE_VARIANTS[v % SIZE_VARIANTS.length];
    pool.push({ ...src, name: `${src.name} — ${variant}`, price: src.price * (variant === 'Mini' ? 0.6 : 1.8) });
    v += 1;
  }

  return pool.slice(0, count).map((p, i) => {
    const r = pseudo(i + 1);
    const r2 = pseudo(i + 50);
    const price = Math.round(p.price * 100) / 100;
    const lowStockThreshold = 8 + Math.floor(r2 * 12);
    const stock = r < 0.18 ? Math.floor(r2 * lowStockThreshold) : 20 + Math.floor(r * 90);
    return {
      sku: `PRD-${2001 + i}`,
      name: p.name,
      category: p.category,
      price,
      cost: Math.round(price * 0.55 * 100) / 100,
      stock,
      lowStockThreshold,
      image: img(CATEGORY_IMAGE[p.category]),
    };
  });
}

module.exports = { buildExtraProducts };
