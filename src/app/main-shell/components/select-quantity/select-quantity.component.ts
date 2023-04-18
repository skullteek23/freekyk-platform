import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';

@Component({
  selector: 'app-select-quantity',
  templateUrl: './select-quantity.component.html',
  styleUrls: ['./select-quantity.component.scss']
})
export class SelectQuantityComponent implements OnInit {

  quantity: number = 1;

  constructor(
    public dialogRef: MatDialogRef<SelectQuantityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  ) { }

  ngOnInit(): void { }

  onCloseDialog(quantity: number): void {
    this.dialogRef.close(quantity);
  }

  close(): void {
    this.dialogRef.close();
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increment() {
    if (this.quantity < this.data) {
      this.quantity++;
    }
  }


}
