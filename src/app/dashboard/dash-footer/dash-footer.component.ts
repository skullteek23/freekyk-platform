import { Component } from '@angular/core';
import { FOOTER } from '@shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-dash-footer',
  templateUrl: './dash-footer.component.html',
  styleUrls: ['./dash-footer.component.scss'],
})
export class DashFooterComponent {
  readonly COPYRIGHT = FOOTER.copyright;
  constructor() { }
}
