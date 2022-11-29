import { Component, Input } from '@angular/core';
import { IGroundInfo } from '@shared/interfaces/ground.model';

@Component({
  selector: 'app-ground-slots',
  templateUrl: './ground-slots.component.html',
  styleUrls: ['./ground-slots.component.scss']
})
export class GroundSlotsComponent {

  @Input() groundsList: Partial<IGroundInfo>[] = [];
}
