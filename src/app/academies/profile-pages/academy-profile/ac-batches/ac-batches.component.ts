import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AcadRegisterDialogComponent } from 'src/app/academies/dialogs/acad-register-dialog/acad-register-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar.service';
@Component({
  selector: 'app-ac-batches',
  templateUrl: './ac-batches.component.html',
  styleUrls: ['./ac-batches.component.css'],
})
export class AcBatchesComponent implements OnInit {
  acFilter = ['Age Group', 'For Men & Women', 'Starting Price'];
  constructor(
    private dialog: MatDialog,
    private snackbarServ: SnackbarService
  ) {}
  ngOnInit(): void {}
  onBookNow(data: any) {
    const dialogRef = this.dialog
      .open(AcadRegisterDialogComponent, {
        panelClass: 'fk-dialogs',
        data: data,
      })
      .afterClosed()
      .subscribe((status) => {
        if (status == 'success') this.snackbarServ.displaySent();
        else if (status == 'error') this.snackbarServ.displayError();
      });
  }
}
