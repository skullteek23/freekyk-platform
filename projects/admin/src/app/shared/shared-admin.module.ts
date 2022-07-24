import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material.module';
import { MatchCardAdminComponent } from '../dialogs/match-card-admin/match-card-admin.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { FixtureBasicComponent } from './components/fixture-basic/fixture-basic.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NoItemsMessageComponent } from './components/no-items-message/no-items-message.component';
import { PhotoUploaderComponent } from './components/photo-uploader/photo-uploader.component';
import { NumberToAMPMPipe } from './pipes/number-to-ampm.pipe';

@NgModule({
  declarations: [
    NoItemsMessageComponent,
    MatchCardAdminComponent,
    LoadingComponent,
    FixtureBasicComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe
  ],
  imports: [CommonModule, AppMaterialModule, ReactiveFormsModule],
  exports: [
    NoItemsMessageComponent,
    MatchCardAdminComponent,
    LoadingComponent,
    FixtureBasicComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe
  ],
})
export class SharedAdminModule { }
