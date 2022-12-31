import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ISocialGroupConfig {
  name: string;
  link: string;
  image: string;
}

@Component({
  selector: 'app-social-group',
  templateUrl: './social-group.component.html',
  styleUrls: ['./social-group.component.scss']
})
export class SocialGroupComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SocialGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public options: ISocialGroupConfig,
  ) { }

  ngOnInit(): void {
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

}
