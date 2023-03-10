import { AuthService, authUser } from '@app/services/auth.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackbarService } from '@app/services/snackbar.service';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { logDetails } from '@shared/interfaces/others.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

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
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaWithSpace)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    });
  }

  signup(): void {
    if (this.authForm.valid) {
      this.isLoaderShown = true;
      const userData: logDetails = {
        email: this.email?.value?.trim(),
        password: this.password?.value?.trim(),
        name: this.name?.value?.trim(),
      };
      this.authService.signup(userData)
        .then(this.postSignup.bind(this))
        .catch((error) => {
          this.isLoaderShown = false;
          this.authService.handleAuthError(error)
        })
    }
  }

  signupWithGoogle(): void {
    this.resetForm();
    this.isLoaderShown = true;
    this.authService.loginWithGoogle()
      .then(this.postSignup.bind(this))
      .catch((error) => {
        this.isLoaderShown = false;
        this.authService.handleAuthError(error)
      })
  }

  postSignup(user: authUser) {
    const name = this.name?.value.trim();
    this.authService.createProfile(name, user.user.uid)
      .then(() => {
        sessionStorage.setItem('name', name);
        this.router.navigate(['/dashboard/participate'])
      })
      .catch((error) => this.authService.handleAuthError(error))
      .finally(() => this.isLoaderShown = false);
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

  get name() {
    return this.authForm.get('name');
  }
}
