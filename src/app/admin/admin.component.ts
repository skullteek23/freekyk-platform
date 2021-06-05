import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit, OnDestroy {
  // UIDs = [
  //   '33KtAWVs6jbVzqSXVqsCebZyMLX2',
  //   'DPCp55uy3nNKYzu9SMyPsZ7rixx1',
  //   'VAtAEBdJpTSLyr5e5hbm1rhVWqx2',
  //   'XBjH43uyeTfifDBJPjc0SJy8hbV2',
  //   'p2Jcv9mhG3O9uwDybpXVnlumlWg2',
  //   's2XM1E5zmVejceL4sOYnKx2asyE3',
  //   'u4871F6Pq6SZ0h0BSFLNHcjZ19i2',
  // ];
  // teams = [
  //   'Blasters FC',
  //   'Annihilation FC',
  //   'Fusers FC',
  //   'Real Madrid FC',
  //   'Gardenia FC',
  //   'Lone Wolf FC',
  //   'Oscar Delta FC',
  // ];
  // players = [
  //   'Paras Jam',
  //   'Naman Pandey',
  //   'Oshu Ghul',
  //   'Sirhud Kalra',
  //   'Chinu Srivastav',
  //   'Vishal Tomar',
  //   'Shubham Kashyap',
  //   'Mintu Pandey',
  //   'Chintu Rohilla',
  //   'Dhruv Rathi',
  // ];
  cols: number;
  watcher: Subscription;
  constructor(private mediaObs: MediaObserver) {
    this.watcher = this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.cols = 1;
        } else if (change.mqAlias === 'sm') {
          this.cols = 2;
        } else {
          this.cols = 3;
        }
      });
  }

  ngOnInit(): void {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
