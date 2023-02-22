import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FREESTYLE_PAGE, LANDING_PAGE, } from '@shared/web-content/WEBSITE_CONTENT';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-action-strip',
  templateUrl: './action-strip.component.html',
  styleUrls: ['./action-strip.component.scss'],
})
export class ActionStripComponent implements OnInit {

  @Input() elementSpacing = 'space-between center';
  @Input('compact') isCompact = false;
  @Input('heading') headingText = 'ready to play football?';
  @Input() formCTA = 'Get Started';
  @Input() enablePartnerForm = false;
  @Input() enableFreestyleTrainingForm = false;

  readonly partnerForm = environment.forms.partner;
  readonly trainingForm = FREESTYLE_PAGE.trainingFormLink;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void { }

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
