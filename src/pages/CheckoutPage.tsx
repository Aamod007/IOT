import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { 
  CreditCard, 
  Home, 
  Truck, 
  ShoppingBag,
  Check,
  CreditCardIcon
} from 'lucide-react';

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [saveInfo, setSaveInfo] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: authState.user?.name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [errors, setErrors] = useState<{
    shipping?: Partial<Record<keyof ShippingInfo, string>>;
    payment?: Partial<Record<keyof PaymentInfo, string>>;
  }>({});
  
  // Calculate order summary
  const subtotal = cart.totalPrice;
  const shipping = shippingMethod === 'express' ? 9.99 : (subtotal > 50 ? 0 : 5.99);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  const validateShippingInfo = () => {
    const newErrors: Partial<Record<keyof ShippingInfo, string>> = {};
    let isValid = true;
    
    Object.entries(shippingInfo).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof ShippingInfo] = 'This field is required';
        isValid = false;
      }
    });
    
    setErrors({ ...errors, shipping: newErrors });
    return isValid;
  };
  
  const validatePaymentInfo = () => {
    const newErrors: Partial<Record<keyof PaymentInfo, string>> = {};
    let isValid = true;
    
    if (!paymentInfo.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
      isValid = false;
    } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
      isValid = false;
    }
    
    if (!paymentInfo.cardHolder.trim()) {
      newErrors.cardHolder = 'Cardholder name is required';
      isValid = false;
    }
    
    if (!paymentInfo.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
      isValid = false;
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
      isValid = false;
    }
    
    if (!paymentInfo.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
      isValid = false;
    } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      newErrors.cvv = 'Invalid CVV';
      isValid = false;
    }
    
    setErrors({ ...errors, payment: newErrors });
    return isValid;
  };
  
  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value,
    });
  };
  
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: value,
    });
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && validateShippingInfo()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validatePaymentInfo()) {
      setCurrentStep(3);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handlePlaceOrder = () => {
    toast({
      title: 'Order Placed!',
      description: 'Your order has been successfully placed.',
    });
    
    // In a real app, we would send the order to the backend
    // For now, we'll just clear the cart and redirect to a success page
    clearCart();
    navigate('/order-success');
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Steps */}
        <div className="lg:col-span-2">
          <div className="flex items-center mb-8">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > 1 ? <Check className="h-5 w-5" /> : <Home className="h-5 w-5" />}
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              currentStep >= 2 ? 'bg-primary' : 'bg-muted'
            }`}></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > 2 ? <Check className="h-5 w-5" /> : <CreditCardIcon className="h-5 w-5" />}
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              currentStep >= 3 ? 'bg-primary' : 'bg-muted'
            }`}></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>
                  Enter your shipping details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.fullName ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.fullName && (
                      <p className="text-sm text-destructive">{errors.shipping.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.phone ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.phone && (
                      <p className="text-sm text-destructive">{errors.shipping.phone}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.address ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.address && (
                      <p className="text-sm text-destructive">{errors.shipping.address}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.city ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.city && (
                      <p className="text-sm text-destructive">{errors.shipping.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.state ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.state && (
                      <p className="text-sm text-destructive">{errors.shipping.state}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.zipCode ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.zipCode && (
                      <p className="text-sm text-destructive">{errors.shipping.zipCode}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingInfoChange}
                      className={errors.shipping?.country ? 'border-destructive' : ''}
                    />
                    {errors.shipping?.country && (
                      <p className="text-sm text-destructive">{errors.shipping.country}</p>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <Label>Shipping Method</Label>
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard-shipping" />
                      <Label htmlFor="standard-shipping" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Standard Shipping</span>
                        <span className="text-sm text-muted-foreground">
                          {subtotal > 50 ? 'Free' : '$5.99'} - Delivery in 3-5 business days
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="express-shipping" />
                      <Label htmlFor="express-shipping" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Express Shipping</span>
                        <span className="text-sm text-muted-foreground">
                          $9.99 - Delivery in 1-2 business days
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="save-info"
                    checked={saveInfo}
                    onCheckedChange={(checked) => setSaveInfo(!!checked)}
                  />
                  <label
                    htmlFor="save-info"
                    className="text-sm text-muted-foreground leading-none cursor-pointer"
                  >
                    Save this information for next time
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNextStep}>
                  Continue to Payment
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Enter your payment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="credit-card" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="credit-card" onClick={() => setPaymentMethod('credit-card')}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="paypal" onClick={() => setPaymentMethod('paypal')}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.028-2.598 4.81-6.037 4.81h-2.19c-1.47 0-2.713 1.068-2.944 2.524L8.282 21.4a.93.93 0 0 0 .908 1.108h4.207c.52 0 .962-.38 1.043-.896l.037-.227.813-5.15.052-.273a1.07 1.07 0 0 1 1.043-.896h.657c4.249 0 7.578-1.726 8.55-6.713.364-1.9.248-3.43-.97-4.542z" />
                      </svg>
                      PayPal
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="credit-card" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setPaymentInfo({
                            ...paymentInfo,
                            cardNumber: formatted,
                          });
                        }}
                        maxLength={19}
                        className={errors.payment?.cardNumber ? 'border-destructive' : ''}
                      />
                      {errors.payment?.cardNumber && (
                        <p className="text-sm text-destructive">{errors.payment.cardNumber}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Cardholder Name</Label>
                      <Input
                        id="cardHolder"
                        name="cardHolder"
                        placeholder="John Doe"
                        value={paymentInfo.cardHolder}
                        onChange={handlePaymentInfoChange}
                        className={errors.payment?.cardHolder ? 'border-destructive' : ''}
                      />
                      {errors.payment?.cardHolder && (
                        <p className="text-sm text-destructive">{errors.payment.cardHolder}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={paymentInfo.expiryDate}
                          onChange={handlePaymentInfoChange}
                          className={errors.payment?.expiryDate ? 'border-destructive' : ''}
                        />
                        {errors.payment?.expiryDate && (
                          <p className="text-sm text-destructive">{errors.payment.expiryDate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={handlePaymentInfoChange}
                          className={errors.payment?.cvv ? 'border-destructive' : ''}
                        />
                        {errors.payment?.cvv && (
                          <p className="text-sm text-destructive">{errors.payment.cvv}</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="paypal" className="text-center py-8">
                    <div className="mb-4">
                      <svg viewBox="0 0 24 24" className="h-10 w-10 mx-auto text-blue-500" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.028-2.598 4.81-6.037 4.81h-2.19c-1.47 0-2.713 1.068-2.944 2.524L8.282 21.4a.93.93 0 0 0 .908 1.108h4.207c.52 0 .962-.38 1.043-.896l.037-.227.813-5.15.052-.273a1.07 1.07 0 0 1 1.043-.896h.657c4.249 0 7.578-1.726 8.55-6.713.364-1.9.248-3.43-.97-4.542z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                    <Button size="lg">Continue with PayPal</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back to Shipping
                </Button>
                <Button onClick={handleNextStep}>
                  Review Order
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Order</CardTitle>
                <CardDescription>
                  Please review your order before completing your purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shipping Information Summary */}
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    Shipping Information
                  </h3>
                  <div className="mt-2 space-y-1 ml-7">
                    <p>{shippingInfo.fullName}</p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                    <p>{shippingInfo.country}</p>
                    <p>{shippingInfo.phone}</p>
                  </div>
                  <p className="mt-2 ml-7 flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {shippingMethod === 'express' ? 'Express Shipping (1-2 business days)' : 'Standard Shipping (3-5 business days)'}
                    </span>
                  </p>
                </div>
                
                <Separator />
                
                {/* Payment Information Summary */}
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </h3>
                  <div className="mt-2 ml-7">
                    {paymentMethod === 'credit-card' ? (
                      <div className="space-y-1">
                        <p>Credit Card</p>
                        <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                        <p>{paymentInfo.cardHolder}</p>
                        <p>Expires: {paymentInfo.expiryDate}</p>
                      </div>
                    ) : (
                      <p>PayPal</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Order Items Summary */}
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order Items
                  </h3>
                  <div className="mt-4 space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back to Payment
                </Button>
                <Button onClick={handlePlaceOrder}>
                  Place Order (${total.toFixed(2)})
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity} x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}