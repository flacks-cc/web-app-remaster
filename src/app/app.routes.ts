import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { ServicesComponent } from './features/services/services.component';
import { AboutUsComponent } from './features/about-us/about-us.component';
import { ContactUsComponent } from './features/contact-us/contact-us.component';
import { LoginComponent } from './features/login/login.component';
import { ManageProductsComponent } from './features/manage/products/manage-products.component';
import { ManageServicesComponent } from './features/manage/services/manage-services.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'services', component: ServicesComponent },
    // { path: 'about-us', component: AboutUsComponent },
    // { path: 'contact-us', component: ContactUsComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'manage',
        children: [
            { path: '', redirectTo: 'services', pathMatch: 'full' },
            { path: 'services', component: ManageServicesComponent },
            { path: 'products', component: ManageProductsComponent },
        ]
    },
    { path: '**', redirectTo: 'home' }
];
