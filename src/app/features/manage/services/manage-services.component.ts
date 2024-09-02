import { Component, inject, OnInit } from '@angular/core';
import type { Service, Image } from '../../../core/models/service.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ServiceService } from '../../../core/services/service.service';
import { LimitDigitsDirective } from '../../../shared/directives/limit-digits.directive';
import { ToastService } from '../../../core/services/util/toast.service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, LimitDigitsDirective],
  templateUrl: './manage-services.component.html',
  styleUrl: './manage-services.component.css'
})
export class ManageServicesComponent implements OnInit {
  services: Service[] = [];
  currentService: Service = { idService: 0, name: '', description: '', price: 0, duration: 0, images: [] };
  isEditing: boolean = false;
  tempImages: string[] = [];
  selectedImages: number[] = [];
  serviceForm: FormGroup;
  serviceToDelete: Service | null = null;
  errorMessage: string = '';

  private _toastService = inject(ToastService);
  private _serviceService = inject(ServiceService);
  private _fb = inject(FormBuilder);

  constructor() {
    this.serviceForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(254)]],
      price: ['', [Validators.min(0)]],
      duration: ['', [Validators.min(0)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  setToast(title: string, message: string, type: 'success' | 'error') {
    this._toastService.showToast(
      title,
      message,
      type
    );
  }

  loadInitialData() {
    this._serviceService.getAllServices().subscribe({
      next: (data: Service[]) => {
        this.services = data;
      },
      error: (err) => {
        this.setToast('Error', 'Ocurrió un error al cargar los servicios.', 'error');
      }
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('serviceImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  triggerSubmit() {
    const btnSubmit = document.getElementById('btnSubmit') as HTMLInputElement;
    if (btnSubmit) {
      btnSubmit.click();
    }
  }

  toggleSelection(index: number): void {
    const idx = this.selectedImages.indexOf(index);
    if (idx > -1) {
      this.selectedImages.splice(idx, 1);
    } else {
      this.selectedImages.push(index);
    }
  }

  openAddServiceModal() {
    this.isEditing = false;
    this.resetModalState();
  }

  openEditServiceModal(service: Service) {
    this.isEditing = true;
    this.currentService = { ...service };
    this.serviceForm.patchValue(service);
    this.tempImages = service.images ? service.images.map((img: any) => img.imageUrl) : [];
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const allowedFormats = ['image/jpg', 'image/png'];
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const maxWidth = 300;
    const maxHeight = 300;

    if (input.files) {
      Array.from(input.files).forEach((file) => {
        if (!allowedFormats.includes(file.type)) {
          this.errorMessage = `Formato no permitido: ${file.type}. Solo se permiten JPG y PNG.`;
          return;
        }

        if (file.size > maxSizeInBytes) {
          this.errorMessage = `El archivo ${file.name} es demasiado grande. El tamaño máximo permitido es ${maxSizeInMB} MB.`;
          return;
        }

        const img = new Image();
        img.onload = () => {
          if (img.width > maxWidth || img.height > maxHeight) {
            this.errorMessage = `La imagen ${file.name} excede las dimensiones máximas permitidas de ${maxWidth}x${maxHeight} píxeles.`;
          } else {
            this.errorMessage = '';

            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string' && !this.tempImages.includes(reader.result)) {
                this.tempImages.push(reader.result);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        img.src = URL.createObjectURL(file);
      });
      input.value = '';
    }
  }

  selectImage(index: number, event: MouseEvent) {
    event.preventDefault();
    this.toggleSelection(index);
  }

  removeImage(index: number) {
    this.tempImages.splice(index, 1);
    this.selectedImages = this.selectedImages.filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));
  }

  removeSelectedImages() {
    this.selectedImages.sort((a, b) => b - a).forEach((index) => this.removeImage(index));
  }

  saveService() {
    Object.values(this.serviceForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.serviceForm.valid) {
      const formData = new FormData();
      const serviceData = this.serviceForm.value;
      formData.append('name', serviceData.name);
      formData.append('description', serviceData.description);
      formData.append('price', serviceData.price.toString());
      formData.append('duration', serviceData.duration.toString());

      const imagePromises: Promise<void>[] = [];
      let hasNewImages = false;

      if (this.isEditing && this.currentService.images) {
        this.currentService.images.forEach((image: Image, index: number) => {
          if (this.tempImages.includes(image.imageUrl)) {
            const promise = fetch(image.imageUrl)
              .then(res => res.blob())
              .then(blob => {
                formData.append('imageFile', blob, image.image);
              });
            imagePromises.push(promise);
          }
        });
      }

      this.tempImages.forEach((image, index) => {
        if (image.startsWith('data:image')) {
          hasNewImages = true;
          const promise = fetch(image)
            .then(res => res.blob())
            .then(blob => {
              formData.append('imageFile', blob, `image${index}.png`);
            });
          imagePromises.push(promise);
        }
      });

      if (!hasNewImages) {
        formData.append('imageFile', new Blob(), 'placeholder.png');
      }

      Promise.all(imagePromises).then(() => {
        if (this.isEditing && this.currentService.idService) {
          this._serviceService.updateService(this.currentService.idService, formData).subscribe({
            next: () => {
              this.loadInitialData();
              this.resetModalState();
              this.setToast('Servicio actualizado', 'El servicio se ha actualizado correctamente.', 'success');
            },
            error: (error) => {
              this.handleError(error);
              this.setToast('Error', 'Ocurrió un error al actualizar el servicio.', 'error');
            }
          });
        } else {
          this._serviceService.createService(formData).subscribe({
            next: () => {
              this.loadInitialData();
              this.resetModalState();
              this.setToast('Servicio creado', 'El servicio se ha creado correctamente.', 'success');
            },
            error: (error) => {
              this.handleError(error);
              this.setToast('Error', 'Ocurrió un error al crear el servicio.', 'error');
            }
          });
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
    }
  }

  handleError(error: any) {
    if (error.error && error.error.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Ocurrió un error inesperado. Por favor, intente de nuevo.';
    }
  }

  confirmDeleteService(service: Service) {
    this.serviceToDelete = service;
  }

  deleteService() {
    if (this.serviceToDelete) {
      this._serviceService.deleteService(this.serviceToDelete.idService).subscribe({
        next: () => {
          this.loadInitialData();
          this.serviceToDelete = null;
          console.log('Servicio eliminado');
          this.resetModalState();
        },
        error: (error) => {
          this.setToast('Error', 'Ocurrió un error al eliminar el servicio.', 'error');
        }
      });
    }
  }

  private resetModalState() {
    this.serviceForm.reset();
    this.tempImages = [];
    this.selectedImages = [];
    this.errorMessage = '';
    this.isEditing = false;
    this.currentService = { idService: 0, name: '', description: '', price: 0, duration: 0, images: [] };
  }
}