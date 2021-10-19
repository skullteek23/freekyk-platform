import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LANDING_PAGE } from 'src/app/shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-action-strip',
  templateUrl: './action-strip.component.html',
  styleUrls: ['./action-strip.component.css'],
})
export class ActionStripComponent implements OnInit {
  // tslint:disable: no-input-rename
  @Input() elementSpacing = 'space-between center';
  @Input('compact') isCompact = false;
  @Input('heading') headingText = 'ready to play football?';
  @Input() primaryCTA = 'Get Started';
  @Input() enablePartnerForm = false;
  private partnerForm = LANDING_PAGE.partnerWithUsFormLink;
  constructor(private router: Router) {}
  ngOnInit(): void {}
  onNavigate(route: string): void {
    this.router.navigate([route]);
  }
  onNavigateToPartnerForm(): void {
    window.open(this.partnerForm, '_blank');
  }
}
