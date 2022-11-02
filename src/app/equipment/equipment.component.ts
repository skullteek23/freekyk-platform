import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ProdBasicInfo } from '@shared/interfaces/product.model';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss'],
})
export class EquipmentComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  columns: any;
  cardHeight = '';
  isLoading = true;
  noProducts = false;
  allProducts$: Observable<ProdBasicInfo[]>;
  tempProductsArr: number[] = [];
  prodFilters = ['Product Type', 'Product Category', 'Brand', 'Price'];
  constructor(
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore
  ) { }
  ngOnInit(): void {
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'xs') {
            this.columns = 2;
            this.cardHeight = '260px';
          } else if (change.mqAlias === 'sm') {
            this.columns = 3;
            this.cardHeight = '300px';
          } else {
            this.columns = 4;
            this.cardHeight = '300px';
          }
        })
    );
    this.getProducts();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getProducts(): void {
    this.allProducts$ = this.ngFire
      .collection('products')
      .get()
      .pipe(
        tap((val) => {
          this.isLoading = false;
          this.noProducts = val.empty;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
            ({
              id: doc.id,
              ...(doc.data() as ProdBasicInfo),
            } as ProdBasicInfo)
          )
        )
      );
  }
  getDate(): Date {
    return new Date();
  }
  onShare(prod: ProdBasicInfo): void { }
}
