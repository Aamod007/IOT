import axios from 'axios';

// Base API URL - replace with your actual API URL in production
const API_URL = 'https://api.iotshop.example.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    description: 'The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header, and a reset button.',
    price: 22.99,
    image: 'https://images.pexels.com/photos/6849944/pexels-photo-6849944.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'microcontrollers',
    stock: 50,
    featured: true,
    specifications: {
      'Microcontroller': 'ATmega328P',
      'Operating Voltage': '5V',
      'Input Voltage': '7-12V',
      'Digital I/O Pins': '14',
      'Analog Input Pins': '6',
      'DC Current per I/O Pin': '20 mA',
      'Flash Memory': '32 KB',
      'SRAM': '2 KB',
      'EEPROM': '1 KB',
      'Clock Speed': '16 MHz',
    },
    compatibleWith: ['shields', 'sensors', 'actuators'],
    rating: 4.8,
    reviews: [
      {
        id: '101',
        userId: 'user1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Great product for beginners!',
        createdAt: '2023-01-15T10:30:00Z',
      },
    ],
    createdAt: '2022-06-10T08:00:00Z',
    updatedAt: '2023-05-20T14:25:00Z',
  },
  {
    id: '2',
    name: 'Raspberry Pi 4 Model B - 4GB RAM',
    description: 'The Raspberry Pi 4 Model B is the latest product in the Raspberry Pi range, offering ground-breaking increases in processor speed, multimedia performance, memory, and connectivity compared to the Raspberry Pi 3 Model B+.',
    price: 45.99,
    image: 'https://images.pexels.com/photos/11997624/pexels-photo-11997624.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'microcomputers',
    stock: 25,
    featured: true,
    specifications: {
      'Processor': 'Broadcom BCM2711, quad-core Cortex-A72 (ARM v8) 64-bit SoC @ 1.5 GHz',
      'Memory': '4GB LPDDR4',
      'Connectivity': 'Gigabit Ethernet, 2.4 GHz and 5.0 GHz IEEE 802.11b/g/n/ac wireless, Bluetooth 5.0, BLE',
      'USB': '2 × USB 3.0 ports, 2 × USB 2.0 ports',
      'GPIO': '40-pin GPIO header',
      'Video': '2 × micro-HDMI ports supporting up to 4Kp60 video resolution',
      'Audio': '4-pole stereo audio and composite video port',
      'Multimedia': 'H.265 (4Kp60 decode), H.264 (1080p60 decode, 1080p30 encode)',
      'Storage': 'MicroSD card slot for loading operating system and data storage',
      'Power': '5V DC via USB-C connector (minimum 3A)',
    },
    compatibleWith: ['camera modules', 'displays', 'HATs'],
    rating: 4.9,
    reviews: [
      {
        id: '102',
        userId: 'user2',
        userName: 'Jane Smith',
        rating: 5,
        comment: 'Amazing performance for such a small device!',
        createdAt: '2023-02-22T14:45:00Z',
      },
    ],
    createdAt: '2022-07-15T09:30:00Z',
    updatedAt: '2023-06-01T11:15:00Z',
  },
  {
    id: '3',
    name: 'DHT22 Temperature and Humidity Sensor',
    description: 'The DHT22 is a basic, low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air, and spits out a digital signal on the data pin.',
    price: 9.99,
    image: 'https://images.pexels.com/photos/3657154/pexels-photo-3657154.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'sensors',
    subcategory: 'environmental',
    stock: 100,
    featured: false,
    specifications: {
      'Power supply': '3.3-6V DC',
      'Output signal': 'Digital signal via single-bus',
      'Sensing element': 'Polymer capacitor',
      'Temperature range': '-40 to 80°C',
      'Humidity range': '0-100% RH',
      'Temperature accuracy': '±0.5°C',
      'Humidity accuracy': '±2% RH',
      'Resolution': 'Temperature 0.1°C, Humidity 0.1% RH',
    },
    compatibleWith: ['Arduino', 'Raspberry Pi', 'ESP8266', 'ESP32'],
    rating: 4.5,
    reviews: [],
    createdAt: '2022-08-20T10:45:00Z',
    updatedAt: '2023-04-12T16:20:00Z',
  },
  {
    id: '4',
    name: 'SG90 Micro Servo Motor',
    description: 'The SG90 is a tiny and lightweight servo motor with high output power. It can rotate approximately 180 degrees (90 in each direction) and works just like standard servos but smaller.',
    price: 3.99,
    image: 'https://images.pexels.com/photos/3601089/pexels-photo-3601089.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'actuators',
    subcategory: 'motors',
    stock: 75,
    featured: false,
    specifications: {
      'Weight': '9g',
      'Dimension': '22.2 x 11.8 x 31 mm',
      'Stall torque': '1.8 kgf·cm (4.8V)',
      'Operating speed': '0.1 s/60° (4.8V)',
      'Operating voltage': '4.8V (~5V)',
      'Temperature range': '0 to 55°C',
      'Dead band width': '7 μs',
      'Connector wire length': '24.5 cm',
    },
    compatibleWith: ['Arduino', 'Raspberry Pi', 'microcontrollers'],
    rating: 4.2,
    reviews: [],
    createdAt: '2022-09-05T13:20:00Z',
    updatedAt: '2023-03-30T09:10:00Z',
  },
  {
    id: '5',
    name: 'ESP32 Development Board',
    description: 'The ESP32 Development Board is a versatile microcontroller that offers both WiFi and Bluetooth connectivity, making it perfect for IoT projects.',
    price: 11.99,
    image: 'https://images.pexels.com/photos/8068381/pexels-photo-8068381.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'microcontrollers',
    stock: 40,
    featured: true,
    specifications: {
      'CPU': 'Tensilica Xtensa LX6 dual-core processor (32-bit)',
      'Clock Frequency': 'Up to 240MHz',
      'Wi-Fi': 'IEEE 802.11 b/g/n',
      'Bluetooth': 'v4.2 BR/EDR and BLE',
      'GPIO': '36 pins',
      'ADC': '18 channels',
      'DAC': '2 channels',
      'Flash Memory': '4MB',
      'SRAM': '520KB',
    },
    compatibleWith: ['sensors', 'displays', 'actuators'],
    rating: 4.7,
    reviews: [],
    createdAt: '2022-10-12T11:30:00Z',
    updatedAt: '2023-06-18T15:45:00Z',
  },
  {
    id: '6',
    name: 'OLED Display 128x64 I2C',
    description: 'This is a 0.96" OLED monochrome display with 128x64 pixels. It communicates via I2C protocol and is perfect for displaying text, small icons, and graphics in IoT projects.',
    price: 7.99,
    image: 'https://images.pexels.com/photos/7621150/pexels-photo-7621150.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'displays',
    stock: 30,
    featured: false,
    specifications: {
      'Display Size': '0.96 inch',
      'Resolution': '128x64 pixels',
      'Controller': 'SSD1306',
      'Color': 'Blue and yellow/white',
      'Interface': 'I2C',
      'Operating Voltage': '3.3-5V DC',
      'Dimensions': '27.8 x 27.3 mm',
    },
    compatibleWith: ['Arduino', 'Raspberry Pi', 'ESP32', 'ESP8266'],
    rating: 4.6,
    reviews: [],
    createdAt: '2022-11-08T16:40:00Z',
    updatedAt: '2023-05-27T12:20:00Z',
  }
];

const mockCategories = [
  {
    id: '1',
    name: 'Microcontrollers',
    slug: 'microcontrollers',
    image: 'https://images.pexels.com/photos/6849944/pexels-photo-6849944.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Control your projects with these powerful microcontrollers'
  },
  {
    id: '2',
    name: 'Microcomputers',
    slug: 'microcomputers',
    image: 'https://images.pexels.com/photos/11997624/pexels-photo-11997624.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Full computing power in tiny packages'
  },
  {
    id: '3',
    name: 'Sensors',
    slug: 'sensors',
    image: 'https://images.pexels.com/photos/3657154/pexels-photo-3657154.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Detect changes in environmental conditions'
  },
  {
    id: '4',
    name: 'Actuators',
    slug: 'actuators',
    image: 'https://images.pexels.com/photos/3601089/pexels-photo-3601089.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Control physical movements in your projects'
  },
  {
    id: '5',
    name: 'Displays',
    slug: 'displays',
    image: 'https://images.pexels.com/photos/7621150/pexels-photo-7621150.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Visualize data with these display options'
  },
  {
    id: '6',
    name: 'Power Supplies',
    slug: 'power-supplies',
    image: 'https://images.pexels.com/photos/1619506/pexels-photo-1619506.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Power your projects with reliable power supplies'
  }
];

// API Service Functions
// Products API
export const productsApi = {
  getAll: async (params = {}) => {
    // For development, return mock data
    // In production, use: return api.get('/products', { params });
    return Promise.resolve({ data: mockProducts });
  },
  
  getById: async (id: string) => {
    // For development, return mock data
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return Promise.reject({ response: { status: 404, data: { message: 'Product not found' } } });
    }
    return Promise.resolve({ data: product });
  },
  
  getFeatured: async () => {
    // For development, return mock data
    const featuredProducts = mockProducts.filter(p => p.featured);
    return Promise.resolve({ data: featuredProducts });
  },
  
  getByCategory: async (category: string) => {
    // For development, return mock data
    const filteredProducts = mockProducts.filter(p => p.category === category);
    return Promise.resolve({ data: filteredProducts });
  },
  
  create: async (productData: any) => {
    return api.post('/products', productData);
  },
  
  update: async (id: string, productData: any) => {
    return api.put(`/products/${id}`, productData);
  },
  
  delete: async (id: string) => {
    return api.delete(`/products/${id}`);
  }
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    // For development, return mock data
    return Promise.resolve({ data: mockCategories });
  },
  
  getById: async (id: string) => {
    // For development, return mock data
    const category = mockCategories.find(c => c.id === id);
    if (!category) {
      return Promise.reject({ response: { status: 404, data: { message: 'Category not found' } } });
    }
    return Promise.resolve({ data: category });
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    // For development, mock successful login with a fake token
    // In production, use: return api.post('/auth/login', { email, password });
    if (email === 'user@example.com' && password === 'password') {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpc0FkbWluIjpmYWxzZSwiZXhwIjoxNzI1MDkwODAwfQ.S3LUF8VO4VPXmoDflspAIBXdQVYQ9QN4v5PtIKLM5Rg';
      return Promise.resolve({ data: { token } });
    } else if (email === 'admin@example.com' && password === 'password') {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJuYW1lIjoiQWRtaW4gVXNlciIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpc0FkbWluIjp0cnVlLCJleHAiOjE3MjUwOTA4MDB9.Nk8ZCvuLkOmWI0TiVlAOe0CXwg04r4JB7ReoCnz9bHU';
      return Promise.resolve({ data: { token } });
    }
    return Promise.reject({ response: { status: 401, data: { message: 'Invalid credentials' } } });
  },
  
  register: async (name: string, email: string, password: string) => {
    // For development, mock successful registration with a fake token
    // In production, use: return api.post('/auth/register', { name, email, password });
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJuYW1lIjoibmFtZSIsImVtYWlsIjoiZW1haWwiLCJpc0FkbWluIjpmYWxzZSwiZXhwIjoxNzI1MDkwODAwfQ.fkGGdKrIr-imN7yCQrT9M_-O_E_xnYzYBCwQeGqUu5Y';
    return Promise.resolve({ data: { token } });
  }
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    return api.get('/orders');
  },
  
  getById: async (id: string) => {
    return api.get(`/orders/${id}`);
  },
  
  getUserOrders: async () => {
    return api.get('/orders/user');
  },
  
  create: async (orderData: any) => {
    return api.post('/orders', orderData);
  },
  
  updateStatus: async (id: string, status: string) => {
    return api.put(`/orders/${id}/status`, { status });
  }
};

// Custom Projects API
export const projectsApi = {
  getAll: async () => {
    return api.get('/projects/custom');
  },
  
  getById: async (id: string) => {
    return api.get(`/projects/custom/${id}`);
  },
  
  getUserProjects: async () => {
    return api.get('/projects/custom/user');
  },
  
  create: async (projectData: any) => {
    return api.post('/projects/custom', projectData);
  },
  
  update: async (id: string, projectData: any) => {
    return api.put(`/projects/custom/${id}`, projectData);
  },
  
  updateStatus: async (id: string, status: string) => {
    return api.put(`/projects/custom/${id}/status`, { status });
  },
  
  generateBlueprint: async (id: string) => {
    return api.post(`/projects/custom/${id}/blueprint`);
  }
};

export default api;