import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, Image } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
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
  isLoading: boolean = false;

  private productModal: Modal | null = null;
  private deleteProductModal: Modal | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      brand: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      price: ['', [Validators.required, Validators.min(0)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.initializeModals();
  }

  private initializeModals(): void {
    const productModalElement = document.getElementById('productModal');
    if (productModalElement) {
      this.productModal = new Modal(productModalElement);
    }

    const deleteProductModalElement = document.getElementById('deleteProductModal');
    if (deleteProductModalElement) {
      this.deleteProductModal = new Modal(deleteProductModalElement);
    }
  }

  loadInitialData() {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.errorMessage = 'Error al cargar los productos. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  openAddProductModal() {
    this.isEditing = false;
    this.resetModalState();
    if (this.productModal) {
      this.productModal.show();
    }
  }

  openEditProductModal(product: Product) {
    this.isEditing = true;
    this.currentProduct = { ...product };
    this.productForm.patchValue(product);
    this.tempImages = product.images ? product.images.map((img: any) => img.imageUrl) : [];
    this.errorMessage = '';
    if (this.productModal) {
      this.productModal.show();
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string' && !this.tempImages.includes(reader.result)) {
            this.tempImages.push(reader.result);
          }
        };
        reader.readAsDataURL(file);
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
        this.isLoading = true;
        if (this.isEditing && this.currentProduct.idProduct) {
          this.productService.updateProduct(this.currentProduct.idProduct, formData).subscribe({
            next: (response) => {
              console.log('Producto actualizado exitosamente', response);
              this.loadInitialData();
              this.isLoading = false;
              this.closeModal();
            },
            error: (error) => {
              console.error('Error al actualizar el producto', error);
              this.handleError(error);
              this.isLoading = false;
            }
          });
        } else {
          this.productService.createProduct(formData).subscribe({
            next: (response) => {
              console.log('Producto creado exitosamente', response);
              this.loadInitialData();
              this.isLoading = false;
              this.closeModal();
            },
            error: (error) => {
              console.error('Error al crear el producto', error);
              this.handleError(error);
              this.isLoading = false;
            }
          });
        }
      });
    } else {
      Object.values(this.productForm.controls).forEach(control => {
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

  confirmDeleteProduct(product: Product) {
    this.productToDelete = product;
    if (this.deleteProductModal) {
      this.deleteProductModal.show();
    }
  }

  deleteProduct() {
    if (this.productToDelete) {
      this.isLoading = true;
      this.productService.deleteProduct(this.productToDelete.idProduct).subscribe({
        next: () => {
          this.loadInitialData();
          this.productToDelete = null;
          console.log('Producto eliminado');
          this.isLoading = false;
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error al eliminar el producto', error);
          this.errorMessage = 'Error al eliminar el producto. Por favor, intente de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  closeModal() {
    if (this.productModal) {
      this.productModal.hide();
      document.body.classList.remove('modal-open');
      const backdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (backdrop) {
        backdrop.remove();
      }
    }
    this.resetModalState();
  }

  closeDeleteModal() {
    if (this.deleteProductModal) {
      this.deleteProductModal.hide();
      document.body.classList.remove('modal-open');
      const backdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (backdrop) {
        backdrop.remove();
      }
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