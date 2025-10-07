import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("[v0] Starting database initialization...")

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Starters" },
      update: {},
      create: { name: "Starters", icon: "🥗", order: 1 },
    }),
    prisma.category.upsert({
      where: { name: "Main Course" },
      update: {},
      create: { name: "Main Course", icon: "🍛", order: 2 },
    }),
    prisma.category.upsert({
      where: { name: "Breads" },
      update: {},
      create: { name: "Breads", icon: "🫓", order: 3 },
    }),
    prisma.category.upsert({
      where: { name: "Rice & Biryani" },
      update: {},
      create: { name: "Rice & Biryani", icon: "🍚", order: 4 },
    }),
    prisma.category.upsert({
      where: { name: "Desserts" },
      update: {},
      create: { name: "Desserts", icon: "🍰", order: 5 },
    }),
    prisma.category.upsert({
      where: { name: "Beverages" },
      update: {},
      create: { name: "Beverages", icon: "🥤", order: 6 },
    }),
  ])

  console.log("[v0] Categories created:", categories.length)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { phone: "+1234567890" },
    update: {},
    create: {
      phone: "+1234567890",
      password: "admin123", // In production, this should be hashed
      name: "Admin User",
      email: "admin@fooddelivery.com",
      role: "ADMIN",
    },
  })

  console.log("[v0] Admin user created:", adminUser.phone)

  // Create sample restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Spice Garden",
      description: "Authentic Indian cuisine with a modern twist",
      image: "/indian-restaurant-exterior.jpg",
      coverImage: "/indian-food-spread.jpg",
      rating: 4.5,
      totalRatings: 1250,
      deliveryTime: "30-40 mins",
      costForTwo: 4000, // $40
      cuisines: "Indian, North Indian, Tandoor",
      address: "123 Main St, Downtown",
    },
  })

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Pizza Paradise",
      description: "Wood-fired pizzas and Italian classics",
      image: "/bustling-pizza-restaurant.png",
      coverImage: "/italian-pizza.png",
      rating: 4.3,
      totalRatings: 890,
      deliveryTime: "25-35 mins",
      costForTwo: 3500, // $35
      cuisines: "Italian, Pizza, Pasta",
      address: "456 Oak Ave, Midtown",
    },
  })

  const restaurant3 = await prisma.restaurant.create({
    data: {
      name: "Burger Hub",
      description: "Gourmet burgers and loaded fries",
      image: "/burger-restaurant.png",
      coverImage: "/gourmet-burgers.png",
      rating: 4.6,
      totalRatings: 2100,
      deliveryTime: "20-30 mins",
      costForTwo: 2500, // $25
      cuisines: "American, Burgers, Fast Food",
      address: "789 Elm St, Uptown",
    },
  })

  console.log("[v0] Restaurants created:", 3)

  // Create menu items for Spice Garden
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant1.id,
        categoryId: categories[0].id, // Starters
        name: "Paneer Tikka",
        description: "Cottage cheese marinated in spices and grilled",
        price: 899,
        image: "/paneer-tikka.png",
        isVeg: true,
        isPopular: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: categories[0].id,
        name: "Chicken 65",
        description: "Spicy fried chicken with curry leaves",
        price: 999,
        image: "/chicken-65.png",
        isVeg: false,
        isPopular: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: categories[1].id, // Main Course
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with tender chicken",
        price: 1299,
        image: "/butter-chicken.png",
        isVeg: false,
        isPopular: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: categories[1].id,
        name: "Palak Paneer",
        description: "Cottage cheese in spinach gravy",
        price: 1099,
        image: "/palak-paneer.png",
        isVeg: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: categories[2].id, // Breads
        name: "Garlic Naan",
        description: "Soft flatbread with garlic and butter",
        price: 399,
        image: "/garlic-naan.png",
        isVeg: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: categories[3].id, // Rice & Biryani
        name: "Chicken Biryani",
        description: "Fragrant basmati rice with spiced chicken",
        price: 1499,
        image: "/flavorful-chicken-biryani.png",
        isVeg: false,
        isPopular: true,
      },
    ],
  })

  // Create menu items for Pizza Paradise
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant2.id,
        categoryId: categories[0].id,
        name: "Bruschetta",
        description: "Toasted bread with tomatoes and basil",
        price: 699,
        image: "/classic-bruschetta.png",
        isVeg: true,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: categories[1].id,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato, mozzarella, and basil",
        price: 1199,
        image: "/margherita-pizza.png",
        isVeg: true,
        isPopular: true,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: categories[1].id,
        name: "Pepperoni Pizza",
        description: "Loaded with pepperoni and cheese",
        price: 1399,
        image: "/pepperoni-pizza.png",
        isVeg: false,
        isPopular: true,
      },
    ],
  })

  // Create menu items for Burger Hub
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant3.id,
        categoryId: categories[1].id,
        name: "Classic Beef Burger",
        description: "Juicy beef patty with lettuce, tomato, and special sauce",
        price: 899,
        image: "/beef-burger.png",
        isVeg: false,
        isPopular: true,
      },
      {
        restaurantId: restaurant3.id,
        categoryId: categories[1].id,
        name: "Veggie Burger",
        description: "Plant-based patty with fresh vegetables",
        price: 799,
        image: "/veggie-burger.png",
        isVeg: true,
      },
      {
        restaurantId: restaurant3.id,
        categoryId: categories[0].id,
        name: "Loaded Fries",
        description: "Crispy fries with cheese, bacon, and jalapeños",
        price: 599,
        image: "/loaded-fries.png",
        isVeg: false,
        isPopular: true,
      },
    ],
  })

  console.log("[v0] Menu items created")
  console.log("[v0] Database initialization complete!")
}

main()
  .catch((e) => {
    console.error("[v0] Error during database initialization:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
