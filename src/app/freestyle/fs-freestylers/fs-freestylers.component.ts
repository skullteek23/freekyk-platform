import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { FreestylerCardComponent } from 'src/app/shared/dialogs/freestyler-card/freestyler-card.component';
import { FsBasic } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-fs-freestylers',
  templateUrl: './fs-freestylers.component.html',
  styleUrls: ['./fs-freestylers.component.css'],
})
export class FsFreestylersComponent implements OnInit, OnDestroy {
  onMobile: boolean = false;
  isLoading = true;
  noFreestylers = false;
  watcher: Subscription;
  freestylers$: Observable<FsBasic[]>;
  columns: number = 1;
  fsFilters = ['Location'];
  constructor(
    private dialog: MatDialog,
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore
  ) {
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.onMobile = true;
        } else if (change.mqAlias === 'sm') {
          this.onMobile = true;
        } else if (change.mqAlias === 'md') {
          this.onMobile = false;
          this.columns = 3;
        } else {
          this.onMobile = false;
          this.columns = 4;
        }
      });
  }
  ngOnInit(): void {
    this.getFreestylers();
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getFreestylers() {
    this.freestylers$ = this.ngFire
      .collection('freestylers')
      .get()
      .pipe(
        tap((val) => {
          this.noFreestylers = val.empty;
          this.isLoading = false;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) => <FsBasic>{ id: doc.id, ...(<FsBasic>doc.data()) }
          )
        )
      );
  }
  onOpenIgProfile(add: string) {
    window.open(add, '_blank');
  }
  onOpenPlayerProfile(data: FsBasic) {
    const dialogRef = this.dialog.open(FreestylerCardComponent, {
      panelClass: 'fk-dialogs',
      data: data,
    });
  }
}
