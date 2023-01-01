import { NgModule } from '@angular/core';
import { FreestyleRoutingModule } from './freestyle-routing.module';
import { FreestyleComponent } from './freestyle.component';
import { FsHomeComponent } from './fs-home/fs-home.component';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@shared/material.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [FreestyleComponent, FsHomeComponent],
  imports: [
    CommonModule, SharedModule, FreestyleRoutingModule, MaterialModule, FlexLayoutModule],
  exports: [],
})
export class FreestyleModule { }
