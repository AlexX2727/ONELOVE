import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Conversation, ChatMessage } from '../../models/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-shell animate-fadeIn">
      <!-- Conversations List -->
      <div class="conv-list">
        <!-- Header -->
        <div class="conv-header">
          <h3>Mensajes</h3>
          <div class="badge badge-accent">{{ totalUnread }}</div>
        </div>
        
        <!-- Search -->
        <div class="search-wrapper" style="padding:0 16px 12px">
          <span class="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" class="form-control" placeholder="Buscar conversaciones..." style="font-size:0.85rem" [(ngModel)]="convSearch">
        </div>
        
        <!-- Filter Tabs -->
        <div style="padding:0 16px 12px;display:flex;gap:6px">
          <span class="pill-tab" [class.active]="convFilter === 'all'" (click)="convFilter='all'">Todos</span>
          <span class="pill-tab" [class.active]="convFilter === 'open'" (click)="convFilter='open'">Abiertos</span>
          <span class="pill-tab" [class.active]="convFilter === 'pending'" (click)="convFilter='pending'">Pendientes</span>
        </div>
        
        <!-- Conversation Items -->
        <div class="conv-items">
          <div *ngFor="let conv of filteredConversations" 
               class="conv-item" 
               [class.active]="activeConv?.id === conv.id"
               [class.unread]="conv.unreadCount > 0"
               (click)="selectConv(conv)">
            <div class="conv-avatar">
              <div class="avatar" [style.background]="getAvatarColor(conv.customerName)">
                {{ conv.customerName[0] }}
              </div>
              <span class="channel-dot" [style.background]="getChannelColor(conv.channel)"></span>
            </div>
            <div class="conv-preview">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <span class="conv-name">{{ conv.customerName }}</span>
                <span class="conv-time">{{ formatTime(conv.lastMessageTime) }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="conv-last">{{ conv.lastMessage }}</span>
                <span class="unread-badge" *ngIf="conv.unreadCount > 0">{{ conv.unreadCount }}</span>
              </div>
              <div style="display:flex;gap:4px;margin-top:4px">
                <span *ngFor="let tag of conv.tags" 
                      style="font-size:0.65rem;padding:1px 6px;background:rgba(232,160,191,0.1);border-radius:3px;color:var(--accent)">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="empty-state" *ngIf="filteredConversations.length === 0" style="padding:30px 16px">
            <div class="empty-icon" style="font-size:2rem">💬</div>
            <p style="font-size:0.85rem;color:var(--text-muted)">Sin conversaciones</p>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="activeConv">
        <!-- Chat Header -->
        <div class="chat-header">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="avatar" [style.background]="getAvatarColor(activeConv.customerName)">
              {{ activeConv.customerName[0] }}
            </div>
            <div>
              <p style="font-weight:600;font-size:0.95rem">{{ activeConv.customerName }}</p>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:0.75rem;color:var(--text-muted)">{{ activeConv.customerPhone }}</span>
                <span *ngIf="activeConv.customerInstagram" style="font-size:0.75rem;color:var(--accent)">{{ activeConv.customerInstagram }}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge" [style.background]="getStatusBg(activeConv.status)" style="color:white">
              {{ getStatusLabel(activeConv.status) }}
            </span>
            <button class="btn btn-success btn-sm" (click)="openWhatsApp(activeConv)">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <select class="form-select" style="width:130px;padding:6px 24px 6px 8px;font-size:0.8rem" 
                    [value]="activeConv.status" (change)="updateConvStatus($event)">
              <option value="open">Abierto</option>
              <option value="pending">Pendiente</option>
              <option value="resolved">Resuelto</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages-area" #msgArea>
          <div *ngFor="let msg of activeConv.messages" 
               class="message-wrap" [class.agent]="msg.senderType === 'agent'">
            <div class="avatar avatar-sm" *ngIf="msg.senderType === 'customer'" [style.background]="getAvatarColor(msg.senderName)">
              {{ msg.senderName[0] }}
            </div>
            <div class="message-bubble" [class.agent]="msg.senderType === 'agent'">
              <p>{{ msg.content }}</p>
              <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
            </div>
            <div class="avatar avatar-sm brand-avatar" *ngIf="msg.senderType === 'agent'">💕</div>
          </div>
          
          <!-- Typing indicator -->
          <div class="message-wrap" *ngIf="isTyping">
            <div class="avatar avatar-sm" style="background:var(--bg-surface2)">👤</div>
            <div class="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Quick Replies -->
        <div class="quick-replies">
          <span *ngFor="let qr of quickReplies" 
                class="quick-reply-chip"
                (click)="useQuickReply(qr)">{{ qr }}</span>
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <div class="emoji-trigger" (click)="toggleEmoji()">😊</div>
          <textarea 
            class="chat-input" 
            placeholder="Escribe un mensaje... (Enter para enviar)"
            [(ngModel)]="messageText"
            (keydown.enter)="onEnter($event)"
            rows="1">
          </textarea>
          <button class="btn btn-primary" [disabled]="!messageText.trim()" (click)="sendMessage()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- No conversation selected -->
      <div class="chat-empty" *ngIf="!activeConv">
        <div style="text-align:center">
          <div style="font-size:4rem;margin-bottom:16px">💬</div>
          <h3 style="font-family:'Playfair Display',serif;margin-bottom:8px;color:var(--text-secondary)">ONE LOVE Chat</h3>
          <p style="color:var(--text-muted);font-size:0.9rem">Selecciona una conversación para comenzar</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - var(--header-height) - 56px); }
    
    .chat-shell {
      display: grid;
      grid-template-columns: 320px 1fr;
      height: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }
    
    .conv-list {
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .conv-header {
      padding: 20px 16px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      
      h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; }
    }
    
    .pill-tab {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      color: var(--text-muted);
      cursor: pointer;
      transition: var(--transition-fast);
      
      &.active {
        background: rgba(232,160,191,0.15);
        color: var(--accent);
      }
    }
    
    .conv-items { flex: 1; overflow-y: auto; }
    
    .conv-item {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      cursor: pointer;
      transition: var(--transition-fast);
      
      &:hover { background: var(--bg-surface); }
      &.active { background: rgba(232,160,191,0.07); border-left: 3px solid var(--accent); }
      &.unread .conv-name { font-weight: 700; color: var(--text-primary); }
    }
    
    .conv-avatar { position: relative; }
    
    .channel-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--bg-card);
    }
    
    .conv-preview { flex: 1; min-width: 0; }
    
    .conv-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .conv-time {
      font-size: 0.7rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    
    .conv-last {
      font-size: 0.78rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    
    .unread-badge {
      background: var(--accent);
      color: var(--primary);
      font-size: 0.65rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .chat-window {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-surface);
    }
    
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .message-wrap {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      
      &.agent {
        flex-direction: row-reverse;
      }
    }
    
    .message-bubble {
      max-width: 70%;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 16px 16px 16px 4px;
      padding: 10px 14px;
      position: relative;
      
      p {
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      
      &.agent {
        background: linear-gradient(135deg, var(--accent), var(--accent-dark));
        border-color: transparent;
        border-radius: 16px 16px 4px 16px;
        
        p { color: var(--primary); font-weight: 500; }
        .msg-time { color: rgba(26,26,46,0.6); }
      }
    }
    
    .msg-time {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    
    .brand-avatar {
      background: linear-gradient(135deg, var(--accent), var(--accent-dark)) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }
    
    .typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 12px 16px;
      
      span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
        animation: pulse 1.2s infinite;
        
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
    
    .quick-replies {
      padding: 8px 16px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      border-top: 1px solid var(--border);
    }
    
    .quick-reply-chip {
      font-size: 0.75rem;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      background: rgba(232,160,191,0.1);
      border: 1px solid rgba(232,160,191,0.2);
      color: var(--accent);
      cursor: pointer;
      transition: var(--transition-fast);
      white-space: nowrap;
      
      &:hover {
        background: rgba(232,160,191,0.2);
      }
    }
    
    .chat-input-area {
      padding: 12px 16px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 8px;
      align-items: center;
      background: var(--bg-surface);
    }
    
    .emoji-trigger {
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
      
      &:hover { background: var(--bg-surface2); transform: scale(1.1); }
    }
    
    .chat-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 0.875rem;
      resize: none;
      font-family: 'Inter', sans-serif;
      transition: var(--transition-fast);
      
      &::placeholder { color: var(--text-muted); }
      &:focus { outline: none; border-color: var(--accent); }
    }
    
    .chat-empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ChatComponent implements OnInit {
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  activeConv: Conversation | null = null;
  messageText = '';
  convSearch = '';
  convFilter = 'all';
  isTyping = false;
  totalUnread = 0;

  quickReplies = [
    'Hola! 💕 Bienvenida a ONE LOVE',
    'Tenemos disponible ✨',
    'Te paso los detalles 📦',
    '¿Cuál es tu talla?',
    'Precio especial para ti 🎀',
    'Hacemos envíos a todo Ecuador 🇪🇨'
  ];

  constructor(private dataService: DataService, private toast: ToastService) {}

  ngOnInit() {
    this.dataService.conversations$.subscribe(convs => {
      this.conversations = convs;
      this.totalUnread = convs.reduce((sum, c) => sum + c.unreadCount, 0);
      this.applyFilter();
      if (this.activeConv) {
        this.activeConv = convs.find(c => c.id === this.activeConv!.id) || null;
      }
    });
  }

  applyFilter() {
    this.filteredConversations = this.conversations.filter(c => {
      const ms = !this.convSearch || c.customerName.toLowerCase().includes(this.convSearch.toLowerCase());
      const mf = this.convFilter === 'all' || c.status === this.convFilter;
      return ms && mf;
    });
  }

  ngDoCheck() { this.applyFilter(); }

  selectConv(conv: Conversation) { this.activeConv = conv; }

  sendMessage() {
    if (!this.messageText.trim() || !this.activeConv) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      conversationId: this.activeConv.id,
      senderId: 'agent',
      senderName: 'ONE LOVE',
      senderType: 'agent',
      content: this.messageText,
      type: 'text',
      timestamp: new Date(),
      read: true
    };
    this.dataService.sendMessage(this.activeConv.id, msg);
    this.messageText = '';
    this.simulateReply();
  }

  simulateReply() {
    this.isTyping = true;
    const replies = [
      'Perfecto! Te escribo por WhatsApp 💕',
      'Claro que sí! Un momento...',
      'Gracias por escribir a ONE LOVE 🌸',
      'Genial! Te confirmo disponibilidad',
    ];
    setTimeout(() => {
      this.isTyping = false;
      if (this.activeConv) {
        const reply: ChatMessage = {
          id: Date.now().toString(),
          conversationId: this.activeConv.id,
          senderId: this.activeConv.customerId,
          senderName: this.activeConv.customerName,
          senderType: 'customer',
          content: replies[Math.floor(Math.random() * replies.length)],
          type: 'text',
          timestamp: new Date(),
          read: false
        };
        this.dataService.sendMessage(this.activeConv.id, reply);
      }
    }, 2000 + Math.random() * 2000);
  }

  onEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  useQuickReply(text: string) { this.messageText = text; }
  toggleEmoji() { /* emoji picker placeholder */ }

  updateConvStatus(event: Event) {
    const status = (event.target as HTMLSelectElement).value as Conversation['status'];
    // Update conversation status in service
    this.toast.success(`Conversación marcada como ${this.getStatusLabel(status)}`);
  }

  openWhatsApp(conv: Conversation) {
    const msg = `Hola ${conv.customerName}! Te escribe ONE LOVE 💕`;
    window.open(`https://wa.me/${conv.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return new Date(date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return new Date(date).toLocaleDateString('es', { day: '2-digit', month: 'short' });
  }

  getAvatarColor(name: string): string {
    const colors = ['#E8A0BF', '#C97BA0', '#C9A96E', '#85B4E8', '#85C9A0', '#C885C9'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  getChannelColor(ch: string): string {
    return ch === 'whatsapp' ? '#25D366' : ch === 'instagram' ? '#E8A0BF' : '#2196F3';
  }

  getStatusBg(s: string): string {
    const map: Record<string, string> = { open: 'var(--success)', pending: 'var(--warning)', resolved: 'var(--info)', archived: 'var(--text-muted)' };
    return map[s] || 'var(--accent)';
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = { open: 'Abierto', pending: 'Pendiente', resolved: 'Resuelto', archived: 'Archivado' };
    return map[s] || s;
  }
}
