import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material.module';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { FixtureBasicComponent } from './components/fixture-basic/fixture-basic.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NoItemsMessageComponent } from './components/no-items-message/no-items-message.component';
import { PhotoUploaderComponent } from './components/photo-uploader/photo-uploader.component';
import { TickAnimationComponent } from './components/tick-animation/tick-animation.component';
import { NumberToAMPMPipe } from './pipes/number-to-ampm.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    NoItemsMessageComponent,
    LoadingComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe,
    TickAnimationComponent,
    FixtureBasicComponent
  ],
  imports: [CommonModule, AppMaterialModule, ReactiveFormsModule, FlexLayoutModule],
  exports: [
    NoItemsMessageComponent,
    LoadingComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe,
    TickAnimationComponent,
    FixtureBasicComponent
  ],
})
export class SharedAdminModule { }
