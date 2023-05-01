import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageApiService {

  constructor(
    private ngFirebaseStorage: AngularFireStorage
  ) { }

  getPublicUrl(file: File, path: string): Promise<any> {
    if (file && path) {
      return this.upload(file, path);
    }
  }

  private async upload(file: File, path: string): Promise<any> {
    const url = (await this.ngFirebaseStorage.upload(path, file)).ref.getDownloadURL();
    return url;
  }
}
