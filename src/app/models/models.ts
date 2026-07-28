export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  cost: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  sku: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  address?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: Date;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cash' | 'transfer' | 'card' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  shippingAddress?: string;
  channel: 'instagram' | 'whatsapp' | 'store' | 'web';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent';
  content: string;
  type: 'text' | 'image' | 'order' | 'product';
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerInstagram?: string;
  channel: 'whatsapp' | 'instagram' | 'direct';
  status: 'open' | 'pending' | 'resolved' | 'archived';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  tags?: string[];
  assignedTo?: string;
  messages: ChatMessage[];
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  receipt?: string;
  notes?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlySales: number;
  monthlyOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  salesGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface SalesByDay {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  category: string;
  sold: number;
  revenue: number;
  image?: string;
}
