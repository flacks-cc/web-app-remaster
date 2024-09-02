import { Component, OnInit } from '@angular/core';
import type { Service, Image } from '../../../core/models/service.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ServiceService } from '../../../core/services/service.service';
import { LimitDigitsDirective } from '../../../shared/directives/limit-digits.directive';

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
  isLoading: boolean = false;
  imageUploadError: boolean = false;
  imageUploadErrorMessage?: string;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService
  ) {
    this.serviceForm = this.fb.group({
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

  loadInitialData() {
    this.isLoading = true;
    this.serviceService.getAllServices().subscribe({
      next: (data: Service[]) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.errorMessage = 'Error al cargar los servicios. Por favor, intente de nuevo.';
        this.isLoading = false;
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
          this.imageUploadError = true;
          this.imageUploadErrorMessage = `Formato no permitido: ${file.type}. Solo se permiten JPG y PNG.`;
          return;
        }

        if (file.size > maxSizeInBytes) {
          this.imageUploadError = true;
          this.imageUploadErrorMessage = `El archivo ${file.name} es demasiado grande. El tamaño máximo permitido es ${maxSizeInMB} MB.`;
          return;
        }

        const img = new Image();
        img.onload = () => {
          if (img.width > maxWidth || img.height > maxHeight) {
            this.imageUploadError = true;
            this.imageUploadErrorMessage = `La imagen ${file.name} excede las dimensiones máximas permitidas de ${maxWidth}x${maxHeight} píxeles.`;
          } else {
            this.imageUploadError = false;
            this.imageUploadErrorMessage = '';

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
        this.isLoading = true;
        if (this.isEditing && this.currentService.idService) {
          this.serviceService.updateService(this.currentService.idService, formData).subscribe({
            next: (response) => {
              console.log('Servicio actualizado exitosamente', response);
              this.loadInitialData();
              this.isLoading = false;
              this.resetModalState();
            },
            error: (error) => {
              console.error('Error al actualizar el servicio', error);
              this.handleError(error);
              this.isLoading = false;
            }
          });
        } else {
          this.serviceService.createService(formData).subscribe({
            next: (response) => {
              console.log('Servicio creado exitosamente', response);
              this.loadInitialData();
              this.isLoading = false;
              this.resetModalState();
            },
            error: (error) => {
              console.error('Error al crear el servicio', error);
              this.handleError(error);
              this.isLoading = false;
            }
          });
        }
      });
    } else {
      Object.values(this.serviceForm.controls).forEach(control => {
        control.markAsTouched();
      });
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
      this.isLoading = true;
      this.serviceService.deleteService(this.serviceToDelete.idService).subscribe({
        next: () => {
          this.loadInitialData();
          this.serviceToDelete = null;
          console.log('Servicio eliminado');
          this.isLoading = false;
          this.resetModalState();
        },
        error: (error) => {
          console.error('Error al eliminar el servicio', error);
          this.errorMessage = 'Error al eliminar el servicio. Por favor, intente de nuevo.';
          this.isLoading = false;
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