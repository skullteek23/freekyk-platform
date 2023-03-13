import { AuthService, authUser, confirmationResult, INDIAN_DIAL_PREFIX } from '@app/services/auth.service';
import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackbarService } from '@app/services/snackbar.service';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  readonly prefix = INDIAN_DIAL_PREFIX;

  authForm: FormGroup;
  otpForm: FormGroup;
  isLoaderShown = false;
  isInvalidOtp = false;
  otpConfirmation: confirmationResult = null;
  formInput = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];

  @ViewChildren('formRow') rows: any;

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
      number: new FormControl(null, [
        Validators.required,
        Validators.pattern(RegexPatterns.phoneNumber),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
    });
  }

  initOtpForm() {
    this.otpForm = this.toFormGroup(this.formInput);
  }

  toFormGroup(elements) {
    const group: any = {};
    elements.forEach(key => {
      group[key] = new FormControl('', [Validators.required, Validators.pattern(RegexPatterns.num)]);
    });
    return new FormGroup(group);
  }

  signupWithGoogle(): void {
    this.resetForm();
    this.isLoaderShown = true;
    this.authService.loginWithGoogle()
      .then(this.postSignup.bind(this))
      .catch((error) => {
        this.isLoaderShown = false;
        this.authService.handleAuthError(error);
      })
  }

  signupWithPhoneNumber() {
    if (this.authForm.valid) {
      this.isLoaderShown = true;
      this.initOtpForm();
      this.authService.signupWithPhoneNumber(this.number.value)
        .then(confirmationResult => {
          this.otpConfirmation = confirmationResult;
          setTimeout(() => {
            this.setFocusOnOtpDigit(0);
          }, 400);
        })
        .catch(error => {
          this.authService.resetCaptcha();
          this.authService.handleAuthError(error);
        })
        .finally(() => this.isLoaderShown = false)
    }
  }

  verifyOTP() {
    if (this.otpForm.valid) {
      this.isLoaderShown = true;
      const formValue = this.otpForm.value;
      let otp = '';
      for (const key in formValue) {
        if (formValue.hasOwnProperty(key)) {
          otp = otp.concat(formValue[key]);
        }
      }
      this.otpConfirmation.confirm(otp)
        .then((user) => {
          this.isInvalidOtp = false;
          this.postSignup(user);
        })
        .catch(error => {
          // Invalid OTP
          this.setFocusOnOtpDigit(0);
          this.isInvalidOtp = true;
          this.otpForm.reset();
        })
        .finally(() => {
          this.isLoaderShown = false;
        })
    }
  }

  postSignup(user: authUser) {
    this.isLoaderShown = false;
    alert('signed in!');
    this.router.navigate(['/dashboard/home'])
    // const name = this.name?.value.trim();
    // this.authService.createProfile(name, user.user.uid)
    //   .then(() => {
    //     sessionStorage.setItem('name', name);
    //     this.router.navigate(['/dashboard/participate'])
    //   })
    //   .catch((error) => this.authService.handleAuthError(error))
    //   .finally(() => this.isLoaderShown = false);
  }

  resetForm(): void {
    this.authForm.reset();
    this.authForm.markAsUntouched();
  }

  resetOtp(): void {
    this.isInvalidOtp = false;
    this.otpConfirmation = null;
    this.authService.resetCaptcha();
  }

  onNavigateBack() {
    this.resetOtp();
  }

  keyUpEvent(event, index) {
    let pos = index;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1;
    } else {
      pos = index + 1;
    }
    if (pos > -1 && pos < this.formInput.length) {
      this.setFocusOnOtpDigit(pos);
    }
    const element = document.getElementById('otp-verify-button');
    if (pos === this.formInput.length && element) {
      element.focus();
    }
  }

  setFocusOnOtpDigit(index: number) {
    if (this.rows._results[index].nativeElement) {
      this.rows._results[index].nativeElement.focus();
    }
  }

  get number() {
    return this.authForm.get('number');
  }

  get otp() {
    return this.otpForm.get('otp');
  }
}

// signup(): void {
//   if (this.authForm.valid) {
//     this.isLoaderShown = true;
//     const userData: logDetails = {
//       email: this.email?.value?.trim(),
//       password: 'this.password?.value?.trim()',
//       name: this.name?.value?.trim(),
//     };
//     this.authService.signup(userData)
//       .then(this.postSignup.bind(this))
//       .catch((error) => {
//         this.isLoaderShown = false;
//         this.authService.handleAuthError(error)
//       })
//   }
// }
