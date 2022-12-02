import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Formatters, GroundBasicInfo } from '@shared/interfaces/ground.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-view-grounds-table',
  templateUrl: './view-grounds-table.component.html',
  styleUrls: ['./view-grounds-table.component.scss']
})
export class ViewGroundsTableComponent implements OnInit {

  cols = ['sno', 'ground', 'location', 'fieldType'];
  grounds: GroundBasicInfo[] = [];
  subscriptions = new Subscription();
  formatter: any;

  constructor(
    private ngFire: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formatter = Formatters;
    this.getGrounds();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getGrounds(): void {
    this.subscriptions.add(this.ngFire.collection('grounds').snapshotChanges()
      .pipe(
        map((docs) => docs.map((doc) => ({ id: doc.payload.doc.id, ...(doc.payload.doc.data() as GroundBasicInfo), } as GroundBasicInfo))),
        map(resp => resp.sort(ArraySorting.sortObjectByKey('name')))
      )
      .subscribe((resp) => (this.grounds = resp)));
  }

  registerGround() {
    this.router.navigate(['/grounds/register']);
  }
}
