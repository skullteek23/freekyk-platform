import { Component } from '@angular/core';
import { PRIVACY_POLICY } from '@shared/Constants/LEGAL_CONTENT';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent {

  readonly description = PRIVACY_POLICY.miniDescription;
  readonly content = PRIVACY_POLICY.text;

  constructor() { }
}
