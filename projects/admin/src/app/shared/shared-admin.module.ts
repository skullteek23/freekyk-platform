import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material.module';
import { MatchCardAdminComponent } from '../dialogs/match-card-admin/match-card-admin.component';
import { FixtureBasicComponent } from './components/fixture-basic/fixture-basic.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NoItemsMessageComponent } from './components/no-items-message/no-items-message.component';
import { PhotoUploaderComponent } from './components/photo-uploader/photo-uploader.component';

@NgModule({
  declarations: [
    NoItemsMessageComponent,
    MatchCardAdminComponent,
    LoadingComponent,
    FixtureBasicComponent,
    PhotoUploaderComponent
  ],
  imports: [CommonModule, AppMaterialModule, ReactiveFormsModule],
  exports: [
    NoItemsMessageComponent,
    MatchCardAdminComponent,
    LoadingComponent,
    FixtureBasicComponent,
    PhotoUploaderComponent
  ],
})
export class SharedAdminModule { }
