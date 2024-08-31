import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.css'
})
export class ManageProductsComponent implements OnInit {
  products: Product[] = [];
  currentProduct: Product = { idProduct: 0, name: '', brand: '', description: '', price: 0, images: [] };
  isEditing: boolean = false;
  tempImages: string[] = [];
  selectedImages: number[] = [];
  productForm: FormGroup;
  productToDelete: Product | null = null;
  errorMessage: string = '';

  constructor(private fb: FormBuilder,
    private productService: ProductService) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      brand: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      price: ['', [Validators.min(0)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
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

  openAddProductModal() {
    this.isEditing = false;
    this.selectedImages = [];
    this.currentProduct = { idProduct: 0, name: '', brand: '', description: '', price: 0, images: [] };
    this.productForm.reset();
    this.tempImages = [];

    const fileInput = document.getElementById('serviceImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  openEditProductModal(product: Product) {
    this.isEditing = true;
    this.selectedImages = [];
    this.currentProduct = { ...product };
    this.productForm.patchValue(product);
    this.tempImages = [...(product.images || [])];
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
  saveProduct() {
    // Asegúrate de que el formulario sea válido
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      // Si estamos editando, llamamos a la función de actualizar
      if (this.isEditing && this.currentProduct.idProduct) {
        this.productService.updateProduct(this.currentProduct.idProduct, productData).subscribe({
          next: (response) => {
            console.log('Producto actualizado exitosamente', response);
            // Aquí podrías cerrar el modal y refrescar la lista de productos
          },
          error: (error) => {
            console.error('Error al actualizar el producto', error);
          }
        });
      } else {
        // Si no estamos editando, llamamos a la función de creación
        this.productService.createProduct(productData).subscribe({
          next: (response) => {
            console.log('Producto creado exitosamente', response);
            // Aquí podrías cerrar el modal y refrescar la lista de productos
          },
          error: (error) => {
            console.error('Error al crear el producto', error);
          }
        });
      }
    } else {
      // Marca todos los controles como tocados para mostrar los errores
      Object.values(this.productForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  confirmDeleteProduct(product: Product) {
    this.productToDelete = product;
  }

  deleteProduct() {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.idProduct).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.idProduct !== this.productToDelete!.idProduct);
          this.productToDelete = null;
          console.log('Producto eliminado');
        },
        error: (error) => {
          console.error('Error al eliminar el producto', error);
        }
      });
    }
  }
}
