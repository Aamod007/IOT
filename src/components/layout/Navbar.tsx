import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  X,
  CircuitBoard,
  Cpu,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const { authState, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navbarClasses = cn(
    'fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300',
    {
      'bg-background/80 backdrop-blur-md shadow-md': scrolled,
      'bg-transparent': !scrolled,
    }
  );

  const mobileMenuItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Custom Projects', path: '/project-builder' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={navbarClasses}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <CircuitBoard className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">IoTech</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-foreground hover:text-primary font-medium transition-colors">
                <span>Products</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-background border hidden group-hover:block">
                <Link to="/products?category=microcontrollers" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Microcontrollers
                </Link>
                <Link to="/products?category=sensors" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Sensors
                </Link>
                <Link to="/products?category=actuators" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Actuators
                </Link>
                <Link to="/products?category=displays" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Displays
                </Link>
                <Link to="/products" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  All Products
                </Link>
              </div>
            </div>
            <Link to="/project-builder" className="text-foreground hover:text-primary font-medium transition-colors">
              Custom Projects
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary font-medium transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Right Section - Search, Cart, User */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-64 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Shopping Cart */}
            <Link to="/cart" className="relative">
              <Button size="icon" variant="ghost">
                <ShoppingCart className="h-5 w-5" />
                {cart.totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {cart.totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account */}
            {authState.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(authState.user?.name || 'User')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders">Orders</Link>
                  </DropdownMenuItem>
                  {authState.user?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      <span className="font-bold">IoTech</span>
                    </div>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </div>

                  {/* Mobile Search */}
                  <div className="py-4">
                    <form onSubmit={handleSearch} className="flex">
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button type="submit" className="ml-2">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 py-4">
                    <ul className="space-y-4">
                      {mobileMenuItems.map((item, index) => (
                        <motion.li
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={item.path}
                            className="block py-2 text-foreground hover:text-primary font-medium transition-colors"
                          >
                            {item.name}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile Auth Links */}
                  <div className="pt-4 border-t">
                    {authState.isAuthenticated ? (
                      <div className="space-y-3">
                        <Link
                          to="/account"
                          className="flex items-center py-2 text-foreground hover:text-primary transition-colors"
                        >
                          <User className="mr-2 h-5 w-5" />
                          My Account
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={logout}
                        >
                          <LogOut className="mr-2 h-5 w-5" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Link to="/login">
                          <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                        <Link to="/register">
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}