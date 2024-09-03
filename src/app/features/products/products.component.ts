import { Component, OnInit } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'] // Corrige 'styleUrl' a 'styleUrls'
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((data: Product[]) => {
      // Inicializa el índice actual de la imagen en cada producto
      this.products = data.map(product => ({ ...product, currentImageIndex: 0 }));
    });
  }

  changeImageIndex(product: any, change: number): void {
    product.currentImageIndex = (product.currentImageIndex + change + product.images.length) % product.images.length;
  }
}
