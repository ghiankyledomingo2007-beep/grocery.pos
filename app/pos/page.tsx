'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import toast, { Toaster } from 'react-hot-toast'
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(() => import('../components/BarcodeScanner'), {
  ssr: false
})

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
  const [showScanner, setShowScanner] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const smallScreen = window.innerWidth < 768
      setIsMobile(mobile || touchDevice || smallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Redirect to login if not authenticated - TEMPORARILY DISABLED
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/login')
  //   }
  // }, [status, router])

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
      toast.success('Added +1')
    } else {
      if (product.stock === 0) {
        toast.error('Out of stock!')
        return
      }
      setCart([...cart, { ...product, quantity: 1 }])
      toast.success('Added to cart')
    }
    setSearch('')
    setProducts([])
    searchInputRef.current?.focus()
  }

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false)
    setSearch(barcode)
    
    // Search for product
    try {
      const res = await fetch(`/api/products/search?q=${barcode}`)
      const data = await res.json()
      
      if (data.length > 0) {
        addToCart(data[0])
      } else {
        toast.error('Product not found')
      }
    } catch {
      toast.error('Search failed')
    }
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

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.10
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const setQuickPayment = (amount: number) => {
    const current = parseFloat(paymentAmount) || 0
    setPaymentAmount((current + amount).toString())
  }

  const getChange = () => {
    const payment = parseFloat(paymentAmount) || 0
    return payment - getTotal()
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
          paymentMethod: 'Cash'
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

  // Show loading while checking auth - TEMPORARILY DISABLED
  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Don't render if not authenticated - TEMPORARILY DISABLED
  // if (!session) {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-sm text-gray-600">Cashier: {session?.user?.name || 'Guest'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Product Search */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isMobile ? "Search or scan..." : "Search products or enter barcode..."}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus={!isMobile}
                />
                {searching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {isMobile && (
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
                >
                  📷 Scan
                </button>
              )}
            </div>

            {products.length > 0 && (
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      index === 0 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-600">
                          Stock: {product.stock} {product.stock < 10 && <span className="text-red-600 font-semibold">⚠ Low</span>}
                        </p>
                      </div>
                      <p className="text-base font-bold text-blue-600">₱{product.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {search && !searching && products.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No products found for "{search}"
              </div>
            )}

            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">
                {isMobile 
                  ? '💡 Tip: Use 📷 Scan button to scan barcodes with your camera'
                  : '💡 Tips: Press Enter to add first result • F2 to checkout • ESC to clear'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Cart</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">Cart is empty</p>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">₱{item.price.toFixed(2)}</p>
                    </div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 text-sm border rounded text-center"
                      min="1"
                      max={item.stock}
                      inputMode="numeric"
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span>₱{getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Tax (10%):</span>
              <span>₱{getTax().toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">₱{getTotal().toFixed(2)}</span>
            </div>

            {/* Quick Payment Buttons */}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-600 mb-2">Quick Payment (click multiple times to add):</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setQuickPayment(20)}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded active:bg-gray-300"
                >
                  +₱20
                </button>
                <button
                  onClick={() => setQuickPayment(50)}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded active:bg-gray-300"
                >
                  +₱50
                </button>
                <button
                  onClick={() => setQuickPayment(100)}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded active:bg-gray-300"
                >
                  +₱100
                </button>
                <button
                  onClick={() => setQuickPayment(500)}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded active:bg-gray-300"
                >
                  +₱500
                </button>
                <button
                  onClick={() => setQuickPayment(1000)}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded active:bg-gray-300"
                >
                  +₱1000
                </button>
                <button
                  onClick={() => setPaymentAmount('')}
                  className="px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded active:bg-red-200"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Amount:
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={getTotal().toFixed(2)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                inputMode="decimal"
              />
            </div>

            {/* Change */}
            {paymentAmount && parseFloat(paymentAmount) >= getTotal() && (
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="flex justify-between text-base font-bold text-green-700">
                  <span>Change:</span>
                  <span>₱{getChange().toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full mt-2 bg-blue-600 text-white py-2.5 text-sm rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Complete Sale (F2)'}
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
