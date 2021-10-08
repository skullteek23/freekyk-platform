import { Component, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { AccountAvatarService } from '../services/account-avatar.service';
import { NotificationsService } from '../services/notifications.service';
import { RouteLinks } from '../shared/Constants/ROUTE_LINKS';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output('menOpen') onChangeMenuState = new Subject<boolean>();
  isLoading: boolean = true;
  isLogged: boolean = false;
  menuState: boolean;
  sidenavOpen: boolean;
  profile_picture$: Observable<string | null>;
  playSublinks: string[] = [];
  fsSublinks: string[] = [];
  dashSublinks: string[] = [];
  morelinks: { name: string; route: string }[] = [];
  curr_sublinks: string[] = [];
  selected: 'dashboard' | 'play' | 'freestyle' | null = null;
  notifCount$: Observable<number | string>;
  constructor(
    private dialog: MatDialog,
    private ngAuth: AngularFireAuth,
    private notifServ: NotificationsService,
    private avatarServ: AccountAvatarService
  ) {}
  ngOnInit(): void {
    this.menuState = false;
    this.sidenavOpen = false;
    this.profile_picture$ = this.avatarServ.getProfilePicture();
    this.ngAuth.user.subscribe((user) => {
      if (user !== null) {
        this.isLogged = true;
        this.notifCount$ = this.notifServ.notifsCountChanged.pipe(
          map((resp) => (!!resp ? resp : 0)),
          map((resp) => (resp > 5 ? '5+' : resp)),
          share()
        );
      } else {
        this.isLogged = false;
      }
      this.isLoading = false;
    });

    this.dashSublinks = RouteLinks.DASHBOARD;
    this.playSublinks = RouteLinks.PLAY;
    this.fsSublinks = RouteLinks.FREESTYLE;
    this.morelinks = [
      { name: RouteLinks.OTHERS[0], route: `/${RouteLinks.OTHERS[0]}` },

      { name: RouteLinks.OTHERS[1], route: `/${RouteLinks.OTHERS[1]}` },
    ];
  }
  onToggleMenu() {
    this.sidenavOpen = false;
    this.menuState = !this.menuState;
    this.onChangeMenuState.next(this.menuState);
  }
  onCloseMenu() {
    this.sidenavOpen = false;
    this.menuState = false;
    this.onChangeMenuState.next(this.menuState);
  }
  onLogout() {
    this.sidenavOpen = false;
    this.assignSelected(null);
    this.dialog.open(LogoutComponent);
  }

  onUpdateSubLinks(linkName: 'dashboard' | 'play' | 'freestyle') {
    this.assignSelected(linkName);
    switch (linkName) {
      case 'dashboard':
        this.curr_sublinks = this.dashSublinks;
        break;
      case 'play':
        this.curr_sublinks = this.playSublinks;
        break;
      case 'freestyle':
        this.curr_sublinks = this.fsSublinks;
        break;
      default:
        this.curr_sublinks = [];
    }
    this.sidenavOpen = true;
  }

  assignSelected(value: 'dashboard' | 'play' | 'freestyle' | null) {
    this.selected = value;
  }
}
