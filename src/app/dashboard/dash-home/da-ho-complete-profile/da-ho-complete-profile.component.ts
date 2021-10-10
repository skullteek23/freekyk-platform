import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, share, shareReplay, take, tap } from 'rxjs/operators';
import { RouteLinks } from 'src/app/shared/Constants/ROUTE_LINKS';
import { UploadphotoComponent } from '../../dialogs/uploadphoto/uploadphoto.component';
import { DashState } from '../../store/dash.reducer';
@Component({
  selector: 'app-da-ho-complete-profile',
  templateUrl: './da-ho-complete-profile.component.html',
  styleUrls: ['./da-ho-complete-profile.component.css'],
})
export class DaHoCompleteProfileComponent implements OnInit {
  @Output() profileComplete = new Subject<boolean>();
  data$: Observable<{ photo: boolean; profile: boolean; team: boolean }>;
  profileProgress = 20;
  isLoading = true;
  constructor(
    private store: Store<{ dash: DashState }>,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        }
      })
    );
  }
  onUploadProfilePhoto(): void {
    this.dialog.open(UploadphotoComponent, {
      panelClass: 'large-dialogs',
    });
  }
  onOpenTeamBox(): void {
    this.router.navigate(['/dashboard', RouteLinks.DASHBOARD[1]]);
  }
  onShareProfile(): void {
    if (this.profileProgress >= 80) {
      this.profileProgress += 20;
    }
    const uid = localStorage.getItem('uid');
    this.router.navigate(['/p', uid]);
  }
}
