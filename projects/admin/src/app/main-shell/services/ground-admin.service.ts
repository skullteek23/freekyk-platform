import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { DAYS } from '@shared/constants/constants';
import { GroundBasicInfo, GroundMoreInfo, GroundPrivateInfo, GroundTimings, IGroundAvailability, IGroundDetails } from '@shared/interfaces/ground.model';
import * as _ from 'lodash';

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
    const groundDetails: IGroundDetails = JSON.parse(sessionStorage.getItem('groundDetails'));
    const groundAvailability: IGroundAvailability = JSON.parse(sessionStorage.getItem('groundAvailability'));
    const uid = sessionStorage.getItem('uid');
    if (groundDetails && groundAvailability && groundAvailability.length && groundID && uid) {
      const ground: GroundBasicInfo = {
        name: groundDetails.name,
        locCity: groundDetails.location.city,
        locState: groundDetails.location.state,
        fieldType: groundDetails.fieldType,
        ownType: groundDetails.type,
        playLvl: groundDetails.playLvl,
      }
      const groundContract: GroundPrivateInfo = {
        contractStartDate: new Date(groundDetails.contract.start).getTime(),
        contractEndDate: new Date(groundDetails.contract.end).getTime(),
        timings: this.getTimings(groundAvailability)
      }
      const groundMore: GroundMoreInfo = {
        referee: groundDetails.referee,
        foodBev: groundDetails.foodBev,
        parking: groundDetails.parking,
        goalpost: groundDetails.goalpost,
        washroom: groundDetails.washroom,
        staff: groundDetails.staff,
      }
      const allPromises = [];
      allPromises.push(this.ngFire.collection('grounds').doc(groundID).set(ground));
      allPromises.push(this.ngFire.collection('groundDetails').doc(groundID).set(groundMore));
      allPromises.push(this.ngFire.collection('groundContracts').doc(groundID).set(groundContract));
      return Promise.all(allPromises);
    }
  }

  getTimings(value: IGroundAvailability): any {
    const timings: Partial<GroundTimings> = {};
    const groupedObj = _.groupBy(value, 'day');
    for (let i = 0; i < 7; i++) {
      if (groupedObj.hasOwnProperty(DAYS[i])) {
        (timings[i] as number[]) = groupedObj[DAYS[i]].map(el => el.hour);
      }
    }
    return timings;
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
