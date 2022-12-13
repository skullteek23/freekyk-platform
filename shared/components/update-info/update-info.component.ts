import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.scss'],
})
export class UpdateInfoComponent implements OnInit {
  pass = '';
  rePass = '';
  newPassForm: FormGroup = new FormGroup({});
  newEmailForm: FormGroup = new FormGroup({});
  constructor(
    public dialogRef: MatDialogRef<UpdateInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: 'email' | 'password',
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.newEmailForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
    });
    this.newPassForm = new FormGroup({
      pass: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      conf_pass: new FormControl(null, [Validators.required, this.validateAreEqual.bind(this)]),
    });
  }
  onDialogClose() {
    this.dialogRef.close();
  }
  validateAreEqual(fieldControl: FormControl) {
    return fieldControl.value === this.newPassForm.get('pass')?.value
      ? null
      : { NotEqual: true, };
  }

  onChangeSubmit() {
    if (this.data == 'email') {
      this.authService.onChangeEmail(this.newEmailForm.get('email')?.value);
    } else {
      this.authService.onChangePassword(this.newPassForm.get('pass')?.value);
    }
    this.onDialogClose();
  }
}
