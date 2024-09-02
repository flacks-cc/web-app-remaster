import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../core/models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  services: Service[] = [];

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void {
    this.serviceService.getAllServices().subscribe((data: Service[]) => {
      this.services = data.map(service => ({ ...service, currentIndex: 0 }));
    });
  }

  nextImage(service: any) {
    if (service.currentIndex < service.images.length - 1) {
      service.currentIndex++;
    } else {
      service.currentIndex = 0; // Volver al inicio
    }
  }

  prevImage(service: any) {
    if (service.currentIndex > 0) {
      service.currentIndex--;
    } else {
      service.currentIndex = service.images.length - 1; // Ir al final
    }
  }
}
