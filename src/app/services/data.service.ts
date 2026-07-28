import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Product, Customer, Order, Conversation, ChatMessage,
  DashboardStats, SalesByDay, TopProduct
} from '../models/models';

// ── Imágenes de moda femenina curadas por categoría (Unsplash) ──────────────
const FASHION_IMAGES: Record<string, string[]> = {
  Blusas: [
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618677603286-0ec56cb6e1b8?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&q=80',
  ],
  Vestidos: [
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop&q=80',
  ],
  Pantalones: [
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop&q=80',
  ],
  Faldas: [
    'https://images.unsplash.com/photo-1583496661160-fb5218ebe41b?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568101863069-f5be2f2af0cc?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=400&h=500&fit=crop&q=80',
  ],
  Conjuntos: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop&q=80',
  ],
  Accesorios: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop&q=80',
  ],
  Chaquetas: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop&q=80',
  ],
  Shorts: [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548712934-e4619dfad425?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop&q=80',
  ],
};

@Injectable({ providedIn: 'root' })
export class DataService {

  // ── All subjects initialized in constructor to avoid field-ordering issues ──
  private productsSubject: BehaviorSubject<Product[]>;
  private customersSubject: BehaviorSubject<Customer[]>;
  private ordersSubject: BehaviorSubject<Order[]>;
  private conversationsSubject: BehaviorSubject<Conversation[]>;

  products$: Observable<Product[]>;
  customers$: Observable<Customer[]>;
  orders$: Observable<Order[]>;
  conversations$: Observable<Conversation[]>;

  constructor() {
    this.productsSubject = new BehaviorSubject<Product[]>(buildMockProducts());
    this.customersSubject = new BehaviorSubject<Customer[]>(buildMockCustomers());
    this.ordersSubject = new BehaviorSubject<Order[]>(buildMockOrders());
    this.conversationsSubject = new BehaviorSubject<Conversation[]>(buildMockConversations());

    this.products$ = this.productsSubject.asObservable();
    this.customers$ = this.customersSubject.asObservable();
    this.orders$ = this.ordersSubject.asObservable();
    this.conversations$ = this.conversationsSubject.asObservable();
  }

  // ===== PRODUCTS =====
  getProducts(): Product[] { return this.productsSubject.value; }
  addProduct(p: Product): void { this.productsSubject.next([p, ...this.productsSubject.value]); }
  updateProduct(id: string, data: Partial<Product>): void {
    this.productsSubject.next(
      this.productsSubject.value.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p)
    );
  }
  deleteProduct(id: string): void {
    this.productsSubject.next(this.productsSubject.value.filter(p => p.id !== id));
  }

  // ===== CUSTOMERS =====
  getCustomers(): Customer[] { return this.customersSubject.value; }
  addCustomer(c: Customer): void { this.customersSubject.next([c, ...this.customersSubject.value]); }
  updateCustomer(id: string, data: Partial<Customer>): void {
    this.customersSubject.next(
      this.customersSubject.value.map(c => c.id === id ? { ...c, ...data } : c)
    );
  }

  // ===== ORDERS =====
  getOrders(): Order[] { return this.ordersSubject.value; }
  addOrder(o: Order): void { this.ordersSubject.next([o, ...this.ordersSubject.value]); }
  updateOrder(id: string, data: Partial<Order>): void {
    this.ordersSubject.next(
      this.ordersSubject.value.map(o => o.id === id ? { ...o, ...data, updatedAt: new Date() } : o)
    );
  }
  deleteOrder(id: string): void {
    this.ordersSubject.next(this.ordersSubject.value.filter(o => o.id !== id));
  }

  // ===== CONVERSATIONS =====
  getConversations(): Conversation[] { return this.conversationsSubject.value; }
  sendMessage(convId: string, msg: ChatMessage): void {
    this.conversationsSubject.next(
      this.conversationsSubject.value.map(c => c.id === convId
        ? { ...c, messages: [...c.messages, msg], lastMessage: msg.content, lastMessageTime: msg.timestamp, unreadCount: 0 }
        : c)
    );
  }

  // ===== DASHBOARD STATS =====
  getDashboardStats(): DashboardStats {
    const orders = this.getOrders();
    const customers = this.getCustomers();
    const products = this.getProducts();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth);
    return {
      totalSales: orders.reduce((s, o) => s + o.total, 0),
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      monthlySales: monthOrders.reduce((s, o) => s + o.total, 0),
      monthlyOrders: monthOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
      lowStockProducts: products.filter(p => p.stock < 5).length,
      salesGrowth: 18.5,
      ordersGrowth: 12.3,
      customersGrowth: 8.7
    };
  }

  getSalesByDay(): SalesByDay[] {
    const data: SalesByDay[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }),
        sales: Math.floor(Math.random() * 800) + 200,
        orders: Math.floor(Math.random() * 15) + 2
      });
    }
    return data;
  }

  getTopProducts(): TopProduct[] {
    return [
      { productId: '1', productName: 'Blusa Floral Premium', category: 'Blusas', sold: 47, revenue: 1457, image: FASHION_IMAGES['Blusas'][0] },
      { productId: '2', productName: 'Vestido Midi Elegante', category: 'Vestidos', sold: 38, revenue: 2280, image: FASHION_IMAGES['Vestidos'][0] },
      { productId: '3', productName: 'Pantalón Mom Fit', category: 'Pantalones', sold: 34, revenue: 1530, image: FASHION_IMAGES['Pantalones'][0] },
      { productId: '4', productName: 'Conjunto Sport Chic', category: 'Conjuntos', sold: 29, revenue: 1450, image: FASHION_IMAGES['Conjuntos'][0] },
      { productId: '5', productName: 'Falda Plisada Pastel', category: 'Faldas', sold: 25, revenue: 875, image: FASHION_IMAGES['Faldas'][0] },
    ];
  }
}

// ── Pure functions for mock data generation (no 'this' dependency) ──────────

function buildMockProducts(): Product[] {
  const cats = ['Blusas', 'Vestidos', 'Pantalones', 'Faldas', 'Conjuntos', 'Accesorios', 'Chaquetas', 'Shorts'];
  const names: Record<string, string[]> = {
    Blusas: ['Blusa Floral', 'Blusa Tejida', 'Blusa Off-Shoulder', 'Blusa Seda'],
    Vestidos: ['Vestido Midi', 'Vestido Maxi', 'Vestido Mini', 'Vestido Boho'],
    Pantalones: ['Pantalón Mom', 'Pantalón Wide Leg', 'Pantalón Cargo', 'Pantalón Palazzo'],
    Faldas: ['Falda Plisada', 'Falda Denim', 'Falda Midi', 'Falda Wrap'],
    Conjuntos: ['Set Sport', 'Conjunto Lino', 'Set Casual', 'Conjunto Elegante'],
    Accesorios: ['Bolso Tejido', 'Cinturón Trenzado', 'Collar Perlas', 'Aretes Dorados'],
    Chaquetas: ['Blazer Oversize', 'Chaqueta Jean', 'Cardigan Soft', 'Kimono Floral'],
    Shorts: ['Short Denim', 'Short Lino', 'Short Sport', 'Short Boho'],
  };
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const allColors = ['Negro', 'Blanco', 'Rosa', 'Nude', 'Beige', 'Azul', 'Verde'];
  const statuses: Product['status'][] = ['active', 'active', 'active', 'inactive', 'out_of_stock'];
  const fallback = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop&q=80';

  const products: Product[] = [];
  cats.forEach((cat, ci) => {
    const catNames = names[cat] || ['Prenda'];
    const catImgs = FASHION_IMAGES[cat] || [fallback];
    catNames.forEach((name, ni) => {
      const price = Math.floor(Math.random() * 80) + 15;
      products.push({
        id: `p${ci}${ni}`,
        name: `${name} Premium`,
        category: cat,
        price,
        cost: Math.floor(price * 0.45),
        stock: Math.floor(Math.random() * 40),
        sizes: sizes.slice(0, Math.floor(Math.random() * 4) + 2),
        colors: allColors.slice(0, Math.floor(Math.random() * 3) + 1),
        images: [catImgs[ni % catImgs.length]],
        description: `${name} de alta calidad, ideal para toda ocasión. Diseño exclusivo ONE LOVE 💕`,
        sku: `OL-${cat.substring(0, 3).toUpperCase()}-${(ci * 10 + ni).toString().padStart(3, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        featured: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 7776000000),
        updatedAt: new Date(),
      });
    });
  });
  return products;
}

function buildMockCustomers(): Customer[] {
  const names = ['María García', 'Ana Rodríguez', 'Sofía López', 'Isabella Martínez', 'Valentina Torres',
    'Camila Flores', 'Daniela Castro', 'Gabriela Morales', 'Fernanda Ruiz', 'Alejandra Vega',
    'Patricia Lima', 'Natalia Ortiz', 'Claudia Herrera', 'Mónica Salinas', 'Carolina Mendoza'];
  const avenues = ['Amazonas', 'Patria', 'Colón', '6 de Diciembre', 'Naciones Unidas'];
  const cities = ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Loja'];
  return names.map((name, i) => ({
    id: `c${i}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
    phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
    instagram: `@${name.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 999)}`,
    address: `Av. ${avenues[i % 5]} N${Math.floor(Math.random() * 50) + 1}`,
    city: cities[Math.floor(Math.random() * 5)],
    totalOrders: Math.floor(Math.random() * 20) + 1,
    totalSpent: Math.floor(Math.random() * 1500) + 50,
    status: (Math.random() > 0.1 ? 'active' : 'inactive') as 'active' | 'inactive',
    createdAt: new Date(Date.now() - Math.random() * 31536000000),
    notes: i % 3 === 0 ? 'Cliente frecuente, prefiere tallas M-L' : undefined,
  }));
}

function buildMockOrders(): Order[] {
  const customers = buildMockCustomers();
  const statuses: Order['status'][] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
  const channels: Order['channel'][] = ['instagram', 'whatsapp', 'store', 'web'];
  const payMethods: Order['paymentMethod'][] = ['transfer', 'cash', 'card', 'credit'];
  const prodNames = ['Blusa Floral Premium', 'Vestido Midi Elegante', 'Pantalón Mom Fit', 'Conjunto Sport Chic'];
  const prodPrices = [31, 60, 45, 50];

  return customers.slice(0, 12).map((c, i) => {
    const qty = Math.floor(Math.random() * 3) + 1;
    const unitPrice = prodPrices[i % 4];
    const items = [{
      productId: `p0${i % 4}`, productName: prodNames[i % 4],
      sku: `OL-BLU-00${i % 4}`,
      size: ['S', 'M', 'L', 'XL'][i % 4],
      color: ['Negro', 'Rosa', 'Beige', 'Blanco'][i % 4],
      quantity: qty, unitPrice, total: unitPrice * qty,
    }];
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const discount = i % 5 === 0 ? subtotal * 0.1 : 0;
    return {
      id: `o${i}`,
      orderNumber: `OL-2024-${(1000 + i).toString()}`,
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone,
      items, subtotal, discount, shipping: 5,
      total: subtotal - discount + 5,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: payMethods[i % payMethods.length],
      paymentStatus: (Math.random() > 0.3 ? 'paid' : 'pending') as 'paid' | 'pending',
      channel: channels[i % channels.length],
      notes: i % 4 === 0 ? 'Entregar rápido' : undefined,
      createdAt: new Date(Date.now() - Math.random() * 2592000000),
      updatedAt: new Date(),
    };
  });
}

function buildMockConversations(): Conversation[] {
  const names = ['María G.', 'Ana R.', 'Sofía L.', 'Isabella M.', 'Valentina T.', 'Camila F.'];
  const msgs = [
    'Hola! Quiero saber si tienen talla M en la blusa rosa 🌸',
    'Cuánto cuesta el vestido midi que pusieron hoy?',
    'Hice el pago, te mando el comprobante',
    'Me llegó el pedido! Todo perfecto 💕',
    'Tienen envíos a Guayaquil?',
    'Quisiera apartar el conjunto negro, cuándo hay?',
  ];
  const statuses: Conversation['status'][] = ['open', 'pending', 'open', 'resolved', 'open', 'pending'];
  return names.map((name, i) => ({
    id: `conv${i}`,
    customerId: `c${i}`,
    customerName: name,
    customerPhone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
    customerInstagram: `@${name.split('.')[0].toLowerCase()}${i}`,
    channel: (['whatsapp', 'instagram', 'direct'] as const)[i % 3],
    status: statuses[i],
    lastMessage: msgs[i],
    lastMessageTime: new Date(Date.now() - i * 3600000),
    unreadCount: i % 3 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
    tags: i % 2 === 0 ? ['nuevo pedido'] : ['seguimiento'],
    messages: [
      {
        id: `m${i}0`, conversationId: `conv${i}`, senderId: `c${i}`,
        senderName: name, senderType: 'customer' as const,
        content: msgs[i], type: 'text' as const,
        timestamp: new Date(Date.now() - i * 3600000 - 300000),
        read: i % 3 !== 0,
      },
      ...(i % 2 === 0 ? [{
        id: `m${i}1`, conversationId: `conv${i}`, senderId: 'agent',
        senderName: 'ONE LOVE', senderType: 'agent' as const,
        content: 'Hola! Claro que sí, tenemos disponible 🌸 Te cuento los detalles.',
        type: 'text' as const,
        timestamp: new Date(Date.now() - i * 3600000 - 120000),
        read: true,
      }] : []),
    ],
  }));
}
