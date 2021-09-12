import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContestService } from 'src/app/services/contest.service';
import { YOUTUBE_REGEX } from 'src/app/shared/Constants/REGEX';

@Component({
  selector: 'app-add-submission',
  templateUrl: './add-submission.component.html',
  styleUrls: ['./add-submission.component.css'],
})
export class AddSubmissionComponent implements OnInit {
  videoForm: FormGroup;
  constructor(private contServ: ContestService) {
    this.videoForm = new FormGroup({
      videoUrl: new FormControl(null, [
        Validators.required,
        Validators.pattern(YOUTUBE_REGEX),
      ]),
    });
  }

  ngOnInit(): void {}
  onSubmit() {
    if (this.videoForm.valid)
      this.contServ.addContestSubmission(this.videoForm.value['videoUrl']);
    this.onCloseBox();
  }
  onCloseBox() {
    this.contServ.onShowForm(false);
  }
}
