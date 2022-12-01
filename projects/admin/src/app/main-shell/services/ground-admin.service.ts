import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { GroundBasicInfo, GroundPrivateInfo, IGroundAvailability, IGroundDetails } from '@shared/interfaces/ground.model';

@Injectable({
  providedIn: 'root'
})
export class GroundAdminService {
  private selectedContractFile: File;
  private selectedImageFile: File;

  constructor(
    private ngFire: AngularFirestore,
    private ngStorage: AngularFireStorage
  ) { }

  registerGround(groundID: string): Promise<any> {
    console.log('registering', groundID);
    const groundDetails: IGroundDetails = JSON.parse(sessionStorage.getItem('groundDetails'));
    const groundAvailability: IGroundAvailability = JSON.parse(sessionStorage.getItem('groundAvailability'));
    const uid = sessionStorage.getItem('uid');
    if (groundDetails && groundAvailability && groundAvailability.length && groundID && uid) {
      const ground: GroundBasicInfo = {
        name: groundDetails.name,
        locCity: groundDetails.location.city,
        locState: groundDetails.location.state,
        fieldType: 'TURF',
        ownType: groundDetails.type,
        playLvl: 'fair',
      }
      const timings: any = {};
      const groundMore: GroundPrivateInfo = {
        contractStartDate: new Date(groundDetails.contract.start).getTime(),
        contractEndDate: new Date(groundDetails.contract.end).getTime(),
        timings: timings
      }
      const allPromises = [];
      allPromises.push(this.ngFire.collection('grounds').doc(groundID).set(ground));
      allPromises.push(this.ngFire.collection('groundContracts').doc(groundID).set(groundMore));
      return Promise.all(allPromises);
    }
  }

  async uploadGroundDocs(groundID: string): Promise<any> {
    if (!this.selectedImageFile) {
      return Promise.reject({
        message: 'Unable to upload Ground Photo!'
      });
    } else if (this.selectedContractFile) {
      return Promise.reject({
        message: 'Unable to upload Ground Contract File!'
      });
    }
    const imgpath: string = await this.getFileURL(this.selectedImageFile, '/groundImages/');
    const signedContractFileLink: string = await this.getFileURL(this.selectedContractFile, '/groundContracts/');
    const allPromises = [];
    if (imgpath) {
      allPromises.push(this.ngFire.collection('grounds').doc(groundID).update({ imgpath }));
    }
    if (signedContractFileLink) {
      allPromises.push(this.ngFire.collection('groundContracts').doc(groundID).update({ signedContractFileLink }));
    }
    return Promise.all(allPromises);
  }

  set _selectedContractFile(value: File) {
    this.selectedContractFile = value;
  }
  set _selectedImageFile(value: File) {
    this.selectedImageFile = value;
  }

  async getFileURL(fileObj: File, path: string): Promise<string> {
    if (fileObj && fileObj.name) {
      const snapshot = await this.ngStorage.upload(path + fileObj.name.trim(), fileObj);
      return await snapshot.ref.getDownloadURL();
    }
    return null;
  }

  clearSavedData() {
    sessionStorage.removeItem('groundDetails');
    sessionStorage.removeItem('groundAvailability');
  }
}
