import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@shared/material.module';
import { SharedModule } from '@shared/shared.module';
import { EquipmentRoutingModule } from './equipment-routing.module';
import { EquipmentComponent } from './equipment.component';
import { ProductProfileComponent } from './profile-pages/product-profile/product-profile.component';

@NgModule({
  declarations: [EquipmentComponent, ProductProfileComponent],
  imports: [MaterialModule, CommonModule, SharedModule, EquipmentRoutingModule],
  exports: [],
})
export class EquipmentModule { }
