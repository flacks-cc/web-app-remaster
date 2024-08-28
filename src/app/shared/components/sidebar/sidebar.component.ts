import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.component.html',
  styles: ['.nav-link.active { background-color: goldenrod; color: #fff; }']
})
export class SidebarComponent {

  private _router = inject(Router);

  logOut() {
    this._router.navigate(['/login']);
  }
}