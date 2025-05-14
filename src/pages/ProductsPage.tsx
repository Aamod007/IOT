import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, SlidersHorizontal, X } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';

export default function ProductsPage() {
  const location = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  
  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);
  
  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsApi.getAll(),
          categoriesApi.getAll()
        ]);
        
        const fetchedProducts = productsResponse.data;
        setProducts(fetchedProducts);
        
        // Find min and max price
        if (fetchedProducts.length > 0) {
          const prices = fetchedProducts.map(p => p.price);
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setMinPrice(min);
          setMaxPrice(max);
          setPriceRange([min, max]);
        }
        
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(term) || 
          product.description.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Apply price filter
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategories, priceRange]);
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  // Handle adding to cart
  const handleAddToCart = (product: Product) => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange([minPrice, maxPrice]);
  };
  
  return (
    <div className="container px-4 mx-auto pt-24 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Mobile Filters */}
        <div className="w-full md:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Search</h3>
                    <div className="relative">
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-8"
                      />
                      {searchTerm && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`mobile-category-${category.id}`}
                            checked={selectedCategories.includes(category.slug)}
                            onCheckedChange={() => handleCategoryChange(category.slug)}
                          />
                          <label
                            htmlFor={`mobile-category-${category.id}`}
                            className="ml-2 text-sm"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <div className="pt-4 px-2">
                      <Slider
                        defaultValue={[minPrice, maxPrice]}
                        value={priceRange}
                        max={maxPrice}
                        min={minPrice}
                        step={1}
                        onValueChange={handlePriceChange}
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 sticky top-24 space-y-6">
          <h2 className="text-xl font-semibold">Filters</h2>
          
          {/* Search */}
          <div>
            <h3 className="text-sm font-medium mb-2">Search</h3>
            <div className="relative">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              <Search className="h-4 w-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <Separator />
          
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.slug)}
                    onCheckedChange={() => handleCategoryChange(category.slug)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="ml-2 text-sm"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <div className="pt-4 px-2">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                value={priceRange}
                max={maxPrice}
                min={minPrice}
                step={1}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between mt-2 text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
        
        {/* Product Grid */}
        <div className="w-full md:flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold hidden md:block">Products</h1>
            <div className="flex items-center space-x-2">
              {/* Active filters */}
              <div className="flex items-center flex-wrap gap-2">
                {selectedCategories.map(category => {
                  const categoryObj = categories.find(c => c.slug === category);
                  return (
                    <Badge 
                      key={category} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {categoryObj?.name || category}
                      <button onClick={() => handleCategoryChange(category)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                  <Badge 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    ${priceRange[0]} - ${priceRange[1]}
                    <button onClick={() => setPriceRange([minPrice, maxPrice])}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {searchTerm && (
                  <Badge 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {isLoading ? (
            // Loading state
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty state
            <div className="py-12 text-center">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search criteria.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            // Products grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg">
                  <div className="relative">
                    <AspectRatio ratio={4 / 3}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                    {product.featured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="pt-6 flex-grow">
                    <div className="mb-2 text-sm text-muted-foreground">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="mt-4 font-bold text-xl">${product.price.toFixed(2)}</div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      asChild
                    >
                      <a href={`/products/${product.id}`}>Details</a>
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}