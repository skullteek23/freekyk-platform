import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CanComponentDeactivate, Guard } from '@shared/guards/can-deactivate-guard.service';
import { CreateSeasonComponent } from '../create-season/create-season.component';

@Component({
  selector: 'app-create-season-container',
  templateUrl: './create-season-container.component.html',
  styleUrls: ['./create-season-container.component.scss']
})
export class CreateSeasonContainerComponent implements OnInit, CanComponentDeactivate {

  dialogRef: MatDialogRef<CreateSeasonComponent>;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.dialogRef = this.dialog.open(CreateSeasonComponent, {
      panelClass: 'extra-large-dialogs',
      disableClose: true,
      closeOnNavigation: true,
      data: params
    });
  }

  canDeactivate(): Guard {
    const response = window.confirm('Are you sure you want to exit?').valueOf();
    if (response && this.dialogRef) {
      this.dialogRef.close();
    }
    return response;
  };
}
