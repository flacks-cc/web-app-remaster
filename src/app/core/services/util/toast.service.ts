import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    title: string;
    message: string;
    type: 'success' | 'error';  // Añadido el tipo
    actions?: Array<{ label: string; onClick: () => void }>;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new Subject<Toast>();
    private currentToasts: Toast[] = [];

    getToasts() {
        return this.toastSubject.asObservable();
    }

    showToast(
        title: string,
        message: string,
        type: 'success' | 'error',  // Añadido el tipo
        actions?: Array<{ label: string; onClick: () => void }>
    ): void {
        // Verifica si ya existe un toast con el mismo título y mensaje
        const existingToast = this.currentToasts.find(
            (toast) => toast.title === title && toast.message === message
        );

        if (!existingToast) {
            const newToast = { title, message, type, actions };
            this.currentToasts.push(newToast);
            this.toastSubject.next(newToast);
        }
    }

    removeToast(toast: Toast): void {
        this.currentToasts = this.currentToasts.filter((t) => t !== toast);
    }
}
