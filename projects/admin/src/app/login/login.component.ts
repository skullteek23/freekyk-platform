import { AuthService } from '@admin/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { adminLoginMessages, formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/constants/REGEX';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  readonly messages = formsMessages;
  readonly adminMessages = adminLoginMessages;

  isLoaderShown = false;
  loginForm: FormGroup;

  // validators = [];


  constructor(
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setValidators();
    this.initForm();
  }

  setValidators() {
    // if (environment.production) {
    //   this.validators = [
    //     Validators.pattern(RegexPatterns.adminID),
    //     Validators.minLength(10), Validators.maxLength(10)
    //   ];
    // } else {
    //   this.validators = [];
    // }
  }

  initForm() {
    this.loginForm = new FormGroup({
      organizerID: new FormControl(null, [
        Validators.required,
        // ...this.validators
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)
      ]),
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid || !this.loginForm.dirty) {
      return;
    }
    this.isLoaderShown = true;
    const email = this.email?.value ? this.email.value.trim() : null;
    const password = this.password?.value ? this.password.value.trim() : null;
    if (email && password && await this.authService.isValidAndActivatedAccount(this.organizerID.value, email)) {
      this.authService.logIn(email, password)
        .then(res => {
          this.isLoaderShown = false;
          this.router.navigate(['/seasons']);
        })
        .catch((error) => this.handleError(error));
    } else {
      this.isLoaderShown = false;
      this.snackbarService.displayError('Invalid account credentials. Please make sure account is activated!');
    }
  }

  handleError(error): void {
    this.snackbarService.displayError(this.authService.getErrorMessage(error?.code));
    this.isLoaderShown = false;
  }

  get organizerID(): AbstractControl {
    return this.loginForm.get('organizerID');
  }

  get email(): AbstractControl {
    return this.loginForm.get('email');
  }

  get password(): AbstractControl {
    return this.loginForm.get('password');
  }
}
