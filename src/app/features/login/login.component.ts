import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { JwtDto } from '../../core/models/auth/jwt-dto.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {}

  logIn() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.loginForm.valid) {
      const userLogin = this.loginForm.value;
      const rememberMe = this.loginForm.get('rememberMe')?.value || false;

      this._authService.login(userLogin, rememberMe).subscribe(
        (jwtDto: JwtDto) => {
          console.log('Usuario autenticado correctamente:', jwtDto);
          this._router.navigate(['/manage']);
        },
        error => {
          this.handleLoginError(error);
        }
      );
    } else {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
    }
  }

  private handleLoginError(error: any) {
    switch (error.status) {
      case 400:
        this.errorMessage = 'Formato de los datos incorrecto. Por favor, revise los datos introducidos.';
        break;
      case 401:
        this.errorMessage = 'Email o contraseña incorrectos. Por favor, intente nuevamente.';
        break;
      case 404:
        this.errorMessage = 'Usuario no registrado. Por favor, regístrese.';
        break;
      case 500:
        this.errorMessage = 'Ocurrió un error en el servidor. Por favor, intente nuevamente más tarde.';
        break;
      default:
        this.errorMessage = 'Error desconocido. Por favor, contacte al administrador del sistema.';
    }
  }
}
