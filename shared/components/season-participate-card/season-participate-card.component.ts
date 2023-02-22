import { Component, Input, OnInit, Output } from '@angular/core';
import { EnlargeService } from '@app/services/enlarge.service';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { Formatters } from '@shared/interfaces/team.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-season-participate-card',
  templateUrl: './season-participate-card.component.html',
  styleUrls: ['./season-participate-card.component.scss']
})
export class SeasonParticipateCardComponent implements OnInit {

  @Input() season: SeasonBasicInfo = null;
  @Output() openCheckout = new Subject<void>();
  @Output() openOffers = new Subject<void>();
  formatter = Formatters;

  constructor(
    private enlargeService: EnlargeService
  ) { }

  ngOnInit(): void {
  }

  enlargePhoto(url: string) {
    this.enlargeService.onOpenPhoto(url)
  }

  openOffer() {
    this.openOffers.next();
  }

  initCheckoutFlow() {
    this.openCheckout.next();
  }

}
