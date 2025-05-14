import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  X, 
  Minus, 
  Plus, 
  AlertCircle, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  
  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };
  
  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };
  
  const handleApplyPromo = () => {
    if (!promoCode) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    // In a real app, we would validate the promo code with the backend
    if (promoCode.toUpperCase() === 'IOT20') {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };
  
  // Calculate cart summary
  const subtotal = cart.totalPrice;
  const discount = promoApplied ? subtotal * 0.2 : 0; // 20% discount
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discount + shipping;
  
  return (
    <div className="container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {cart.items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild>
            <Link to="/products">
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-6 py-4 hidden sm:grid grid-cols-12 gap-4">
                <div className="col-span-7 font-medium">Product</div>
                <div className="col-span-2 font-medium">Quantity</div>
                <div className="col-span-2 font-medium text-right">Price</div>
                <div className="col-span-1"></div>
              </div>
              
              {cart.items.map((item) => (
                <div key={item.id} className="border-t first:border-t-0">
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Product */}
                    <div className="col-span-7 flex items-center space-x-4">
                      <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <Link 
                          to={`/products/${item.productId}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground sm:hidden mt-1">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              handleQuantityChange(item.id, val);
                            }
                          }}
                          className="w-12 h-8 text-center border-0 rounded-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-2 text-right font-medium hidden sm:block">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    {/* Remove */}
                    <div className="col-span-1 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" asChild>
                <Link to="/products">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (20%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  {/* Promo Code */}
                  <div className="pt-4">
                    <label htmlFor="promo" className="block text-sm mb-2">
                      Promo Code
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="promo"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                      />
                      <Button 
                        onClick={handleApplyPromo}
                        disabled={promoApplied}
                        variant={promoApplied ? "outline" : "default"}
                      >
                        {promoApplied ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                    
                    {promoError && (
                      <p className="text-sm text-destructive mt-2">{promoError}</p>
                    )}
                    
                    {promoApplied && (
                      <p className="text-sm text-green-600 mt-2">Promo code applied successfully!</p>
                    )}
                  </div>
                  
                  {/* Free Shipping Alert */}
                  {subtotal < 50 && (
                    <Alert variant="default" className="bg-primary/5 border-primary/20">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        Add ${(50 - subtotal).toFixed(2)} more to qualify for free shipping!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}