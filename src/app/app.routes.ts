import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { ServicesComponent } from './features/services/services.component';
import { LoginComponent } from './features/login/login.component';
import { ManageProductsComponent } from './features/manage/products/manage-products.component';
import { ManageServicesComponent } from './features/manage/services/manage-services.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'services', component: ServicesComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'manage', canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'services', pathMatch: 'full' },
            { path: 'services', component: ManageServicesComponent },
            { path: 'products', component: ManageProductsComponent },
        ]
    },
    { path: '**', redirectTo: 'home' }
];
