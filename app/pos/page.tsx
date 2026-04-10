'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import toast, { Toaster } from 'react-hot-toast'

interface Product {
  id: string
  barcode: string
  name: string
  price: number
  stock: number
}

interface CartItem extends Product {
  quantity: number
}

export default function POSPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Debounced search function
  const searchProducts = useCallback(async (query: string) => {
    if (!query) {
      setProducts([])
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/products/search?q=${query}`)
      const data = await res.json()
      setProducts(data)
    } catch {
      console.error('Search error')
    } finally {
      setSearching(false)
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Debounced search with barcode detection
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (search.length === 0) {
      setProducts([])
      return
    }

    // Auto-detect barcode (13 digits)
    if (/^\d{13}$/.test(search)) {
      searchProducts(search)
      return
    }

    // Debounce regular search
    debounceTimer.current = setTimeout(() => {
      searchProducts(search)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [search, searchProducts])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F2 = Checkout
      if (e.key === 'F2') {
        e.preventDefault()
        if (cart.length > 0) {
          handleCheckout()
        }
      }
      // ESC = Clear search
      if (e.key === 'Escape') {
        setSearch('')
        setProducts([])
        searchInputRef.current?.focus()
      }
      // Enter = Add first product
      if (e.key === 'Enter' && products.length > 0 && search) {
        e.preventDefault()
        addToCart(products[0])
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart, products, search])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!session) {
    return null
  }

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Not enough stock!')
        return
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      if (product.stock === 0) {
        toast.error('Out of stock!')
        return
      }
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast.success('Added to cart')
    setSearch('')
    setProducts([])
    searchInputRef.current?.focus()
  }

  const removeFromCart = (id: string) => {
    if (confirm('Remove this item from cart?')) {
      setCart(cart.filter(item => item.id !== id))
      toast.success('Item removed')
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.find(i => i.id === id)
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock} in stock!`)
      return
    }
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ))
    }
  }

  const setQuickPayment = (amount: number) => {
    setPaymentAmount(amount.toString())
  }

  const getChange = () => {
    const payment = parseFloat(paymentAmount) || 0
    return Math.max(0, payment - getTotal())
  }

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.10
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          paymentMethod: 'Cash',
          paymentAmount: parseFloat(paymentAmount) || getTotal()
        })
      })

      if (res.ok) {
        toast.success('Sale completed successfully!')
        setCart([])
        setPaymentAmount('')
        searchInputRef.current?.focus()
      } else {
        toast.error('Checkout failed')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (cart.length > 0) {
      if (!confirm('You have items in cart. Logout anyway?')) {
        return
      }
    }
    setCart([])
    signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-sm text-gray-600">Cashier: {session?.user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Product Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="relative">
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products (Enter to add first result, ESC to clear)..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              {searching && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {products.length > 0 && (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`w-full p-4 rounded-lg text-left transition-colors ${
                      index === 0 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          Stock: {product.stock} {product.stock < 10 && <span className="text-red-600 font-semibold">⚠ Low</span>}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">₱{product.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {search && !searching && products.length === 0 && (
              <div className="mt-4 text-center py-8 text-gray-500">
                No products found for "{search}"
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">
                💡 Tips: Press Enter to add first result • F2 to checkout • ESC to clear
              </p>
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">₱{item.price.toFixed(2)}</p>
                    </div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded text-center"
                      min="1"
                      max={item.stock}
                      inputMode="numeric"
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>₱{getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (10%):</span>
              <span>₱{getTax().toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">₱{getTotal().toFixed(2)}</span>
            </div>

            {/* Quick Payment Buttons */}
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600 mb-2">Quick Payment:</p>
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setQuickPayment(amount)}
                    className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    ₱{amount}
                  </button>
                ))}
                <button
                  onClick={() => setQuickPayment(Math.ceil(getTotal() / 100) * 100)}
                  className="px-3 py-2 text-sm font-medium bg-blue-100 hover:bg-blue-200 rounded"
                >
                  Exact+
                </button>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount:
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={getTotal().toFixed(2)}
                className="w-full px-3 py-2 border rounded-lg"
                inputMode="decimal"
              />
            </div>

            {/* Change */}
            {paymentAmount && parseFloat(paymentAmount) >= getTotal() && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex justify-between text-lg font-bold text-green-700">
                  <span>Change:</span>
                  <span>₱{getChange().toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Complete Sale (F2)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
