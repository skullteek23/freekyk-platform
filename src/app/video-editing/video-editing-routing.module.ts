import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VideoEditingComponent } from './video-editing.component';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: VideoEditingComponent }]),
  ],
  exports: [RouterModule],
})
export class VideoEditingRoutingModule {}
