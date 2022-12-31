import { Component } from '@angular/core';
import { TERMS_AND_CONDITIONS } from '@shared/web-content/LEGAL_CONTENT';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent {

  readonly miniDescription = TERMS_AND_CONDITIONS.shortDescription;
  readonly content = TERMS_AND_CONDITIONS.text;

  constructor() { }
}
