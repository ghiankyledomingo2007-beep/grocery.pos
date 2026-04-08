import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Created admin user:', admin.email)

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 'sm-supplier' },
      update: {},
      create: {
        id: 'sm-supplier',
        name: 'SM Supermarket',
        contactPerson: 'Juan Dela Cruz',
        phone: '0917-123-4567',
        email: 'sm@example.com'
      }
    }),
    prisma.supplier.upsert({
      where: { id: 'puregold-supplier' },
      update: {},
      create: {
        id: 'puregold-supplier',
        name: 'Puregold',
        contactPerson: 'Maria Santos',
        phone: '0918-234-5678',
        email: 'puregold@example.com'
      }
    })
  ])

  console.log('✅ Created suppliers')

  // Create products
  const products = [
    { barcode: '4800016644801', name: 'Lucky Me Pancit Canton', price: 15.00, cost: 12.00, stock: 100, category: 'Noodles' },
    { barcode: '4800024621015', name: 'Skyflakes Crackers', price: 25.00, cost: 20.00, stock: 80, category: 'Snacks' },
    { barcode: '4800888100016', name: 'Mang Tomas Lechon Sauce', price: 55.00, cost: 45.00, stock: 50, category: 'Condiments' },
    { barcode: '4800024620308', name: 'Fita Crackers', price: 28.00, cost: 22.00, stock: 75, category: 'Snacks' },
    { barcode: '4800016644818', name: 'Lucky Me Instant Mami', price: 18.00, cost: 14.00, stock: 90, category: 'Noodles' },
    { barcode: '4800024620315', name: 'Rebisco Crackers', price: 30.00, cost: 24.00, stock: 60, category: 'Snacks' },
    { barcode: '4800024620322', name: 'Hansel Crackers', price: 32.00, cost: 26.00, stock: 70, category: 'Snacks' },
    { barcode: '4800016644825', name: 'Lucky Me Beef Noodles', price: 20.00, cost: 16.00, stock: 85, category: 'Noodles' },
    { barcode: '4800024620339', name: 'Cream-O Cookies', price: 35.00, cost: 28.00, stock: 65, category: 'Snacks' },
    { barcode: '4800016644832', name: 'Lucky Me Chicken Noodles', price: 20.00, cost: 16.00, stock: 95, category: 'Noodles' }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: {
        ...product,
        supplierId: suppliers[Math.floor(Math.random() * suppliers.length)].id
      }
    })
  }

  console.log('✅ Created products')
  console.log('🎉 Production seeding completed!')
  console.log('')
  console.log('📝 Login credentials:')
  console.log('   Email: admin@store.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('⚠️  IMPORTANT: Change the admin password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
