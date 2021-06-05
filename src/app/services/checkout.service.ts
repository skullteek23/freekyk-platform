import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { userAddress } from '../shared/interfaces/others.model';
import { SnackbarService } from './snackbar.service';
@Injectable()
export class CheckoutService implements OnDestroy {
  delAddr: userAddress = null;
  stepChanged = new Subject<boolean>();
  setDelAddr(addr: userAddress) {
    this.delAddr = addr;
    console.log('Address Set!');
    console.log(this.delAddr);
    this.onChangeStep(true);
  }
  getAddr() {
    return this.delAddr;
  }
  saveAddressToSever(addr: userAddress) {
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection(`players/${uid}/Addresses`)
      .doc(addr.id)
      .set(addr)
      .then(() => {
        this.snackServ.displayCustomMsg('Address saved successfully!');
      });
  }
  onChangeStep(dir: boolean) {
    this.stepChanged.next(dir);
  }
  ngOnDestroy() {
    console.log('checkout service ended');
  }
  constructor(
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    console.log('checkout service started');
  }
}
