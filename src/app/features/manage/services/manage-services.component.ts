import { Component, OnInit } from '@angular/core';
import { Service } from '../../../core/models/service.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './manage-services.component.html',
  styleUrl: './manage-services.component.css'
})
export class ManageServicesComponent implements OnInit {
  services: Service[] = [];
  currentService: Service = { id: 0, name: '', description: '', price: 0, duration: 0, images: [] };
  isEditing: boolean = false;
  tempImages: string[] = [];
  selectedImages: number[] = [];
  serviceForm: FormGroup;
  serviceToDelete: Service | null = null;
  errorMessage: string = '';

  constructor(private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      price: ['', [Validators.min(0)]],
      duration: ['', [Validators.min(0)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    // Inicializar con datos de ejemplo (sustituir cuando se consuma la API)
    this.services = [
      {
        id: 1,
        name: 'Corte desvanecido',
        description: 'Un corte que se caracteriza por tener un aspecto limpio y bien definido.',
        price: 100,
        duration: 45,
        images: ['assets/img/servicio1.png']
      },
      {
        id: 2,
        name: 'Arreglo barba',
        description: 'Consiste en recortar, dar forma, limpiar y peinar la barba para lograr una apariencia estilizada.',
        price: 70,
        duration: 20,
        images: ['assets/img/servicio2.png']
      },
      {
        id: 3,
        name: 'Corte escolar',
        description: 'El corte ideal para estudiantes o niños. Mantiene el cabello corto.',
        price: 80,
        duration: 30,
        images: ['assets/img/servicio3.png']
      },
      {
        id: 4,
        name: 'Afeitado express',
        description: 'Se elimina el vello facial de manera rápida y efectiva.',
        price: 90,
        duration: 15,
        images: ['assets/img/servicio4.png']
      },
      {
        id: 5,
        name: 'Arreglo cejas',
        description: 'Elimina el vello no deseado para dar forma y resaltar los rasgos faciales.',
        price: 30,
        duration: 20,
        images: ['assets/img/servicio5.png']
      },
      {
        id: 6,
        name: 'Diseños',
        description: 'Contamos con variedad de cortes de pelo y estilos de barba. Puedes consultar con nuestros empleados el catálogo de cortes.',
        images: ['assets/img/servicio6.png']
      },
      {
        id: 7,
        name: 'Mascarilla',
        description: 'Se emplea para hidratar, purificar e iluminar tu cara.',
        price: 70,
        duration: 20,
        images: ['assets/img/servicio7.png']
      }
    ];
  }

  // Método para abrir el explorador de archivos al hacer clic en el botón de subir imágenes
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

  // Método para seleccionar o deseleccionar una imagen
  toggleSelection(index: number): void {
    const idx = this.selectedImages.indexOf(index);
    if (idx > -1) {
      this.selectedImages.splice(idx, 1); // Deselect
    } else {
      this.selectedImages.push(index); // Select
    }
  }

  openAddServiceModal() {
    this.isEditing = false;
    this.selectedImages = [];
    this.currentService = { id: 0, name: '', description: '', price: 0, duration: 0 };
    this.serviceForm.reset();
    this.tempImages = [];

    const fileInput = document.getElementById('serviceImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  openEditServiceModal(service: Service) {
    this.isEditing = true;
    this.selectedImages = [];
    this.currentService = { ...service };
    this.serviceForm.patchValue(service);
    this.tempImages = [...(service.images || [])];
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!this.tempImages.includes(reader.result as string)) {
            this.tempImages.push(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      });

      input.value = '';
    }
  }

  selectImage(index: number, event: MouseEvent) {
    event.preventDefault();
    if (this.selectedImages.includes(index)) {
      this.selectedImages = this.selectedImages.filter(i => i !== index);
    } else {
      this.selectedImages.push(index);
    }
  }

  // Función para eliminar imágenes de la previsualización temporal
  removeImage(index: number) {
    this.tempImages.splice(index, 1);
    this.selectedImages = this.selectedImages.filter((i) => i !== index);
    this.selectedImages = this.selectedImages.map((i) => (i > index ? i - 1 : i));
  }

  // Función para eliminar las imágenes seleccionadas de la previsualización temporal
  removeSelectedImages() {
    this.selectedImages.sort((a, b) => b - a).forEach((index) => this.removeImage(index));
  }

  // Función de guardado que aplica cambios a los datos originales
  saveService() {
    Object.values(this.serviceForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.serviceForm.valid) {
      const serviceData = {
        ...this.serviceForm.value,
        images: [...this.tempImages],
      };

      if (this.isEditing) {
        const index = this.services.findIndex((s) => s.id === this.currentService.id);
        if (index !== -1) {
          this.services[index] = { ...this.currentService, ...serviceData };
        }
      } else {
        const newService: Service = {
          ...serviceData,
          id: this.services.length + 1,
        };
        this.services.push(newService);
      }

      // Limpiar las imágenes temporales y la selección de imágenes después de guardar
      this.tempImages = [];
      this.selectedImages = [];
    } else {
      console.log(this.serviceForm.errors);
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
    }
  }

  confirmDeleteService(service: Service) {
    this.serviceToDelete = service;
  }

  deleteService() {
    if (this.serviceToDelete) {
      // Lógica para eliminar un servicio (sustituir cuando se consuma la API)
      this.services = this.services.filter(s => s.id !== this.serviceToDelete?.id);
    }
  }
}