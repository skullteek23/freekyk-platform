import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  ContestBasicInfo,
  ContestDescription,
} from '../../interfaces/contest.model';
import { myContestData } from '../../interfaces/others.model';

@Component({
  selector: 'app-contest-info',
  templateUrl: './contest-info.component.html',
  styleUrls: ['./contest-info.component.css'],
})
export class ContestInfoComponent implements OnInit {
  disablePayment: boolean = false;
  moreInfo$: Observable<ContestDescription>;
  constructor(
    private cartServ: CartService,
    private ngFire: AngularFirestore,
    public dialogRef: MatDialogRef<ContestInfoComponent>,
    private router: Router,
    private snackServ: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: ContestBasicInfo
  ) {
    this.getAdditionalInfo(data.id);
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  ngOnInit(): void {}
  getAdditionalInfo(contestId: string) {
    this.moreInfo$ = this.ngFire
      .collection('contests/' + contestId + '/additionalInfo')
      .doc('moreInfo')
      .get()
      .pipe(
        map((resp) => <ContestDescription>resp.data()),
        share()
      );
  }
  navigateToContests() {
    this.router.navigate(['freestyle', 'contests']);
  }
  onPayNow() {
    // this.cartServ.addContest({});
    // add to cart
    // go to payment gateway
    // compelte payment
    this.addContestToMyContests();
    this.router.navigate(['/dashboard/freestyle']);
    this.onCloseDialog();
  }
  addContestToMyContests() {
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection('freestylers/' + uid + '/myContestFs')
      .add(<myContestData>{
        cont_id: this.data.id,
        imgpath: this.data.imgpath,
        name: this.data.name,
        stage: 1,
      })
      .then(() =>
        this.snackServ.displayCustomMsg(
          "Payment Completed! You're now the participant of this contest"
        )
      );
  }
}
