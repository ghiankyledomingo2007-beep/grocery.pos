import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, paymentMethod, paymentAmount } = body

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0
    )
    const tax = subtotal * 0.10
    const total = subtotal + tax
    const changeAmount = paymentAmount ? paymentAmount - total : 0

    // Generate sale number
    const saleNumber = `SALE-${Date.now()}`

    // Create sale with items in transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          subtotal,
          tax,
          total,
          paymentMethod,
          paymentAmount,
          changeAmount,
          cashierId: session.user.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: '', // Will be filled by trigger or separate query
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.unitPrice * item.quantity
            }))
          }
        },
        include: {
          items: true
        }
      })

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Update product names in sale items
      for (const saleItem of newSale.items) {
        const product = await tx.product.findUnique({
          where: { id: saleItem.productId }
        })
        if (product) {
          await tx.saleItem.update({
            where: { id: saleItem.id },
            data: { productName: product.name }
          })
        }
      }

      return newSale
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Sale creation error:', error)
    return NextResponse.json({ error: 'Sale creation failed' }, { status: 500 })
  }
}
