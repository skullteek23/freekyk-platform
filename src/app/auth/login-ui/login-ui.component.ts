import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { logDetails } from 'src/app/shared/interfaces/others.model';
import {
  EMAIL,
  ALPHA_W_SPACE,
  PASS_STRONG,
} from '../../shared/Constants/REGEX';
@Component({
  selector: 'app-login-ui',
  templateUrl: './login-ui.component.html',
  styleUrls: ['./login-ui.component.css'],
})
export class LoginUiComponent implements OnInit {
  @Input('type') view: 'login' | 'signup' = 'login';
  formData = new FormGroup({});
  disableAllButtons = false;
  isLoading = false;
  constructor(
    private authServ: AuthService,
    private snackServ: SnackbarService
  ) {}
  ngOnInit(): void {
    this.initForm();
  }

  isViewLogin() {
    return this.view == 'login';
  }

  initForm() {
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

  onForgotPassword() {
    this.authServ.onForgotPassword();
  }

  onSubmit() {
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
      let loginSnap = this.authServ.onlogin(userData);
      loginSnap
        .then(() => this.authServ.afterSignin())
        .catch((error) => this.onErrorAfterSignin(error))
        .finally(this.cleanUpAfterSignin.bind(this));
    } else {
      const userData: logDetails = {
        email: this.formData.get('email')?.value,
        pass: this.formData.get('pass')?.value,
        name: this.formData.get('name')?.value,
      };
      let signupSnap = this.authServ.onSignup(userData);
      signupSnap
        .then((user) => {
          sessionStorage.setItem('name', userData.name);
          let cloudSnap = this.authServ.createProfileByCloudFn(
            userData.name,
            user.user.uid
          );
          cloudSnap
            .then(() => this.authServ.afterSignup(userData.name))
            .catch((error) => this.onErrorAfterSignin(error))
            .finally(this.cleanUpAfterSignin.bind(this));
        })
        .catch((error) => this.onErrorAfterSignin(error));
    }
  }

  onGoogleLogin() {
    this.disableAllButtons = true;
    this.authServ
      .onGoogleSignin()
      .then((user) => {
        sessionStorage.setItem('name', user.user.displayName);
        let cloudSnap = this.authServ.createProfileByCloudFn(
          user.user.displayName,
          user.user.uid
        );
        cloudSnap
          .then(() => this.authServ.afterSignup(user.user.displayName))
          .catch((error) => this.onErrorAfterSignin(error))
          .finally(this.cleanUpAfterSignin.bind(this));
      })
      .catch((error) => this.onErrorAfterSignin(error));
  }

  onFacebookLogin() {
    this.disableAllButtons = true;
    this.authServ
      .onFacebookSignin()
      .then((user) => {
        sessionStorage.setItem('name', user.user.displayName);
        let cloudSnap = this.authServ.createProfileByCloudFn(
          user.user.displayName,
          user.user.uid
        );
        cloudSnap
          .then(() => this.authServ.afterSignup(user.user.displayName))
          .catch((error) => this.onErrorAfterSignin(error))
          .finally(this.cleanUpAfterSignin.bind(this));
      })
      .catch((error) => this.onErrorAfterSignin(error));
  }
  cleanUpAfterSignin(hideLoading = false) {
    this.formData.reset();
    this.formData.markAsUntouched();
    this.disableAllButtons = false;
    if (hideLoading) {
      this.isLoading = false;
    }
  }
  onErrorAfterSignin(error) {
    this.authServ.onError(error['code']);
    this.cleanUpAfterSignin(true);
  }
}
