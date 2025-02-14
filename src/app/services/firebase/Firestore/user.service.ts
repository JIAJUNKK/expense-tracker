import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}

  async storeUser(uid: string, userData: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, userData);
      console.log('User stored successfully in Firestore');

      const storedUser = await getDoc(userRef);
      if (storedUser.exists()) {
        return { uid, ...storedUser.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error storing user in Firestore:', error);
      return null;
    }
  }
}
