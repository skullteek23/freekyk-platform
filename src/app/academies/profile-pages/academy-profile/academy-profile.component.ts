import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AcadRegisterDialogComponent } from '../../dialogs/acad-register-dialog/acad-register-dialog.component';

@Component({
  selector: 'app-academy-profile',
  templateUrl: './academy-profile.component.html',
  styleUrls: ['./academy-profile.component.css'],
})
export class AcademyProfileComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private snackbarServ: SnackbarService,
    private enlServ: EnlargeService
  ) {}
  ngOnInit(): void {}
  onRegister() {
    this.dialog
      .open(AcadRegisterDialogComponent, {
        panelClass: 'fk-dialogs',
      })
      .afterClosed()
      .subscribe((status) => {
        if (status == 'success')
          this.snackbarServ.displayCustomMsg(
            'Successfully sent! We will contact you shortly'
          );
        else if (status == 'error') this.snackbarServ.displayError();
      });
  }
  onEnlargePhoto(path: string) {
    this.enlServ.onOpenPhoto(path);
  }
}
