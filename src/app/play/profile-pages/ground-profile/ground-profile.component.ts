import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import {
  GroundBasicInfo,
  GroundMoreInfo,
} from '@shared/interfaces/ground.model';

@Component({
  selector: 'app-ground-profile',
  templateUrl: './ground-profile.component.html',
  styleUrls: ['./ground-profile.component.css'],
})
export class GroundProfileComponent implements OnInit {
  groundInfo$: Observable<GroundBasicInfo>;
  groundMoreInfo$: Observable<GroundMoreInfo>;
  grName: string;
  grImgpath: string;
  grId: string;
  isLoading = true;
  error = false;
  constructor(
    private ngFire: AngularFirestore,
    private route: ActivatedRoute,
    private enlServ: EnlargeService,
    private router: Router
  ) { }
  ngOnInit(): void {
    const GroundId = this.route.snapshot.params.groundid;
    this.getGroundInfo(GroundId);
  }
  getGroundInfo(gid: string): void {
    this.groundInfo$ = this.ngFire
      .collection('grounds')
      .doc(gid)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getGroundMoreInfo(gid);
            this.grName = (resp.data() as GroundBasicInfo).name;
            this.grImgpath = (resp.data() as GroundBasicInfo).imgpath;
            this.grId = gid;
          } else {
            this.error = !resp.exists;
            this.router.navigate(['error']);
          }
        }),
        map((resp) => resp?.data() as GroundBasicInfo),
        share()
      );
  }
  getGroundMoreInfo(gid: string): void {
    this.groundMoreInfo$ = this.ngFire
      .collection('grounds/' + gid + '/additionalInfo')
      .doc('moreInfo')
      .get()
      .pipe(
        tap(() => (this.isLoading = false)),
        map((resp) => resp.data() as GroundMoreInfo),
        share()
      );
  }
  getFieldType(type: 'FG' | 'SG' | 'HG' | 'AG' | 'TURF'): string {
    switch (type) {
      case 'FG':
        return 'Full Ground';
      case 'SG':
        return 'Short Ground';
      case 'HG':
        return 'Huge Ground';
      case 'AG':
        return 'Agile Ground';
      case 'TURF':
        return 'Football Turf';
      default:
        return 'Not Available';
    }
  }
  onEnlargePhoto(): void {
    this.enlServ.onOpenPhoto(this.grImgpath);
  }
}
