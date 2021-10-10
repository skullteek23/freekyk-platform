import { NgModule } from '@angular/core';
import { FreestyleRoutingModule } from './freestyle-routing.module';
import { FreestyleComponent } from './freestyle.component';
import { FsHomeComponent } from './fs-home/fs-home.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [FreestyleComponent, FsHomeComponent],
  imports: [SharedModule, FreestyleRoutingModule],
  exports: [],
})
export class FreestyleModule {}
