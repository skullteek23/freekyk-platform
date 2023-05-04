import { Component, Input } from '@angular/core';
import { ILink } from '@shared/constants/ROUTE_LINKS';


@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent {
  @Input() links: ILink[] = [];
}
