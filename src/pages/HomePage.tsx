import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';
import { CircuitBoard, Zap, Cpu, Server, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsApi.getFeatured(),
          categoriesApi.getAll()
        ]);
        setFeaturedProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: this, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="pt-20 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/10">
        <div className="container px-4 mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
          >
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                variants={itemVariants}
              >
                Build the <span className="text-primary">Future</span> with IoT Technology
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground"
                variants={itemVariants}
              >
                Your one-stop shop for IoT components, kits, and custom project solutions.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4 pt-4"
                variants={itemVariants}
              >
                <Button size="lg" asChild>
                  <Link to="/products">
                    Shop Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/project-builder">
                    <CircuitBoard className="mr-2 h-5 w-5" />
                    Build Custom Project
                  </Link>
                </Button>
              </motion.div>
            </div>
            <motion.div
              variants={itemVariants}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50"
            >
              <AspectRatio ratio={16 / 9}>
                <img
                  src="https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="IoT Components"
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose IoTech?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're dedicated to providing high-quality IoT components and expert guidance to bring your projects to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Cpu className="h-10 w-10 text-primary" />,
                title: "Quality Components",
                description: "Our products are sourced from trusted manufacturers and thoroughly tested."
              },
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Fast Delivery",
                description: "Get your orders quickly with our expedited shipping options."
              },
              {
                icon: <Server className="h-10 w-10 text-primary" />,
                title: "Technical Support",
                description: "Our team of experts is always ready to assist with your technical questions."
              },
              {
                icon: <CircuitBoard className="h-10 w-10 text-primary" />,
                title: "Custom Projects",
                description: "Design and build your custom IoT projects with our innovative builder tool."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 border rounded-lg bg-card shadow-sm transition-all duration-300 hover:shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button variant="ghost" asChild>
              <Link to="/products" className="flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 p-1">
                    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
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
                      <CardContent className="pt-6">
                        <div className="mb-2 text-sm text-muted-foreground">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h3>
                        <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                        <div className="mt-4 font-bold text-xl">${product.price.toFixed(2)}</div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                          <Link to={`/products/${product.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button>Add to Cart</Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link 
                  to={`/products?category=${category.slug}`}
                  className="block h-full"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg bg-card border border-border/50 group">
                    <AspectRatio ratio={1}>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <h3 className="text-white font-medium text-lg">{category.name}</h3>
                      </div>
                    </AspectRatio>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Project Banner */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Build Your Custom IoT Project</h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              From home automation to environmental monitoring, bring your ideas to life with our custom project builder.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/project-builder">
                <CircuitBoard className="mr-2 h-5 w-5" />
                Start Building Now
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle id="pattern-circle" cx="10" cy="10" r="1" fill="currentColor"></circle>
            </pattern>
            <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
          </svg>
        </div>
      </section>
    </div>
  );
}