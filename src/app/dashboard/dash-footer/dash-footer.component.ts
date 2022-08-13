import { Component } from '@angular/core';
import { FOOTER } from 'src/app/shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-dash-footer',
  templateUrl: './dash-footer.component.html',
  styleUrls: ['./dash-footer.component.css'],
})
export class DashFooterComponent {
  readonly COPYRIGHT = FOOTER.copyright;
  constructor() {}
}
