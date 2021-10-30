import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FREESTYLE_PAGE,
  LANDING_PAGE,
} from 'src/app/shared/Constants/WEBSITE_CONTENT';

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
  @Input() formCTA = 'Get Started';
  @Input() enablePartnerForm = false;
  @Input() enableFreestyleTrainingForm = false;
  private partnerForm = LANDING_PAGE.partnerWithUsFormLink;
  private trainingForm = FREESTYLE_PAGE.trainingFormLink;
  constructor(private router: Router) {}
  ngOnInit(): void {}
  onNavigate(route: string): void {
    this.router.navigate([route]);
  }
  onNavigateToForms(): void {
    if (this.enablePartnerForm) {
      this.onNavigateToPartnerForm();
    } else if (this.enableFreestyleTrainingForm) {
      this.onNavigateToTrainingForm();
    }
  }
  onNavigateToPartnerForm(): void {
    window.open(this.partnerForm, '_blank');
  }
  onNavigateToTrainingForm(): void {
    window.open(this.trainingForm, '_blank');
  }
}
