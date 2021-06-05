import { Component, Input, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-gallery-card',
  templateUrl: './gallery-card.component.html',
  styleUrls: ['./gallery-card.component.css'],
})
export class GalleryCardComponent implements OnInit {
  @Input() photos: string[] = [];
  constructor(private teServ: TeamService) {}
  ngOnInit(): void {}
  onOpenTeamSettings() {
    this.teServ.onOpenTeamSettingsDialog();
  }
}
