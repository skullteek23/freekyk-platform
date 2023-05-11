import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, Output } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MOBILE_LINKS } from '@admin/constants/constants';
import { ILink } from '@shared/constants/ROUTE_LINKS';
import { AuthService } from '@admin/services/auth.service';
import { authUserMain } from '@shared/interfaces/user.model';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {

  @Output() menOpen = new Subject<boolean>();

  mobileLinks = MOBILE_LINKS;
  menuState = false;
  treeControl = new NestedTreeControl<ILink>(node => node.subLinks);
  dataSource = new MatTreeNestedDataSource<ILink>();
  user: authUserMain = null;

  hasChild = (_: number, node: ILink) => !!node.subLinks && node.subLinks.length > 0;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.authService.getUser().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.mobileLinks.push({ name: 'Logout', isLogout: true, icon: 'logout' });
        } else {
          this.user = null;
        }
        this.dataSource.data = this.mobileLinks;
      }
    })
  }



  scrollTop() {
    window.scrollTo(0, 0);
  }

  onToggleMenu(): void {
    this.menuState = !this.menuState;
    this.menOpen.next(this.menuState);
  }

  onCloseMenu(): void {
    this.menuState = false;
    this.menOpen.next(this.menuState);
  }

  onLogout(): void {
    this.onCloseMenu();
    this.authService.logOut();
    this.mobileLinks.pop();
    this.dataSource.data = this.mobileLinks;
  }

  openLink(link: ILink) {
    this.onCloseMenu();
    if (link.route) {
      this.router.navigate([link.route]);
    } else if (link.externalLink) {
      window.open(link.externalLink, '_blank');
    } else if (link.isLogout) {
      this.onLogout();
    }
  }
}
