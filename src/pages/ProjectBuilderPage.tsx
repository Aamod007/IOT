import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { productsApi, projectsApi } from '@/lib/api';
import { Product, ProjectComponent, ProjectRequirements, CustomProject } from '@/lib/types';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CircuitBoard, 
  PlusCircle, 
  MinusCircle, 
  Cpu, 
  Gauge, 
  Power, 
  Terminal, 
  Monitor, 
  HardDrive,
  ArrowRight,
  ArrowLeft,
  Check,
  FileDown,
  XCircle,
  Zap,
  Lightbulb,
  Wifi
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Component categories
const COMPONENT_CATEGORIES = [
  { id: 'microcontrollers', name: 'Microcontrollers', icon: <Cpu className="h-5 w-5" /> },
  { id: 'sensors', name: 'Sensors', icon: <Gauge className="h-5 w-5" /> },
  { id: 'actuators', name: 'Actuators', icon: <Zap className="h-5 w-5" /> },
  { id: 'displays', name: 'Displays', icon: <Monitor className="h-5 w-5" /> },
  { id: 'power', name: 'Power Supplies', icon: <Power className="h-5 w-5" /> },
  { id: 'connectivity', name: 'Connectivity', icon: <Wifi className="h-5 w-5" /> },
  { id: 'misc', name: 'Miscellaneous', icon: <HardDrive className="h-5 w-5" /> }
];

export default function ProjectBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('microcontrollers');
  
  // Project state
  const [projectComponents, setProjectComponents] = useState<ProjectComponent[]>([]);
  const [projectRequirements, setProjectRequirements] = useState<ProjectRequirements>({
    title: '',
    objective: '',
    environment: 'indoor',
    powerSource: 'usb',
    sizeConstraints: '',
    additionalRequirements: ''
  });
  
  // Blueprint state
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load components. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);
  
  // Filter products by category
  const filteredProducts = products.filter(product => product.category === selectedCategory);
  
  // Calculate total price
  const totalPrice = projectComponents.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Handle adding component to project
  const handleAddComponent = (product: Product) => {
    const existingComponentIndex = projectComponents.findIndex(
      item => item.id === product.id
    );
    
    if (existingComponentIndex !== -1) {
      // If component already exists, increment quantity
      const updatedComponents = [...projectComponents];
      updatedComponents[existingComponentIndex] = {
        ...updatedComponents[existingComponentIndex],
        quantity: updatedComponents[existingComponentIndex].quantity + 1
      };
      setProjectComponents(updatedComponents);
    } else {
      // Add new component
      const newComponent: ProjectComponent = {
        id: product.id,
        name: product.name,
        type: product.category as 'sensor' | 'microcontroller' | 'actuator' | 'display' | 'power' | 'misc',
        price: product.price,
        image: product.image,
        quantity: 1
      };
      setProjectComponents([...projectComponents, newComponent]);
    }
    
    toast({
      title: 'Component Added',
      description: `${product.name} has been added to your project.`,
    });
  };
  
  // Handle removing component from project
  const handleRemoveComponent = (componentId: string) => {
    const updatedComponents = projectComponents.filter(item => item.id !== componentId);
    setProjectComponents(updatedComponents);
  };
  
  // Handle updating component quantity
  const handleUpdateQuantity = (componentId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedComponents = projectComponents.map(item => {
      if (item.id === componentId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    setProjectComponents(updatedComponents);
  };
  
  // Handle requirements change
  const handleRequirementsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectRequirements(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setProjectRequirements(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Generate a blueprint
  const generateBlueprint = () => {
    if (projectComponents.length === 0) {
      toast({
        title: 'No components selected',
        description: 'Please select at least one component for your project.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGeneratingBlueprint(true);
    
    // In a real application, this would call an API to generate the blueprint
    // For now, we'll create a simulated blueprint
    setTimeout(() => {
      const simulatedBlueprint = {
        schematic: 'https://images.pexels.com/photos/3912982/pexels-photo-3912982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        bom: projectComponents,
        firmwareSuggestions: [
          'Use Arduino IDE for programming microcontrollers',
          'Consider MQTT protocol for IoT device communication',
          'Initialize sensors before the main loop',
          'Implement deep sleep mode for battery conservation'
        ],
        instructions: `
# Project: ${projectRequirements.title}

## Objective
${projectRequirements.objective}

## Setup Instructions

1. Connect the sensors to the correct GPIO pins on your microcontroller
2. Install the required libraries for each component
3. Upload the firmware to your microcontroller
4. Power the device using ${projectRequirements.powerSource}
5. Test each component individually before final assembly
6. For troubleshooting, check the serial monitor output

## Power Considerations
${projectRequirements.powerSource === 'battery' 
  ? 'Implement sleep modes and power optimization techniques to extend battery life.' 
  : 'Ensure your power supply can provide sufficient current for all components.'}

## Environmental Considerations
${projectRequirements.environment === 'outdoor' 
  ? 'Use weatherproof enclosures and consider temperature variations.' 
  : 'Standard enclosures should be sufficient for indoor use.'}

${projectRequirements.additionalRequirements 
  ? `## Additional Requirements\n${projectRequirements.additionalRequirements}` 
  : ''}
        `
      };
      
      setBlueprint(simulatedBlueprint);
      setIsGeneratingBlueprint(false);
      setCurrentStep(4);
    }, 2000);
  };
  
  // Submit project for expert review
  const handleSubmitProject = async () => {
    if (!authState.isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to save and submit your project.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    try {
      // Prepare project data
      const projectData: Partial<CustomProject> = {
        components: projectComponents,
        requirements: projectRequirements,
        totalPrice: totalPrice,
        status: 'submitted',
        blueprint: blueprint
      };
      
      // In a real application, this would be submitted to the backend
      // For now, we'll simulate a successful response
      toast({
        title: 'Project Submitted',
        description: 'Your project has been submitted for expert review. We will contact you soon.',
      });
      
      // Redirect to account page or a success page
      navigate('/account');
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your project. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Save project as draft
  const handleSaveProject = () => {
    if (!authState.isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to save your project.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    // In a real application, this would save to the backend
    // For now, we'll simulate a successful save
    toast({
      title: 'Project Saved',
      description: 'Your project has been saved as a draft.',
    });
  };
  
  // Download blueprint as PDF
  const handleDownloadBlueprint = () => {
    // In a real application, this would generate and download a PDF
    // For now, we'll just show a toast
    toast({
      title: 'Blueprint Downloaded',
      description: 'Your project blueprint has been downloaded.',
    });
  };
  
  // Navigation between steps
  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && projectComponents.length === 0) {
      toast({
        title: 'No components selected',
        description: 'Please select at least one component for your project.',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentStep === 2) {
      if (!projectRequirements.title.trim()) {
        toast({
          title: 'Title required',
          description: 'Please enter a title for your project.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!projectRequirements.objective.trim()) {
        toast({
          title: 'Objective required',
          description: 'Please enter the objective for your project.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (currentStep === 3) {
      generateBlueprint();
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="container mx-auto px-4 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Custom IoT Project Builder</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Design your own IoT project by selecting components, defining requirements, and generating a blueprint.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {['Select Components', 'Define Requirements', 'Review Project', 'Project Blueprint'].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${currentStep > index + 1 ? 'bg-primary border-primary text-primary-foreground' : 
                      currentStep === index + 1 ? 'border-primary text-primary' : 
                      'border-muted-foreground text-muted-foreground'}`}
                >
                  {currentStep > index + 1 ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`text-sm mt-2 text-center ${
                    currentStep === index + 1 ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300"
              style={{ width: `${(currentStep - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Select Components */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Component Categories and Selection */}
                <div className="col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Select Components</CardTitle>
                      <CardDescription>
                        Choose components for your IoT project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="microcontrollers" value={selectedCategory} onValueChange={setSelectedCategory}>
                        <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
                          {COMPONENT_CATEGORIES.map(category => (
                            <TabsTrigger 
                              key={category.id} 
                              value={category.id}
                              className="flex flex-col items-center py-2 px-1 h-auto"
                            >
                              {category.icon}
                              <span className="text-xs mt-1">{category.name}</span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {COMPONENT_CATEGORIES.map(category => (
                          <TabsContent key={category.id} value={category.id}>
                            <h3 className="text-lg font-medium mb-4">{category.name}</h3>
                            
                            {isLoading ? (
                              <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                              </div>
                            ) : filteredProducts.length === 0 ? (
                              <div className="text-center py-10">
                                <CircuitBoard className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No components found in this category.</p>
                              </div>
                            ) : (
                              <ScrollArea className="h-[400px] pr-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {filteredProducts.map(product => (
                                    <Card key={product.id} className="overflow-hidden flex">
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-1/3 object-cover"
                                      />
                                      <div className="p-3 flex-1 flex flex-col justify-between">
                                        <div>
                                          <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                                          <p className="text-sm text-muted-foreground mt-1">${product.price.toFixed(2)}</p>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          className="mt-2 w-full"
                                          onClick={() => handleAddComponent(product)}
                                        >
                                          <PlusCircle className="h-4 w-4 mr-1" /> Add
                                        </Button>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Selected Components */}
                <div className="col-span-1">
                  <Card className="sticky top-24">
                    <CardHeader className="pb-3">
                      <CardTitle>Project Components</CardTitle>
                      <CardDescription>
                        Your selected items
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projectComponents.length === 0 ? (
                        <div className="text-center py-6">
                          <CircuitBoard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No components selected yet.</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add components from the left panel to start building your project.
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[300px] pr-4">
                          <div className="space-y-3">
                            {projectComponents.map(component => (
                              <div key={component.id} className="flex items-center p-2 border rounded-md">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{component.name}</p>
                                  <p className="text-sm text-muted-foreground">${component.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleUpdateQuantity(component.id, Math.max(1, component.quantity - 1))}
                                  >
                                    <MinusCircle className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center">{component.quantity}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleUpdateQuantity(component.id, component.quantity + 1)}
                                  >
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => handleRemoveComponent(component.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => navigate('/products')}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Browse Products
                </Button>
                <Button onClick={handleNext} disabled={projectComponents.length === 0}>
                  Next: Define Requirements <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Define Requirements */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Define Project Requirements</CardTitle>
                  <CardDescription>
                    Provide details about your IoT project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Project Title</Label>
                        <Input 
                          id="title" 
                          name="title" 
                          placeholder="e.g., Smart Home Monitoring System"
                          value={projectRequirements.title}
                          onChange={handleRequirementsChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="environment">Environment</Label>
                        <Select 
                          name="environment" 
                          value={projectRequirements.environment}
                          onValueChange={(value) => handleSelectChange('environment', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indoor">Indoor</SelectItem>
                            <SelectItem value="outdoor">Outdoor</SelectItem>
                            <SelectItem value="both">Both Indoor & Outdoor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="powerSource">Power Source</Label>
                        <Select 
                          name="powerSource" 
                          value={projectRequirements.powerSource}
                          onValueChange={(value) => handleSelectChange('powerSource', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select power source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="battery">Battery</SelectItem>
                            <SelectItem value="usb">USB</SelectItem>
                            <SelectItem value="wall">Wall Outlet</SelectItem>
                            <SelectItem value="solar">Solar</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="sizeConstraints">Size Constraints (Optional)</Label>
                        <Input 
                          id="sizeConstraints" 
                          name="sizeConstraints" 
                          placeholder="e.g., Must fit in a 10x10x5 cm enclosure"
                          value={projectRequirements.sizeConstraints}
                          onChange={handleRequirementsChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="objective">Project Objective</Label>
                        <Textarea 
                          id="objective" 
                          name="objective" 
                          placeholder="Describe what your project should accomplish"
                          className="min-h-[120px]"
                          value={projectRequirements.objective}
                          onChange={handleRequirementsChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="additionalRequirements">Additional Requirements (Optional)</Label>
                        <Textarea 
                          id="additionalRequirements" 
                          name="additionalRequirements" 
                          placeholder="Any other specific requirements or constraints"
                          className="min-h-[120px]"
                          value={projectRequirements.additionalRequirements}
                          onChange={handleRequirementsChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button onClick={handleNext}>
                    Next: Review Project <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Step 3: Review Project */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Project</CardTitle>
                  <CardDescription>
                    Review your project details before generating the blueprint
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Project Details</h3>
                    <div className="bg-muted rounded-md p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title:</span>
                          <span className="font-medium">{projectRequirements.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Environment:</span>
                          <span className="font-medium capitalize">{projectRequirements.environment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Power Source:</span>
                          <span className="font-medium capitalize">{projectRequirements.powerSource}</span>
                        </div>
                        {projectRequirements.sizeConstraints && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size Constraints:</span>
                            <span className="font-medium">{projectRequirements.sizeConstraints}</span>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div>
                        <span className="text-muted-foreground">Objective:</span>
                        <p className="mt-1">{projectRequirements.objective}</p>
                      </div>
                      
                      {projectRequirements.additionalRequirements && (
                        <div className="mt-3">
                          <span className="text-muted-foreground">Additional Requirements:</span>
                          <p className="mt-1">{projectRequirements.additionalRequirements}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Components List</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projectComponents.map((component) => (
                          <TableRow key={component.id}>
                            <TableCell className="font-medium">{component.name}</TableCell>
                            <TableCell>{component.quantity}</TableCell>
                            <TableCell>${component.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ${(component.price * component.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="mt-4 flex justify-between items-center py-2 px-4 bg-muted rounded-md">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 rounded-md p-4 border border-primary/20">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary mb-1">Ready to Generate Blueprint</h4>
                        <p className="text-sm text-muted-foreground">
                          Click "Generate Blueprint" to create a schematic, bill of materials, 
                          and firmware suggestions for your project. You can save, download, 
                          or submit the blueprint for expert assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSaveProject}>
                      Save as Draft
                    </Button>
                    <Button onClick={handleNext} disabled={isGeneratingBlueprint}>
                      {isGeneratingBlueprint ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>Generate Blueprint <ArrowRight className="h-4 w-4 ml-2" /></>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Step 4: Blueprint */}
          {currentStep === 4 && blueprint && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Project Blueprint</CardTitle>
                      <CardDescription>
                        Your custom IoT project details
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {projectRequirements.title}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Schematic */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Schematic Diagram</h3>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={blueprint.schematic} 
                        alt="Project Schematic" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Note: This is a simplified schematic. You may need to adapt it based on your specific components.
                    </p>
                  </div>
                  
                  {/* Bill of Materials */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Bill of Materials (BOM)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blueprint.bom.map((component) => (
                          <TableRow key={component.id}>
                            <TableCell className="font-medium">{component.name}</TableCell>
                            <TableCell className="capitalize">{component.type}</TableCell>
                            <TableCell>{component.quantity}</TableCell>
                            <TableCell className="text-right">
                              ${(component.price * component.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${totalPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Firmware Suggestions */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Firmware Suggestions</h3>
                    <ul className="space-y-2 ml-6 list-disc">
                      {blueprint.firmwareSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Project Instructions</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {blueprint.instructions}
                      </pre>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Review
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleDownloadBlueprint}>
                      <FileDown className="h-4 w-4 mr-2" /> Download Blueprint
                    </Button>
                    <Button onClick={handleSubmitProject}>
                      Submit for Expert Assistance
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">What's Next?</h3>
                <p className="mb-4">
                  Now that you have your IoT project blueprint, you can:
                </p>
                <ul className="space-y-2 ml-6 list-disc">
                  <li>Purchase the components from our store</li>
                  <li>Download the blueprint for reference</li>
                  <li>Submit your project for expert assistance</li>
                  <li>Share your project with others</li>
                </ul>
                <div className="mt-6 flex gap-4">
                  <Button onClick={() => navigate('/cart')}>
                    Add All Components to Cart
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}