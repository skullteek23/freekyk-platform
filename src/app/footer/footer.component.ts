import { Component, OnInit } from '@angular/core';
import { FOOTER } from '@shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  readonly COPYRIGHT = FOOTER.copyright;
  productLinks = FOOTER.product;
  aboutLinks = FOOTER.about;
  constructor() { }
  ngOnInit(): void { }
}
