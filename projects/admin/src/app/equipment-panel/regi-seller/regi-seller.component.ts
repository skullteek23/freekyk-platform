import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { sellerInfo } from '../../shared/interfaces/product.model';

@Component({
  selector: 'app-regi-seller',
  templateUrl: './regi-seller.component.html',
  styleUrls: ['./regi-seller.component.css'],
})
export class RegiSellerComponent implements OnInit {
  sellerForm: FormGroup = new FormGroup({});
  states = ['Uttar Pradesh'];
  cities = ['Ghaziabad'];
  constructor(
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    this.sellerForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z ]*$'),
        Validators.maxLength(80),
      ]),
      locCity: new FormControl(null, Validators.required),
      locState: new FormControl(0, Validators.required),
      licNo: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Z0-9]*$'),
        Validators.maxLength(80),
      ]),
      addr: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9:,. _-]*$'),
        Validators.maxLength(80),
      ]),
      pincode: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      phNo: new FormControl(null, [
        Validators.required,
        Validators.maxLength(10),
      ]),
    });
  }

  ngOnInit(): void {}
  onSubmit() {
    this.saveFormToServer(this.sellerForm.value);
  }
  saveFormToServer(formData: {}) {
    const sUID = 'asfajs12312';
    const newSeller: sellerInfo = {
      name: formData['name'],
      locCity: formData['locCity'],
      locState: formData['locState'],
      licNo: formData['licNo'],
      addr: formData['addr'],
      pincode: formData['pincode'],
      phNo: formData['phNo'],
      sUID: sUID,
    };

    this.ngFire
      .collection('sellers')
      .add(newSeller)
      .then(() => {
        this.snackServ.displayCustomMsg('Seller Registered successfully!');
        this.sellerForm.reset();
      });
  }
  onAutofill() {
    const sUID = 'asfajs';
    this.sellerForm.setValue({
      name: 'New Seller',
      locCity: 'Ghaziabad',
      locState: 'Uttar Pradesh',
      licNo: 'MCIN099184123',
      addr: 'Sec 12, House No. 485 Deplux Vasundhara, Ghaziabad, Uttar Pradesh',
      pincode: '201012',
      phNo: '9718354567',
    });
    this.saveFormToServer(this.sellerForm.value);
  }
}
