import { AuthService, authUser } from '@app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { logDetails } from '@shared/interfaces/others.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  authForm: FormGroup;
  isLoaderShown = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    window.scrollTo(0, 0);
  }

  initForm(): void {
    this.authForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(RegexPatterns.email),
      ]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    });
  }

  onForgotPassword(): void {
    return;
    // this.authService.onForgotPassword();
  }

  login(): void {
    if (this.authForm.valid) {
      this.isLoaderShown = true;
      const userData: logDetails = {
        email: this.email?.value?.trim(),
        password: this.password?.value?.trim(),
      };
      this.authService.login(userData)
        .then(this.postLogin.bind(this))
        .catch((error) => {
          this.isLoaderShown = false;
          this.authService.handleAuthError(error)
        })

    }
  }

  loginWithGoogle(): void {
    this.resetForm();
    this.isLoaderShown = true;
    this.authService.loginWithGoogle()
      .then(this.postLogin.bind(this))
      .catch((error) => {
        this.isLoaderShown = false;
        this.authService.handleAuthError(error)
      });
  }

  postLogin(user: authUser) {
    sessionStorage.setItem('name', user.user.displayName);
    this.isLoaderShown = false;
    this.router.navigate(['/dashboard/home']);
  }

  resetForm(): void {
    this.authForm.reset();
    this.authForm.markAsUntouched();
  }

  get password() {
    return this.authForm.get('password');
  }

  get email() {
    return this.authForm.get('email');
  }
}
