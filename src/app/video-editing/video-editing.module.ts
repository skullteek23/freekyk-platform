import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { VideoEditingComponent } from './video-editing.component';
import { VeHeroSectionComponent } from './ve-hero-section/ve-hero-section.component';
import { VideoEditingRoutingModule } from './video-editing-routing.module';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { VeProjectComponent } from './dialogs/ve-project/ve-project.component';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    VideoEditingComponent,
    VeHeroSectionComponent,
    VeProjectComponent,
  ],
  imports: [
    // VideoEditingMaterialModule,
    VideoEditingRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    YouTubePlayerModule,
  ],
})
export class VideoEditingModule {}
