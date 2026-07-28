import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(type: Toast['type'], message: string, duration = 3500) {
    const id = Date.now().toString();
    const toast: Toast = { id, type, message };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(msg: string) { this.show('success', msg); }
  error(msg: string) { this.show('error', msg); }
  warning(msg: string) { this.show('warning', msg); }
  info(msg: string) { this.show('info', msg); }

  dismiss(id: string) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
