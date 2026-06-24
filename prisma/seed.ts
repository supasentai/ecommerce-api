import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const demoPassword = 'Password123!';

const users = [
  {
    email: 'admin@example.com',
    name: 'Demo Admin',
    role: Role.ADMIN,
  },
  {
    email: 'user1@example.com',
    name: 'Demo User One',
    role: Role.USER,
  },
  {
    email: 'user2@example.com',
    name: 'Demo User Two',
    role: Role.USER,
  },
];

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Books', slug: 'books' },
  { name: 'Sports', slug: 'sports' },
];

const products = [
  {
    name: 'Wireless Mouse',
    slug: 'wireless-mouse',
    description: 'Ergonomic 2.4GHz wireless mouse.',
    price: 29.99,
    stock: 120,
    categorySlug: 'electronics',
  },
  {
    name: 'Mechanical Keyboard',
    slug: 'mechanical-keyboard',
    description: 'Compact keyboard with tactile switches.',
    price: 89.99,
    stock: 80,
    categorySlug: 'electronics',
  },
  {
    name: 'USB-C Hub',
    slug: 'usb-c-hub',
    description: 'Multi-port hub for laptops and tablets.',
    price: 45.5,
    stock: 65,
    categorySlug: 'electronics',
  },
  {
    name: 'Noise Cancelling Headphones',
    slug: 'noise-cancelling-headphones',
    description: 'Over-ear headphones with active noise cancellation.',
    price: 149.99,
    stock: 40,
    categorySlug: 'electronics',
  },
  {
    name: 'Classic T-Shirt',
    slug: 'classic-t-shirt',
    description: 'Soft cotton crew neck t-shirt.',
    price: 19.99,
    stock: 200,
    categorySlug: 'fashion',
  },
  {
    name: 'Denim Jacket',
    slug: 'denim-jacket',
    description: 'Everyday denim jacket with regular fit.',
    price: 59.99,
    stock: 75,
    categorySlug: 'fashion',
  },
  {
    name: 'Running Sneakers',
    slug: 'running-sneakers',
    description: 'Lightweight sneakers for daily runs.',
    price: 79.99,
    stock: 90,
    categorySlug: 'fashion',
  },
  {
    name: 'Canvas Backpack',
    slug: 'canvas-backpack',
    description: 'Durable backpack with laptop compartment.',
    price: 39.99,
    stock: 110,
    categorySlug: 'fashion',
  },
  {
    name: 'Ceramic Dinner Set',
    slug: 'ceramic-dinner-set',
    description: 'Sixteen-piece ceramic dinnerware set.',
    price: 69.99,
    stock: 45,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Stainless Steel Pan',
    slug: 'stainless-steel-pan',
    description: 'Non-stick stainless steel frying pan.',
    price: 34.99,
    stock: 85,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Coffee Grinder',
    slug: 'coffee-grinder',
    description: 'Adjustable burr grinder for fresh coffee.',
    price: 49.99,
    stock: 55,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Desk Organizer',
    slug: 'desk-organizer',
    description: 'Minimal organizer for home office desks.',
    price: 24.99,
    stock: 130,
    categorySlug: 'home-kitchen',
  },
  {
    name: 'Clean Code Handbook',
    slug: 'clean-code-handbook',
    description: 'Practical guide to writing maintainable code.',
    price: 32.99,
    stock: 60,
    categorySlug: 'books',
  },
  {
    name: 'System Design Basics',
    slug: 'system-design-basics',
    description: 'Introductory system design concepts for developers.',
    price: 41.99,
    stock: 50,
    categorySlug: 'books',
  },
  {
    name: 'JavaScript Patterns',
    slug: 'javascript-patterns',
    description: 'Reusable patterns for modern JavaScript applications.',
    price: 28.99,
    stock: 70,
    categorySlug: 'books',
  },
  {
    name: 'API Design Notes',
    slug: 'api-design-notes',
    description: 'Concise notes on designing practical REST APIs.',
    price: 22.99,
    stock: 95,
    categorySlug: 'books',
  },
  {
    name: 'Yoga Mat',
    slug: 'yoga-mat',
    description: 'Non-slip mat for yoga and stretching.',
    price: 25.99,
    stock: 140,
    categorySlug: 'sports',
  },
  {
    name: 'Adjustable Dumbbell',
    slug: 'adjustable-dumbbell',
    description: 'Space-saving dumbbell for strength training.',
    price: 119.99,
    stock: 35,
    categorySlug: 'sports',
  },
  {
    name: 'Cycling Bottle',
    slug: 'cycling-bottle',
    description: 'Leak-proof bottle for cycling and workouts.',
    price: 12.99,
    stock: 180,
    categorySlug: 'sports',
  },
  {
    name: 'Fitness Tracker',
    slug: 'fitness-tracker',
    description: 'Wearable tracker for steps, sleep, and workouts.',
    price: 64.99,
    stock: 70,
    categorySlug: 'sports',
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
      },
      create: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  const categoryBySlug = new Map<string, string>();

  for (const category of categories) {
    const storedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
      },
      create: category,
    });

    categoryBySlug.set(storedCategory.slug, storedCategory.id);
  }

  for (const product of products) {
    const categoryId = categoryBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for product ${product.slug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        isActive: true,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        isActive: true,
        categoryId,
      },
    });
  }

  console.log('Seed completed successfully');
  console.log('Demo password:', demoPassword);
  console.log('Admin:', users[0].email);
  console.log('Users:', users[1].email, users[2].email);
}

main()
  .catch((error) => {
    console.error('Seed failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
