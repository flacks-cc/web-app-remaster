import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Product, Image } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { NgClass } from '@angular/common';
import { LimitDigitsDirective } from '../../../shared/directives/limit-digits.directive';
import { ToastService } from '../../../core/services/util/toast.service';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, LimitDigitsDirective],
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.css']
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

  private _toastService = inject(ToastService);
  private _productService = inject(ProductService);
  private _fb = inject(FormBuilder);

  constructor() {
    this.productForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      brand: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(254)]],
      price: ['', [Validators.required, Validators.min(0)]],
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
    this._productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
      },
      error: () => {
        this.setToast('Error', 'Ocurrió un error al cargar los productos.', 'error');
      }
    });
  }

  openAddProductModal() {
    this.isEditing = false;
    this.resetModalState();
  }

  openEditProductModal(product: Product) {
    this.isEditing = true;
    this.currentProduct = { ...product };
    this.productForm.patchValue(product);
    this.tempImages = product.images ? product.images.map((img: any) => img.imageUrl) : [];
    this.errorMessage = '';
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

  triggerFileInput() {
    const fileInput = document.getElementById('productImages') as HTMLInputElement;
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

  saveProduct() {
    Object.values(this.productForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.productForm.valid) {
      const formData = new FormData();
      const productData = this.productForm.value;
      formData.append('name', productData.name);
      formData.append('brand', productData.brand);
      formData.append('description', productData.description);
      formData.append('price', productData.price.toString());

      const imagePromises: Promise<void>[] = [];
      let hasNewImages = false;

      if (this.isEditing && this.currentProduct.images) {
        this.currentProduct.images.forEach((image: Image) => {
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
        if (this.isEditing && this.currentProduct.idProduct) {
          this._productService.updateProduct(this.currentProduct.idProduct, formData).subscribe({
            next: () => {
              this.loadInitialData();
              this.resetModalState();
              this.setToast('Producto actualizado', 'El producto se ha actualizado correctamente.', 'success');
            },
            error: (error) => {
              this.handleError(error);
              this.setToast('Error al actualizar', 'Ocurrió un error al actualizar el producto. Por favor, intente de nuevo.', 'error');
            }
          });
        } else {
          this._productService.createProduct(formData).subscribe({
            next: () => {
              this.loadInitialData();
              this.resetModalState();
              this.setToast('Producto creado', 'El producto se ha creado correctamente.', 'success');
            },
            error: (error) => {
              this.handleError(error);
              this.setToast('Error al crear', 'Ocurrió un error al crear el producto. Por favor, intente de nuevo.', 'error');
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

  confirmDeleteProduct(product: Product) {
    this.productToDelete = product;
  }

  deleteProduct() {
    if (this.productToDelete) {
      this._productService.deleteProduct(this.productToDelete.idProduct).subscribe({
        next: () => {
          this.loadInitialData();
          this.productToDelete = null;
          this.resetModalState();
          this.setToast('Producto eliminado', 'El producto se ha eliminado correctamente.', 'success');
        },
        error: () => {
          this.setToast('Error al eliminar', 'Ocurrió un error al eliminar el producto. Por favor, intente de nuevo.', 'error');
        }
      });
    }
  }

  private resetModalState() {
    this.productForm.reset();
    this.tempImages = [];
    this.selectedImages = [];
    this.errorMessage = '';
    this.isEditing = false;
    this.currentProduct = { idProduct: 0, name: '', brand: '', description: '', price: 0, images: [] };
  }
}