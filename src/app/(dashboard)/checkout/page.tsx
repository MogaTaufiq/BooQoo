'use client';

// ============================================
// Checkout / POS Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Alert, SkeletonCard } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  totalStock: number;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalAmount,
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'E_WALLET'>('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        fetch('/api/products?limit=1000&isActive=true'),
        fetch('/api/inventory'),
      ]);

      const productsResult = await productsRes.json();
      const inventoryResult = await inventoryRes.json();

      if (productsResult.success) {
        setProducts(productsResult.data);
      }

      if (inventoryResult.success) {
        setInventory(inventoryResult.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductStock = (productId: string) => {
    const invItem = inventory.find(
      (item) => item.productId === productId
    );
    return invItem?.totalStock || 0;
  };

  const handleAddToCart = (product: Product, variant?: any) => {
    const stock = getProductStock(product.id);

    if (stock <= 0) {
      setError('Stok produk tidak tersedia');
      return;
    }

    addItem({
      productId: product.id,
      variantId: variant?.id,
      productName: product.name,
      variantName: variant?.name,
      sku: product.sku,
      price: variant?.price || product.price,
      unit: product.unit,
      maxStock: stock,
    });
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Keranjang masih kosong');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const totalAmount = getTotalAmount();
      const parsedAmountPaid = parseFloat(amountPaid || totalAmount.toString());

      if (parsedAmountPaid < totalAmount) {
        setError(`Pembayaran kurang. Total: Rp ${totalAmount.toLocaleString('id-ID')}`);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          amountPaid: parsedAmountPaid,
          customerName: customerName || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal memproses transaksi');
      }

      clearCart();
      router.push(`/transactions/${result.data.transactionId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = getTotalAmount();
  const parsedAmountPaid = parseFloat(amountPaid || '0');
  const changeAmount = parsedAmountPaid - totalAmount;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Kasir / POS</h2>
        <Button variant="outline" onClick={() => router.push('/transactions')}>
          Riwayat Transaksi
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Products List */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Produk tidak ditemukan</p>
              ) : (
                filteredProducts.map((product) => {
                  const stock = getProductStock(product.id);
                  const hasVariants = product.variants && product.variants.length > 0;

                  return (
                    <Card
                      key={product.id}
                      className={`p-3 ${stock <= 0 ? 'opacity-50' : 'cursor-pointer hover:shadow-md'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-600">
                            Stok: {stock} {product.unit}
                          </p>
                          <p className="text-lg font-bold text-primary mt-1">
                            Rp {product.price.toLocaleString('id-ID')}
                          </p>
                        </div>

                        {hasVariants ? (
                          <div className="ml-3 space-y-1">
                            {product.variants!.map((variant) => (
                              <Button
                                key={variant.id}
                                size="sm"
                                onClick={() => handleAddToCart(product, variant)}
                                disabled={stock <= 0}
                              >
                                + {variant.name}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={stock <= 0}
                          >
                            + Tambah
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Cart & Payment */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col p-4 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Keranjang</h3>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Keranjang kosong</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'default'}-${index}`}
                    className="bg-gray-50 p-3 rounded"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {item.productName}
                          {item.variantName && ` - ${item.variantName}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <>
                <div className="border-t pt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'CASH', label: 'Tunai' },
                        { value: 'TRANSFER', label: 'Transfer' },
                        { value: 'E_WALLET', label: 'E-Wallet' },
                      ].map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value as any)}
                          className={`py-2 px-3 rounded text-sm font-medium ${
                            paymentMethod === method.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Jumlah Dibayar"
                    type="number"
                    placeholder={totalAmount.toString()}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    min="0"
                    step="0.01"
                  />

                  <Input
                    label="Nama Customer (Opsional)"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />

                  <div className="bg-gray-100 p-3 rounded space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Item:</span>
                      <span className="font-semibold">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    {amountPaid && parsedAmountPaid >= totalAmount && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Kembalian:</span>
                        <span className="font-semibold">
                          Rp {changeAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearCart} disabled={isProcessing}>
                      Bersihkan
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      isLoading={isProcessing}
                      disabled={isProcessing || items.length === 0}
                      className="flex-1"
                    >
                      Bayar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
