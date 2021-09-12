import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { JourneyService } from 'src/app/services/journey.service';
import { YOUTUBE_REGEX } from 'src/app/shared/Constants/REGEX';
import { FsTrick, journeyVideo } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-da-fs-trick-description',
  templateUrl: './da-fs-trick-description.component.html',
  styleUrls: ['./da-fs-trick-description.component.css'],
})
export class DaFsTrickDescriptionComponent implements OnInit {
  @Input('selectedTrick') Trick: FsTrick = {
    trickNo: 1,
    trick_name_sh: 'atw',
    trickSkillLvl: 1,
    trick_desc:
      'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',
    trickHelpVideo: 'https://www.youtube.com/watch?v=mXo_I0hUoyg',
  };
  selectedPreview: string = 'K630UusINQY';
  trickLinkForm: FormGroup;
  constructor(private journeyServ: JourneyService) {
    this.trickLinkForm = new FormGroup({
      link: new FormControl(null, [
        Validators.required,
        Validators.pattern(YOUTUBE_REGEX),
      ]),
    });
  }
  ngOnInit(): void {}
  extractVideoUrl(videoLink: string) {
    if (videoLink != null || videoLink != undefined)
      return videoLink.split('v=')[1].substring(0, 11);
  }
  onAddVideo() {
    const trickSubmission: journeyVideo = {
      ...this.Trick,
      submissionLink: this.trickLinkForm.value.link,
    };
    this.saveVideo(trickSubmission);
  }
  saveVideo(subm: journeyVideo) {
    this.journeyServ.AddJourneyVideo(subm);
    this.trickLinkForm.reset();
  }
}
