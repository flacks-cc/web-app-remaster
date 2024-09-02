import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SidebarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Flack\'s Barber Shop';

  private _router = inject(Router);

  isLoginRoute(): boolean {
    return this._router.url.includes('/login');
  }

  isManageRoute(): boolean {
    return this._router.url.includes('/manage');
  }
}
