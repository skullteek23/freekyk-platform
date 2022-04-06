import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { coupon } from '../../shared/interfaces/product.model';

@Component({
  selector: 'app-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.css'],
})
export class AddCouponComponent implements OnInit {
  coupForm: FormGroup = new FormGroup({});
  constructor(
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    this.coupForm = new FormGroup({
      code: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Z0-9 -]*$'),
        Validators.maxLength(15),
      ]),
      type: new FormControl('discount in percentage', [Validators.required]),
      discount: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }

  ngOnInit(): void {}
  onSubmit() {
    this.saveFormToServer(this.coupForm.value);
  }
  saveFormToServer(formData: {}) {
    const newCoupon: coupon = {
      code: formData['code'],
      type: formData['type'],
      discount: formData['discount'],
    };

    this.ngFire
      .collection('coupons')
      .add(newCoupon)
      .then(() => {
        this.snackServ.displayCustomMsg('Coupon added successfully!');
        this.coupForm.reset();
      });
  }
  onAutofill() {
    this.coupForm.setValue({
      code: 'FREE 10',
      type: 'discount in percentage',
      discount: 10,
    });
    this.saveFormToServer(this.coupForm.value);
  }
}
