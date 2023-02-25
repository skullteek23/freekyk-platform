import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { logDetails } from '@shared/interfaces/others.model';
import { RegexPatterns } from '@shared/Constants/REGEX';
@Component({
  selector: 'app-login-ui',
  templateUrl: './login-ui.component.html',
  styleUrls: ['./login-ui.component.scss'],
})
export class LoginUiComponent implements OnInit {

  // readonly strongPassword = RegexPatterns.passwordStrong;

  @Input() type: 'login' | 'signup' = 'login';
  authForm: FormGroup;
  disableAllButtons = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm();
    window.scrollTo(0, 0)
  }

  isViewLogin(): boolean {
    return this.type === 'login';
  }

  initForm(): void {
    if (this.isViewLogin()) {
      this.authForm = new FormGroup({
        email: new FormControl(null, [
          Validators.required,
          Validators.pattern(RegexPatterns.email),
        ]),
        pass: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      });
    } else {
      this.authForm = new FormGroup({
        name: new FormControl(null, [
          Validators.required,
          Validators.pattern(RegexPatterns.alphaWithSpace),
        ]),
        email: new FormControl(null, [
          Validators.required,
          Validators.pattern(RegexPatterns.email),
        ]),
        pass: new FormControl(null, [Validators.required, Validators.minLength(8)])
      });
    }
  }

  onForgotPassword(): void {
    this.authService.onForgotPassword();
  }

  onSubmit(): void {
    this.disableAllButtons = true;
    this.isLoading = true;
    if (!this.authForm.valid) {
      this.snackBarService.displayCustomMsg('Invalid Details! Please try again.');
      this.disableAllButtons = false;
      return;
    }
    if (this.isViewLogin()) {
      const userData: logDetails = {
        email: this.authForm.get('email')?.value,
        pass: this.authForm.get('pass')?.value,
      };
      const loginSnap = this.authService.onlogin(userData);
      loginSnap
        .then(() => this.authService.afterSignIn())
        .catch((error) => this.onErrorAfterSignin(error))
        .finally(this.cleanUpAfterSignin.bind(this));
    } else {
      const userData: logDetails = {
        email: this.authForm.get('email')?.value,
        pass: this.authForm.get('pass')?.value,
        name: this.authForm.get('name')?.value,
      };
      const signupSnap = this.authService.onSignup(userData);
      signupSnap
        .then((user) => {
          sessionStorage.setItem('name', userData.name);
          const cloudSnap = this.authService.createProfileByCloudFn(
            userData.name,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authService.afterSignup())
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        })
        .catch((error) => this.onErrorAfterSignin(error));
    }
  }

  onGoogleLogin(): void {
    this.disableAllButtons = true;
    this.isLoading = true;
    this.authService
      .onGoogleSignIn()
      .then((user) => {
        sessionStorage.setItem('name', user.user.displayName);
        if (user.additionalUserInfo.isNewUser) {
          const cloudSnap = this.authService.createProfileByCloudFn(
            user.user.displayName,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authService.afterSignup())
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        } else {
          this.authService.afterSignup();
        }
      })
      .catch((error) => this.onErrorAfterSignin(error));
  }

  onFacebookLogin(): void {
    this.disableAllButtons = true;
    this.isLoading = true;
    this.authService
      .onFacebookSignIn()
      .then((user) => {
        sessionStorage.setItem('name', user.user.displayName);
        if (user.additionalUserInfo.isNewUser) {
          const cloudSnap = this.authService.createProfileByCloudFn(
            user.user.displayName,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authService.afterSignup())
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        } else {
          this.authService.afterSignup();
        }
      })
      .catch((error) => this.onErrorAfterSignin(error));
  }

  cleanUpAfterSignin(hideLoading = false): void {
    this.authForm.reset();
    this.authForm.markAsUntouched();
    this.disableAllButtons = false;
    if (hideLoading) {
      this.isLoading = false;
    }
  }

  onErrorAfterSignin(error): void {
    this.authService.onError(error.code);
    this.cleanUpAfterSignin(true);
  }
}
