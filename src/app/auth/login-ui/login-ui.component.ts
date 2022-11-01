import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { logDetails } from '@shared/interfaces/others.model';
import {
  EMAIL,
  ALPHA_W_SPACE,
  PASS_STRONG,
} from '@shared/Constants/REGEX';
@Component({
  selector: 'app-login-ui',
  templateUrl: './login-ui.component.html',
  styleUrls: ['./login-ui.component.css'],
})
export class LoginUiComponent implements OnInit {
  @Input() type: 'login' | 'signup' = 'login';
  formData = new FormGroup({});
  disableAllButtons = false;
  isLoading = false;
  constructor(
    private authServ: AuthService,
    private snackServ: SnackbarService
  ) { }
  ngOnInit(): void {
    this.initForm();
  }

  isViewLogin(): boolean {
    return this.type === 'login';
  }

  initForm(): void {
    if (this.isViewLogin()) {
      this.formData = new FormGroup({
        email: new FormControl(null, [
          Validators.required,
          Validators.pattern(EMAIL),
        ]),
        pass: new FormControl(null, Validators.required),
      });
    } else {
      this.formData = new FormGroup({
        name: new FormControl(null, [
          Validators.required,
          Validators.pattern(ALPHA_W_SPACE),
        ]),
        email: new FormControl(null, [
          Validators.required,
          Validators.pattern(EMAIL),
        ]),
        pass: new FormControl(null, [
          Validators.required,
          Validators.pattern(PASS_STRONG),
        ]),
      });
    }
  }

  onForgotPassword(): void {
    this.authServ.onForgotPassword();
  }

  onSubmit(): void {
    this.disableAllButtons = true;
    this.isLoading = true;
    if (!this.formData.valid) {
      this.snackServ.displayCustomMsg('Invalid Details! Please try again.');
      this.disableAllButtons = false;
      return;
    }
    if (this.isViewLogin()) {
      const userData: logDetails = {
        email: this.formData.get('email')?.value,
        pass: this.formData.get('pass')?.value,
      };
      const loginSnap = this.authServ.onlogin(userData);
      loginSnap
        .then(() => this.authServ.afterSignIn())
        .catch((error) => this.onErrorAfterSignin(error))
        .finally(this.cleanUpAfterSignin.bind(this));
    } else {
      const userData: logDetails = {
        email: this.formData.get('email')?.value,
        pass: this.formData.get('pass')?.value,
        name: this.formData.get('name')?.value,
      };
      const signupSnap = this.authServ.onSignup(userData);
      signupSnap
        .then((user) => {
          sessionStorage.setItem('name', userData.name);
          const cloudSnap = this.authServ.createProfileByCloudFn(
            userData.name,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authServ.afterSignup())
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        })
        .catch((error) => this.onErrorAfterSignin(error));
    }
  }

  onGoogleLogin(): void {
    this.disableAllButtons = true;
    this.isLoading = true;
    this.authServ
      .onGoogleSignIn()
      .then((user) => {
        sessionStorage.setItem('name', user.user.displayName);
        if (user.additionalUserInfo.isNewUser) {
          const cloudSnap = this.authServ.createProfileByCloudFn(
            user.user.displayName,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authServ.afterSignup())
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        } else {
          this.authServ.afterSignup();
        }
      })
      .catch((error) => this.onErrorAfterSignin(error));
  }

  onFacebookLogin(): void {
    this.disableAllButtons = true;
    this.isLoading = true;
    this.authServ
      .onFacebookSignIn()
      .then((user) => {
        sessionStorage.setItem('name', user.user.displayName);
        if (user.additionalUserInfo.isNewUser) {
          const cloudSnap = this.authServ.createProfileByCloudFn(
            user.user.displayName,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authServ.afterSignup())
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        } else {
          this.authServ.afterSignup();
        }
      })
      .catch((error) => this.onErrorAfterSignin(error));
  }
  cleanUpAfterSignin(hideLoading = false): void {
    this.formData.reset();
    this.formData.markAsUntouched();
    this.disableAllButtons = false;
    if (hideLoading) {
      this.isLoading = false;
    }
  }
  onErrorAfterSignin(error): void {
    this.authServ.onError(error.code);
    this.cleanUpAfterSignin(true);
  }
}
