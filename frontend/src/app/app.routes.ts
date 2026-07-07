import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Import components
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CategoryListComponent } from './features/categories/category-list.component';
import { CategoryFormComponent } from './features/categories/category-form.component';
import { ProductListComponent } from './features/products/product-list.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { BulkUploadComponent } from './features/products/bulk-upload.component';
import { UserListComponent } from './features/users/user-list.component';
import { UserFormComponent } from './features/users/user-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected Routes
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'categories', 
    component: CategoryListComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'categories/new', 
    component: CategoryFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'categories/edit/:id', 
    component: CategoryFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'products', 
    component: ProductListComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'products/bulk-upload', 
    component: BulkUploadComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'products/new', 
    component: ProductFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'products/edit/:id', 
    component: ProductFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'users', 
    component: UserListComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'users/new', 
    component: UserFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'users/edit/:id', 
    component: UserFormComponent, 
    canActivate: [authGuard] 
  },
  
  // Fallback
  { path: '**', redirectTo: '/dashboard' }
];
