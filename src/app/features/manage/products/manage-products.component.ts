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
  imageUploadError: { name: string; error: string }[] = [];

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
    const allowedFormats = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp', 'image/heif'];
    const maxSizeInMB = 4;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
    if (!input || !input.files) {
      return;
    }
  
    const files = input.files;
    const newImageFiles = Array.from(files);
    const totalFiles = this.tempImages.length + newImageFiles.length;
  
    if (totalFiles <= 6) {
      this.imageUploadError = [];
    } else {
      this.imageUploadError.push({
        name: 'Error:',
        error: 'No puedes seleccionar más de 6 imágenes en total.'
      });
      input.value = '';
      return;
    }
  
    newImageFiles.forEach((file) => {
      if (!allowedFormats.includes(file.type)) {
        this.imageUploadError.push({
          name: `La imagen ${file.name}`,
          error: `es un ${file.name.split('.').pop()} y solo se permiten JPG, PNG, JPEG, WEBP y HEIF.`
        });
        return;
      }
  
      if (file.size > maxSizeInBytes) {
        this.imageUploadError.push({
          name: file.name,
          error: `El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeInMB} MB.`
        });
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.resizeImage(reader.result, 800, 600, 1.0).then((resizedImage) => {
            if (!this.tempImages.includes(resizedImage)) {
              this.tempImages.push(resizedImage);
            }
          });
        }
      };
      reader.readAsDataURL(file);
    });
  
    input.value = '';
  }

  resizeImage(dataUrl: string, width: number, height: number, quality: number = 1.0): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
    });
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
    this.errorMessage = '';
    this.imageUploadError = [];

    if (this.productForm.valid) {
      const formData = new FormData();
      const productData = this.productForm.value;
      formData.append('name', productData.name);
      formData.append('brand', productData.brand);
      formData.append('description', productData.description);
      formData.append('price', productData.price.toString());

      const imagePromises: Promise<void>[] = [];
      let hasNewImages = false;
      const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/heif'];

      if (this.isEditing && this.currentProduct.images) {
        this.currentProduct.images.forEach((image: Image) => {
          if (this.tempImages.includes(image.imageUrl)) {
            const promise = fetch(image.imageUrl)
              .then(res => res.blob())
              .then(blob => {
                if (allowedFormats.includes(blob.type)) {
                  const extension = this.getExtensionFromMimeType(blob.type);
                  formData.append('imageFile', blob, `${image.image}.${extension}`);
                } else {
                  this.imageUploadError.push({
                    name: `La imagen ${image.image}`,
                    error: `tiene un formato no permitido: ${blob.type}. 
                                    Solo se permiten JPEG, PNG, WEBP y HEIF.`
                  });
                }
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
              if (allowedFormats.includes(blob.type)) {
                const extension = this.getExtensionFromMimeType(blob.type);
                formData.append('imageFile', blob, `image${index}.${extension}`);
              } else {
                this.imageUploadError.push({
                  name: `Imagen ${index}`,
                  error: `tiene un formato no permitido: ${blob.type}. 
                                Solo se permiten JPEG, PNG, WEBP y HEIF.`
                });
              }
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

  // Método auxiliar para obtener la extensión del archivo a partir del tipo MIME
  getExtensionFromMimeType(mimeType: string): string | null {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/heif':
        return 'heif';
      default:
        return null; // Devuelve null si el formato no es permitido
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

