import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material.module';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NoItemsMessageComponent } from './components/no-items-message/no-items-message.component';
import { PhotoUploaderComponent } from './components/photo-uploader/photo-uploader.component';
import { TickAnimationComponent } from './components/tick-animation/tick-animation.component';
import { NumberToAMPMPipe } from './pipes/number-to-ampm.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmationBoxComponent } from './components/confirmation-box/confirmation-box.component';
import { TextShortenPipe } from './pipes/text-shorten.pipe';

@NgModule({
  declarations: [
    NoItemsMessageComponent,
    LoadingComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe,
    TickAnimationComponent,
    ConfirmationBoxComponent,
    TextShortenPipe
  ],
  imports: [CommonModule, AppMaterialModule, ReactiveFormsModule, FlexLayoutModule],
  exports: [
    NoItemsMessageComponent,
    LoadingComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe,
    TickAnimationComponent,
    ConfirmationBoxComponent,
    TextShortenPipe
  ],
})
export class SharedAdminModule { }
