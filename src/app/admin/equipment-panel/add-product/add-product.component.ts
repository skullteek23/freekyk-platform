import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { merge, Observable } from 'rxjs';
import {
  filter,
  map,
  share,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { LOREM_IPSUM_LONG } from 'src/app/shared/Constants/CONSTANTS';
import {
  ProdBasicInfo,
  ProdMoreInfo,
  sellerInfo,
} from 'src/app/shared/interfaces/product.model';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit, AfterViewInit {
  @ViewChild('sellers', { static: false }) selInput: MatSelect;
  prodForm: FormGroup = new FormGroup({});
  defaultImage =
    'https://images.unsplash.com/photo-1506079906501-adbb5907b720?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  pTypes = ['Football Shoes'];
  pBrands = ['Nike'];
  pSizes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  pColors = ['Red', 'Green', 'Blue', 'Grey', 'white', 'Black'];
  imgUpload: File;
  sellers$: Observable<string[]>;
  constructor(
    private ngStorage: AngularFireStorage,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    this.prodForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9 _-]*$'),
        Validators.maxLength(80),
      ]),
      imgpath: new FormControl(null, Validators.required),
      price: new FormControl(0, Validators.required),
      type: new FormControl(null, Validators.required),
      brand: new FormControl(null, Validators.required),
      size: new FormControl(null, Validators.required),
      color: new FormControl(null, Validators.required),
      seller: new FormControl(null, Validators.required),
      desc: new FormControl(null, [
        Validators.required,
        Validators.maxLength(300),
      ]),
      warrantyInfo: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
    });
  }
  ngAfterViewInit() {
    this.sellers$ = merge(this.selInput.openedChange).pipe(
      filter((resp) => resp == true),
      switchMap(() => {
        return this.ngFire
          .collection('sellers')
          .get()
          .pipe(
            map((resp) => resp.docs.map((doc) => (<sellerInfo>doc.data()).name))
          );
      })
    );
  }

  ngOnInit(): void {}
  async onSubmit() {
    let uploadSnap = await this.ngStorage.upload(
      '/equipmentImages' + Math.random() + this.imgUpload.name,
      this.imgUpload
    );
    uploadSnap.ref.getDownloadURL().then((path) => {
      this.prodForm.patchValue({
        imgpath: path,
      });
      this.saveFormToServer(this.prodForm.value);
    });
  }
  saveFormToServer(formData: {}) {
    const newProdId = this.ngFire.createId();
    const puid = 'asfajs';
    const newEquipment: ProdBasicInfo = {
      pUID: puid,
      name: formData['name'],
      brand: formData['brand'],
      type: formData['type'],
      price: formData['price'],
      imgpath: formData['imgpath'],
      id: newProdId,
    };
    const newEquipmentMore: ProdMoreInfo = {
      size: formData['size'],
      color: formData['color'],
      desc: formData['desc'],
      warrantyInfo: formData['warrantyInfo'],
      seller: formData['seller'],
    };
    let AllPromises = [];
    AllPromises.push(
      this.ngFire.collection('products').doc(newEquipment.id).set(newEquipment)
    );
    AllPromises.push(
      this.ngFire
        .collection('products')
        .doc(newEquipment.id)
        .collection('additionalInfo')
        .doc('specifications')
        .set(newEquipmentMore)
    );
    Promise.all(AllPromises).then(() => {
      this.snackServ.displayCustomMsg('Equipment Product added successfully!');
      this.prodForm.reset();
    });
  }
  onAutofill() {
    this.prodForm.setValue({
      name: 'Equipment',
      imgpath: this.defaultImage,
      price: '500',
      type: 'Football Shoes',
      brand: 'Nike',
      size: [8, 9, 10],
      color: ['Red', 'blue'],
      seller: 'WS Seller',
      desc: LOREM_IPSUM_LONG,
      warrantyInfo: '90 Days',
    });
    this.saveFormToServer(this.prodForm.value);
  }
  onBrowsePhoto(file: any) {
    this.imgUpload = file.target.files[0];
  }
}
