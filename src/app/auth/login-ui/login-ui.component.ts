import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-login-ui',
  templateUrl: './login-ui.component.html',
  styleUrls: ['./login-ui.component.css'],
})
export class LoginUiComponent implements OnInit {
  @Input('type') view: 'login' | 'signup' = 'login';
  formData: FormGroup = new FormGroup({});
  isLoading: boolean = false;
  constructor(
    private authServ: AuthService,
    private snackServ: SnackbarService
  ) {}
  ngOnInit(): void {
    if (this.checkView())
      this.formData = new FormGroup({
        email: new FormControl(null, Validators.required),
        passw: new FormControl(null, Validators.required),
      });
    else
      this.formData = new FormGroup({
        name: new FormControl(null, Validators.required),
        email: new FormControl(null, Validators.required),
        passw: new FormControl(null, Validators.required),
      });
  }
  checkView() {
    return this.view == 'login';
  }
  onSubmit() {
    this.isLoading = true;
    if (!this.formData.valid) {
      this.snackServ.displayCustomMsg('Invalid Form! Please try again.');
    }
    if (this.checkView()) {
      const userData = {
        email: this.formData.get('email')?.value,
        passw: this.formData.get('passw')?.value,
        name: '',
      };
      let loginSnap = this.authServ.onlogin(userData);
      loginSnap
        .then(() => {
          this.authServ.afterSignin();
          this.isLoading = false;
        })
        .catch((error) => {
          this.isLoading = false;
          this.authServ.onError(error['code']);
        });
    } else {
      const userData = {
        email: this.formData.get('email')?.value,
        passw: this.formData.get('passw')?.value,
        name: this.formData.get('name')?.value,
      };
      let signupSnap = this.authServ.onSignup(userData);
      signupSnap
        .then((user) => {
          sessionStorage.setItem('name', userData.name);
          let cloudSnap = this.authServ.createProfileByClouddFn({
            name: userData.name,
            uid: user.user.uid,
          });
          cloudSnap
            .then(() => {
              this.authServ.afterSignup(userData.name);
              this.isLoading = false;
            })
            .catch((error) => this.authServ.onError(error['code']));
        })
        .catch((error) => {
          this.isLoading = false;
          this.authServ.onError(error['code']);
        });
    }
  }

  onForgotPassword() {
    this.authServ.onForgotPassword();
  }
  onGoogleLogin() {
    this.authServ.onGoogleSignin();
    // alert('currently disabled');
  }
  onFacebookLogin() {
    this.authServ.onFacebookSignin();
    // alert('currently disabled');
  }
}
