import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EnlargeMediaComponent } from '@shared/dialogs/enlarge-media/enlarge-media.component';

@Injectable({
  providedIn: 'root',
})
export class EnlargeService {
  private mediaConfig = {
    panelClass: 'fullscreen',
    backdropClass: 'blackBackground',
    disableClose: false,
    hasBackdrop: true,
    restoreFocus: false,
  };
  onOpenPhoto(url: string): void {
    this.dialog.open(EnlargeMediaComponent, {
      data: { media: 'image', path: url },
      ...this.mediaConfig,
    });
  }
  onOpenVideo(url: string): void {
    this.dialog.open(EnlargeMediaComponent, {
      data: { media: 'video', path: this.extractVideoUrl(url) },
      ...this.mediaConfig,
    });
  }
  private extractVideoUrl(url: string): string {
    if (url != null || url !== undefined) {
      return url.split('v=')[1].substring(0, 11);
    }
  }
  private sanitizeVideoUrl(url: string): SafeResourceUrl {
    if (url != null || url !== undefined) {
      return this.domSanServ.bypassSecurityTrustResourceUrl(url);
    }
  }
  constructor(private dialog: MatDialog, private domSanServ: DomSanitizer) { }
}
