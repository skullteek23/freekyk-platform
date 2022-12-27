import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<LogoutComponent>
  ) { }

  ngOnInit(): void { }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.onCloseDialog();
  }

  onLogout(): void {
    this.authService.onLogout();
    this.onCloseDialog();
  }
}
