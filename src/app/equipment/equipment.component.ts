import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from '../services/social-share.service';
import { LOREM_IPSUM_SHORT } from '../shared/Constants/CONSTANTS';
import { ShareData } from '../shared/interfaces/others.model';
import { ProdBasicInfo } from '../shared/interfaces/product.model';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.css'],
})
export class EquipmentComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  columns: any;
  cardHeight: string = '';
  isLoading = true;
  noProducts = false;
  allProducts$: Observable<ProdBasicInfo[]>;
  tempProductsArr: number[] = [];
  prodFilters = ['Product Type', 'Product Category', 'Brand', 'Price'];
  constructor(
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore,
    private shareServ: SocialShareService
  ) {
    this.watcher = this.mediaObs
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
      });
  }
  ngOnInit(): void {
    this.getProducts();
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getProducts() {
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
              <ProdBasicInfo>{ id: doc.id, ...(<ProdBasicInfo>doc.data()) }
          )
        )
      );
  }
  getDate() {
    return new Date();
  }
  onShare(prod: ProdBasicInfo) {
    const sData: ShareData = {
      share_desc: LOREM_IPSUM_SHORT,
      share_imgpath: prod.imgpath,
      share_title: prod.name,
      share_url:
        'https://freekyk8--h-qcd2k7n4.web.app/equipment/product/' + prod.id,
    };
    this.shareServ.onShare(sData);
  }
}
