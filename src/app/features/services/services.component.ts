import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../core/models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.component.html'
})
export class ServicesComponent implements OnInit {

  services: Service[] = [];

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void {
    this.serviceService.getAllServices().subscribe((data: Service[]) => {
      this.services = data.map(service => ({ ...service, currentImageIndex: 0 }));
    });
  }

  changeImageIndex(service: any, change: number): void {
    service.currentImageIndex = (service.currentImageIndex + change + service.images.length) % service.images.length;
  }
}
