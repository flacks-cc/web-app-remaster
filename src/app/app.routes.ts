import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { ServicesComponent } from './features/services/services.component';
import { AboutUsComponent } from './features/about-us/about-us.component';
import { ContactUsComponent } from './features/contact-us/contact-us.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'services', component: ServicesComponent },
    // { path: 'about-us', component: AboutUsComponent },
    // { path: 'contact-us', component: ContactUsComponent },
    { path: '**', redirectTo: 'home' }
];
