import { Component, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UploadphotoComponent } from '../../dialogs/uploadphoto/uploadphoto.component';
import { DashState } from '../../store/dash.reducer';
@Component({
  selector: 'app-da-ho-complete-profile',
  templateUrl: './da-ho-complete-profile.component.html',
  styleUrls: ['./da-ho-complete-profile.component.scss'],
})
export class DaHoCompleteProfileComponent implements OnInit {

  @Output() profileComplete = new Subject<boolean>();

  data$: Observable<{ photo: boolean; profile: boolean; team: boolean }>;
  profileProgress = 20;
  isLoading = true;
  profileShared: boolean;

  constructor(
    private store: Store<{ dash: DashState }>,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    const shareStatus = JSON.parse(localStorage.getItem(uid));
    this.profileShared = shareStatus ? shareStatus.isProfileShared : false;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.data$ = this.store.select('dash').pipe(
      map(
        (resp) =>
        ({
          photo: !!resp.playerBasicInfo.imgpath_sm,
          profile: !!resp.playerMoreInfo.profile,
          team: !!resp.hasTeam,
        } as { photo: boolean; profile: boolean; team: boolean })
      ),
      tap((resp) => {
        if (this.profileProgress <= 20) {
          this.profileProgress += resp.photo ? 20 : 0;
          this.profileProgress += resp.profile ? 20 : 0;
          this.profileProgress += resp.team ? 20 : 0;
          if (this.profileProgress < 100) {
            this.profileProgress += this.profileShared ? 20 : 0;
          }
        }
        if (this.profileProgress === 100) {
          this.profileComplete.next(true);
        }
      }),
    );
  }

  onUploadProfilePhoto(): void {
    this.dialog
      .open(UploadphotoComponent, {
        panelClass: 'large-dialogs',
      })
      .afterClosed()
      .subscribe(() => location.reload());
  }

  onOpenTeamBox(): void {
    this.router.navigate(['/dashboard', 'team-management']);
  }

  onShareProfile(): void {
    const uid = localStorage.getItem('uid');
    if (this.profileShared) {
      this.router.navigate(['/play/players', uid]);
      return;
    }
    if (this.profileProgress >= 80) {
      this.profileProgress += 20;
    }
    localStorage.setItem(uid, JSON.stringify({ isProfileShared: true }));
    this.router.navigate(['/play/players', uid]);
  }
}
