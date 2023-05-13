import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ISeason, statusType } from '@shared/interfaces/season.model';
import { SeasonAdminService } from '../../../services/season-admin.service';
import { Formatters } from '@shared/interfaces/match.model';
import { AdminApiService } from '@admin/services/admin-api.service';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-view-seasons-table',
  templateUrl: './view-seasons-table.component.html',
  styleUrls: ['./view-seasons-table.component.scss']
})
export class ViewSeasonsTableComponent implements OnInit {

  // cols = ['sno', 'season', 'startDate', 'status'];
  // seasons: ISeason[] = [];
  // subscriptions = new Subscription();
  formatter: any;
  upcomingSeasons: ISeason[] = [];
  finishedSeasons: ISeason[] = [];
  isLoaderShown = false;

  constructor(
    private ngFire: AngularFirestore,
    private router: Router,
    private seasonAdminService: SeasonAdminService,
    private adminApiService: AdminApiService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getSeasons();
    this.formatter = Formatters;
  }

  getSeasons(): void {
    this.showLoader();
    this.adminApiService.getSeasons().subscribe({
      next: (response) => {
        if (response) {
          this.upcomingSeasons = response.filter(season => season.status === 'PUBLISHED');
          this.finishedSeasons = response.filter(season => season.status === 'FINISHED' || season.status === 'CANCELLED' || season.status === 'REMOVED');
        }
        this.hideLoader();
      },
      error: () => {
        this.hideLoader();
        this.snackbarService.displayError('Error: Unable to get seasons list!');
      }
    })
    // const uid = sessionStorage.getItem('uid');
    // if (uid) {
    //   this.ngFire.collection('admins').doc(uid).get().subscribe(response => {
    //     if (response && response.exists) {
    //       const data = response.data() as Admin;
    //       let queryFn = (query) => query;
    //       if (data.role !== AssignedRoles.superAdmin) {
    //         queryFn = query => query.where('createdBy', '==', uid)
    //       }
    //       this.subscriptions.add(this.ngFire.collection('seasons', queryFn).snapshotChanges()
    //         .pipe(
    //           map((docs) => docs.map((doc) => ({ id: doc.payload.doc.id, ...(doc.payload.doc.data() as ISeason), } as ISeason))),
    //           map(resp => resp.sort(ArraySorting.sortObjectByKey('name', 'desc')))
    //         )
    //         .subscribe((resp) => (this.seasons = resp)));
    //     }
    //   })
    // }
  }

  onSelectSeason(season: ISeason) {
    this.router.navigate(['/seasons', season.id]);
  }

  // createSeason() {
  //   this.router.navigate(['/seasons/create']);
  // }

  isSeasonLive(status: statusType): boolean {
    return this.seasonAdminService.isSeasonLive(status);
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

  // isSeasonFinished(status: statusType): boolean {
  //   return this.seasonAdminService.isSeasonFinished(status);
  // }

  // isSeasonCancelled(status: statusType): boolean {
  //   return this.seasonAdminService.isSeasonCancelled(status);
  // }

  // getStatusClass(status: statusType): any {
  //   return this.seasonAdminService.getStatusClass(status);
  // }
}
