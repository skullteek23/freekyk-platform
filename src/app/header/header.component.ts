import { Component, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, share } from 'rxjs/operators';
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
  @Output() menOpen = new Subject<boolean>();
  isLoading = true;
  isLogged = false;
  menuState: boolean;
  sidenavOpen: boolean;
  profilePicture$: Observable<string | null>;
  playSublinks: string[] = [];
  fsSublinks: string[] = [];
  dashSublinks: string[] = [];
  morelinks: { name: string; route: string }[] = [];
  selectedSubLinks: string[] = [];
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
    this.profilePicture$ = this.avatarServ.getProfilePicture();
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
  onToggleMenu(): void {
    this.sidenavOpen = false;
    this.menuState = !this.menuState;
    this.menOpen.next(this.menuState);
  }
  onCloseMenu(): void {
    this.sidenavOpen = false;
    this.menuState = false;
    this.menOpen.next(this.menuState);
  }
  onLogout(): void {
    this.sidenavOpen = false;
    this.assignSelected(null);
    this.dialog.open(LogoutComponent);
  }

  onUpdateSubLinks(linkName: 'dashboard' | 'play' | 'freestyle'): void {
    this.assignSelected(linkName);
    switch (linkName) {
      case 'dashboard':
        this.selectedSubLinks = this.dashSublinks;
        break;
      case 'play':
        this.selectedSubLinks = this.playSublinks;
        break;
      case 'freestyle':
        this.selectedSubLinks = this.fsSublinks;
        break;
      default:
        this.selectedSubLinks = [];
    }
    this.sidenavOpen = true;
  }

  assignSelected(value: 'dashboard' | 'play' | 'freestyle' | null): void {
    this.selected = value;
  }
}
