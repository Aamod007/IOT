import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Minus, Plus, Star, ShoppingCart, Share2, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await productsApi.getById(id);
        setProduct(response.data);
        
        // Fetch related products by category
        const category = response.data.category;
        const allProducts = await productsApi.getAll();
        const related = allProducts.data
          .filter(p => p.category === category && p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load product details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    
    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };
  
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.stock) {
      toast({
        title: 'Maximum stock reached',
        description: `Only ${product.stock} units available.`,
      });
      setQuantity(product.stock);
      return;
    }
    setQuantity(value);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Button asChild>
          <Link to="/products">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 pt-28 pb-16">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          Home
        </Link>
        {' > '}
        <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
          Products
        </Link>
        {' > '}
        <Link 
          to={`/products?category=${product.category}`} 
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
        {' > '}
        <span className="text-foreground">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-background rounded-lg overflow-hidden border">
          <AspectRatio ratio={1}>
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-2">
              <Badge variant="secondary" className="mr-2">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Badge>
              {product.featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews?.length || 0} reviews)
              </span>
            </div>
            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          <Separator />
          
          {/* Stock Status */}
          <div>
            <p className="mb-2">
              <span className="text-muted-foreground">Availability: </span>
              <span className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </p>
            
            {product.compatibleWith && product.compatibleWith.length > 0 && (
              <p className="mb-2">
                <span className="text-muted-foreground">Compatible with: </span>
                {product.compatibleWith.join(', ')}
              </p>
            )}
          </div>
          
          {product.stock > 0 && (
            <>
              <Separator />
              
              {/* Quantity and Add to Cart */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3 mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button className="flex-1" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <Tabs defaultValue="specifications" className="mb-12">
        <TabsList className="w-full flex mb-6">
          <TabsTrigger value="specifications" className="flex-1">Specifications</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">Reviews ({product.reviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="shipping" className="flex-1">Shipping & Returns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="specifications" className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
          {product.specifications ? (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="py-2 border-b">
                  <dt className="text-sm text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted-foreground">No specifications available for this product.</p>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 mb-4 last:border-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.userName}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this product!</p>
              <Button>Write a Review</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shipping" className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping & Returns Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Shipping Policy</h3>
              <p className="text-muted-foreground">
                We offer free shipping on orders above $50. Standard shipping takes 3-5 business days.
                Express shipping (1-2 business days) is available for an additional fee.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Return Policy</h3>
              <p className="text-muted-foreground">
                We accept returns within 30 days of delivery. Items must be unused and in original packaging.
                Return shipping costs are the responsibility of the customer unless the item was defective or damaged.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Warranty</h3>
              <p className="text-muted-foreground">
                All products come with a standard 1-year manufacturer warranty against defects.
                Extended warranty options are available at checkout.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Related Products</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {relatedProducts.map((relatedProduct) => (
                <CarouselItem key={relatedProduct.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-1">
                  <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                    <Link to={`/products/${relatedProduct.id}`}>
                      <AspectRatio ratio={1}>
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${relatedProduct.id}`}>
                        <h3 className="font-medium line-clamp-1 hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                      </Link>
                      <p className="font-bold mt-2">${relatedProduct.price.toFixed(2)}</p>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      )}
    </div>
  );
}