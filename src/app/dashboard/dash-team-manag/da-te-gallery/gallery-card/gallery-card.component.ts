import { Component, Input, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-gallery-card',
  templateUrl: './gallery-card.component.html',
  styleUrls: ['./gallery-card.component.scss'],
})
export class GalleryCardComponent implements OnInit {

  @Input() photos: string[] = [];

  constructor(
    private teamService: TeamService
  ) { }

  ngOnInit(): void { }

  onOpenTeamGallery(): void {
    this.teamService.onOpenTeamGalleryDialog();
  }
}
