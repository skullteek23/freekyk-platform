import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-account-avatar',
  templateUrl: './account-avatar.component.html',
  styleUrls: ['./account-avatar.component.scss'],
})
export class AccountAvatarComponent implements OnInit {

  @Input() dataImg: string = null;
  @Input() margins = true;

  constructor() { }

  ngOnInit(): void { }
}
