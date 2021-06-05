import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent implements OnInit {
  constructor(
    private authServ: AuthService,
    public dialogRef: MatDialogRef<LogoutComponent>
  ) {}
  ngOnInit(): void {}
  onCloseDialog() {
    this.dialogRef.close();
  }
  onCancel() {
    this.onCloseDialog();
  }
  onLogout() {
    this.authServ.onLogout();
    this.onCloseDialog();
  }
}
