import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts; trackBy: trackById" 
           class="toast toast-{{ toast.type }}"
           (click)="dismiss(toast.id)">
        <span class="toast-icon">
          <ng-container *ngIf="toast.type === 'success'">✓</ng-container>
          <ng-container *ngIf="toast.type === 'error'">✕</ng-container>
          <ng-container *ngIf="toast.type === 'warning'">⚠</ng-container>
          <ng-container *ngIf="toast.type === 'info'">ℹ</ng-container>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-icon {
      font-weight: 700;
      font-size: 0.9rem;
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  dismiss(id: string) { this.toastService.dismiss(id); }
  trackById(_: number, t: Toast) { return t.id; }
}
