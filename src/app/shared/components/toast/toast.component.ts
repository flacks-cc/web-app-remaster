import { Component } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/util/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  toasts: Toast[] = [];

  constructor(private _toastService: ToastService) {
    this._toastService.getToasts().subscribe((toast) => {
      this.toasts.push(toast);
    });
  }

  removeToast(toast: Toast): void {
    this.toasts = this.toasts.filter((t) => t !== toast);
    this._toastService.removeToast(toast); // Remover el toast también del servicio
  }

  handleAction(toast: Toast, actionIndex: number): void {
    const action = toast.actions ? toast.actions[actionIndex] : null;
    if (action) {
      action.onClick();
      this.removeToast(toast);
    }
  }
}
