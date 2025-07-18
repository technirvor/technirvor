const { MongoClient, ObjectId } = require("mongodb")
const mongoose = require("mongoose")
require("dotenv").config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/"
const DB_NAME = process.env.DB_NAME || "systemnull"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

async function seedDatabase() {
  let client
  try {
    // @ts-ignore
    client = await MongoClient.connect(MONGODB_URI)
    const db = client.db(DB_NAME)

    console.log(`Connected to MongoDB database: ${DB_NAME}`)

    // Drop existing collections
    await db.collection("users").deleteMany({})
    await db.collection("products").deleteMany({})
    await db.collection("orders").deleteMany({})
    await db.collection("districts").deleteMany({})
    await db.collection("categories").deleteMany({})
    console.log("Existing collections dropped.")

    // Seed Users
    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Regular User",
        email: "user@example.com",
        password: "user123",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const insertedUsers = await db.collection("users").insertMany(users)
    const adminUserId = insertedUsers.insertedIds[0]
    const regularUserId = insertedUsers.insertedIds[1]
    console.log("Users seeded.")

    // Seed Products
    const products = [
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "The latest iPhone with A17 Pro chip and titanium design.",
        price: 1499.99,
        originalPrice: 1599.99,
        category: "Mobile",
        brand: "Apple",
        stock: 50,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: true,
        rating: 4.8,
        reviews: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "Experience the power of AI with the new Galaxy S24 Ultra.",
        price: 1399.99,
        originalPrice: 1499.99,
        category: "Mobile",
        brand: "Samsung",
        stock: 75,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: true,
        rating: 4.7,
        reviews: 90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "MacBook Air M3",
        slug: "macbook-air-m3",
        description: "Supercharged by the M3 chip, incredibly thin and light.",
        price: 1199.0,
        originalPrice: 1299.0,
        category: "Laptop",
        brand: "Apple",
        stock: 30,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.9,
        reviews: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Dell XPS 15",
        slug: "dell-xps-15",
        description: "A powerful and elegant laptop for creators.",
        price: 1899.0,
        originalPrice: 1999.0,
        category: "Laptop",
        brand: "Dell",
        stock: 25,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: true,
        rating: 4.6,
        reviews: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        slug: "sony-wh-1000xm5",
        description: "Industry-leading noise canceling headphones.",
        price: 349.0,
        originalPrice: 399.0,
        category: "Audio",
        brand: "Sony",
        stock: 100,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.7,
        reviews: 150,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bose QuietComfort Earbuds II",
        slug: "bose-quietcomfort-earbuds-ii",
        description: "World-class noise cancellation and custom fit.",
        price: 279.0,
        originalPrice: 299.0,
        category: "Audio",
        brand: "Bose",
        stock: 80,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.5,
        reviews: 110,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Canon EOS R5",
        slug: "canon-eos-r5",
        description: "Revolutionary full-frame mirrorless camera.",
        price: 3899.0,
        originalPrice: 4099.0,
        category: "Camera",
        brand: "Canon",
        stock: 15,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: true,
        rating: 4.9,
        reviews: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "GoPro HERO12 Black",
        slug: "gopro-hero12-black",
        description: "Unbelievable image quality and even better HyperSmooth stabilization.",
        price: 399.99,
        originalPrice: 449.99,
        category: "Camera",
        brand: "GoPro",
        stock: 60,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.7,
        reviews: 70,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Apple Watch Series 9",
        slug: "apple-watch-series-9",
        description: "A magical way to interact with Apple Watch.",
        price: 399.0,
        originalPrice: 429.0,
        category: "Watch",
        brand: "Apple",
        stock: 90,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: true,
        rating: 4.8,
        reviews: 130,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Samsung Galaxy Watch 6",
        slug: "samsung-galaxy-watch-6",
        description: "Your everyday wellness companion.",
        price: 299.0,
        originalPrice: 329.0,
        category: "Watch",
        brand: "Samsung",
        stock: 70,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.6,
        reviews: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PlayStation 5 Slim",
        slug: "playstation-5-slim",
        description: "Play like never before. Slimmer console, same power.",
        price: 499.99,
        originalPrice: 549.99,
        category: "Gaming",
        brand: "Sony",
        stock: 40,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: true,
        rating: 4.9,
        reviews: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Xbox Series X",
        slug: "xbox-series-x",
        description: "The fastest, most powerful Xbox ever.",
        price: 499.99,
        originalPrice: 549.99,
        category: "Gaming",
        brand: "Microsoft",
        stock: 35,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.8,
        reviews: 180,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "iPad Air M2",
        slug: "ipad-air-m2",
        description: "Thin and light, with the M2 chip.",
        price: 599.0,
        originalPrice: 649.0,
        category: "Tablet",
        brand: "Apple",
        stock: 60,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.7,
        reviews: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Amazon Kindle Paperwhite",
        slug: "amazon-kindle-paperwhite",
        description: "Waterproof with a glare-free display.",
        price: 139.99,
        originalPrice: 149.99,
        category: "E-reader",
        brand: "Amazon",
        stock: 120,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.5,
        reviews: 210,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Logitech MX Master 3S",
        slug: "logitech-mx-master-3s",
        description: "An iconic mouse, remastered for ultimate performance.",
        price: 99.99,
        originalPrice: 109.99,
        category: "Accessories",
        brand: "Logitech",
        stock: 150,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.9,
        reviews: 250,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Anker PowerCore III Elite",
        slug: "anker-powercore-iii-elite",
        description: "High-capacity portable charger.",
        price: 79.99,
        originalPrice: 89.99,
        category: "Accessories",
        brand: "Anker",
        stock: 180,
        images: ["/placeholder.svg?height=300&width=300"],
        featured: false,
        rating: 4.7,
        reviews: 190,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const insertedProducts = await db.collection("products").insertMany(products)
    const productIds = Object.values(insertedProducts.insertedIds)
    console.log("Products seeded.")

    // Seed Districts
    const districts = [
      { name: "Dhaka", shippingCost: 60, createdAt: new Date(), updatedAt: new Date() },
      { name: "Chittagong", shippingCost: 100, createdAt: new Date(), updatedAt: new Date() },
      { name: "Khulna", shippingCost: 120, createdAt: new Date(), updatedAt: new Date() },
      { name: "Sylhet", shippingCost: 150, createdAt: new Date(), updatedAt: new Date() },
      { name: "Rajshahi", shippingCost: 110, createdAt: new Date(), updatedAt: new Date() },
      { name: "Barisal", shippingCost: 130, createdAt: new Date(), updatedAt: new Date() },
      { name: "Rangpur", shippingCost: 140, createdAt: new Date(), updatedAt: new Date() },
      { name: "Mymensingh", shippingCost: 90, createdAt: new Date(), updatedAt: new Date() },
    ]
    await db.collection("districts").insertMany(districts)
    console.log("Districts seeded.")

    // Seed Orders
    const orders = [
      {
        user: adminUserId,
        orderItems: [
          {
            product: productIds[0], // iPhone 15 Pro Max
            name: "iPhone 15 Pro Max",
            image: "/placeholder.svg?height=300&width=300",
            price: 1499.99,
            quantity: 1,
            slug: "iphone-15-pro-max",
          },
          {
            product: productIds[3], // Dell XPS 15
            name: "Dell XPS 15",
            image: "/placeholder.svg?height=300&width=300",
            price: 1899.0,
            quantity: 1,
            slug: "dell-xps-15",
          },
        ],
        shippingAddress: {
          fullName: "Admin User",
          address: "123 Admin St",
          city: "Dhaka",
          district: "Dhaka",
          postalCode: "1200",
          country: "Bangladesh",
        },
        paymentMethod: "Cash on Delivery",
        itemsPrice: 3398.99,
        shippingPrice: 60,
        totalPrice: 3458.99,
        isPaid: false,
        isDelivered: false,
        status: "pending",
        statusHistory: [{ status: "pending", date: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: regularUserId,
        orderItems: [
          {
            product: productIds[4], // Sony WH-1000XM5 Headphones
            name: "Sony WH-1000XM5 Headphones",
            image: "/placeholder.svg?height=300&width=300",
            price: 349.0,
            quantity: 2,
            slug: "sony-wh-1000xm5",
          },
        ],
        shippingAddress: {
          fullName: "Regular User",
          address: "456 User Ave",
          city: "Chittagong",
          district: "Chittagong",
          postalCode: "4000",
          country: "Bangladesh",
        },
        paymentMethod: "Stripe",
        paymentResult: {
          id: "pi_12345",
          status: "succeeded",
          update_time: new Date().toISOString(),
          email_address: "user@example.com",
        },
        itemsPrice: 698.0,
        shippingPrice: 100,
        totalPrice: 798.0,
        isPaid: true,
        paidAt: new Date(),
        isDelivered: false,
        status: "processing",
        statusHistory: [
          { status: "pending", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: "processing", date: new Date() },
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
      },
    ]
    await db.collection("orders").insertMany(orders)
    console.log("Orders seeded.")

    // Seed Categories
    const categories = [
      { name: "Mobile", slug: "mobile", createdAt: new Date(), updatedAt: new Date() },
      { name: "Laptop", slug: "laptop", createdAt: new Date(), updatedAt: new Date() },
      { name: "Audio", slug: "audio", createdAt: new Date(), updatedAt: new Date() },
      { name: "Camera", slug: "camera", createdAt: new Date(), updatedAt: new Date() },
      { name: "Watch", slug: "watch", createdAt: new Date(), updatedAt: new Date() },
      { name: "Gaming", slug: "gaming", createdAt: new Date(), updatedAt: new Date() },
      { name: "Tablet", slug: "tablet", createdAt: new Date(), updatedAt: new Date() },
      { name: "E-reader", slug: "e-reader", createdAt: new Date(), updatedAt: new Date() },
      { name: "Accessories", slug: "accessories", createdAt: new Date(), updatedAt: new Date() },
    ]

    await db.collection("categories").insertMany(categories)
    console.log("Categories seeded.")

    console.log("Database seeding complete!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("MongoDB connection closed.")
    }
    // Ensure the process exits after seeding
    process.exit(0)
  }
}

seedDatabase()
