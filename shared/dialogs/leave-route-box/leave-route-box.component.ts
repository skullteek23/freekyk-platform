import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-leave-route-box',
  templateUrl: './leave-route-box.component.html',
  styleUrls: ['./leave-route-box.component.scss'],
})
export class LeaveRouteBoxComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LeaveRouteBoxComponent>
  ) { }

  ngOnInit(): void { }

  onCloseDialog(response: boolean = false): void {
    this.dialogRef.close(response);
  }
}
